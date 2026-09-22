import { useState } from "react";
import { FiSearch, FiChevronRight, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import SearchableSelect from "../../components/form/SearchableSelect";
import CustomTemplateBuilderModal from "./CustomTemplateBuilderModal";
import { DUMMY_TEMPLATES } from "./customTemplateData";
import "../../design/css/common/CardForm.css";
import "../../design/scss/general.scss";
import "../../design/scss/pages/custom-template/custom-template-builder.scss";
import "../../design/scss/pages/custom-template/custom-template-list.scss";

function TemplateListCard({ template, isActive, onSelect, onDelete }) {
    const tabCount = template.tabs?.length ?? 0;
    return (
        <div className={`ctl-template-card ${isActive ? "is-active" : ""}`} onClick={onSelect}>
            <span className={`ctl-template-checkbox ${isActive ? "is-checked" : ""}`} aria-hidden="true" />
            <div className="ctl-template-card-body">
                <span className="ctl-template-name">{template.name}</span>
                <span className="ctl-template-meta">
                    {template.billingEntityLabel} · {tabCount} tab{tabCount === 1 ? "" : "s"}
                </span>
            </div>
            <button
                type="button"
                className="ctl-template-delete-btn"
                aria-label="Delete template"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
                <FiTrash2 size={14} />
            </button>
            <FiChevronRight size={16} className="ctl-template-arrow" />
        </div>
    );
}

// Renders a working control for a field so the preview reads (and behaves)
// like the actual Import/Export/Domestic call tab. Values are local to the
// DOM only — nothing is persisted.
function FieldPreviewControl({ field }) {
    const [fileName, setFileName] = useState("");
    const [selectValue, setSelectValue] = useState("");
    const isFull = field.type === "textarea";

    const renderControl = () => {
        switch (field.type) {
            case "dropdown":
                return (
                    <SearchableSelect
                        className="ctl-preview-dropdown"
                        value={selectValue}
                        onChange={(e) => setSelectValue(e.target.value)}
                        options={field.options ?? []}
                        placeholder="Select option..."
                        noResultsText="No options configured"
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                    />
                );
            case "date":
                return (
                    <div className="cf-input">
                        <input type="date" aria-label={field.label} />
                    </div>
                );
            case "time":
                return (
                    <div className="cf-input">
                        <input type="time" aria-label={field.label} />
                    </div>
                );
            case "datetime":
                return (
                    <div className="cf-input">
                        <input type="datetime-local" aria-label={field.label} />
                    </div>
                );
            case "file":
                return (
                    <label className="cf-input ctl-preview-file">
                        <input
                            type="file"
                            className="ctl-preview-file-input"
                            aria-label={field.label}
                            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                        />
                        <span className={`ctl-preview-placeholder ${fileName ? "has-file" : ""}`}>
                            {fileName || "Choose file..."}
                        </span>
                    </label>
                );
            case "textarea":
                return (
                    <div className="cf-input ctl-preview-textarea">
                        <textarea rows={3} placeholder="Enter text..." aria-label={field.label} />
                    </div>
                );
            case "number":
                return (
                    <div className="cf-input">
                        <input type="number" placeholder={field.label} aria-label={field.label} />
                    </div>
                );
            case "email":
                return (
                    <div className="cf-input">
                        <input type="email" placeholder={field.label} aria-label={field.label} />
                    </div>
                );
            default:
                return (
                    <div className="cf-input">
                        <input type="text" placeholder={field.label} aria-label={field.label} />
                    </div>
                );
        }
    };

    // Checkbox / radio fields render inline (box + label) on their own row, like
    // the real card form, instead of a label above a bordered input.
    if (field.type === "checkbox" || field.type === "radio") {
        return (
            <label className="cf-field ctl-preview-field is-full ctl-preview-check">
                <input type={field.type} className="ctl-preview-check-input" />
                <span className="ctl-preview-check-label">
                    {field.label}
                    {field.required && <span className="ctl-preview-required-mark">*</span>}
                </span>
            </label>
        );
    }

    return (
        <div className={`cf-field ctl-preview-field ${isFull ? "is-full" : ""}`}>
            <label>
                {field.label}
                {field.required && <span className="ctl-preview-required-mark">*</span>}
            </label>
            {renderControl()}
        </div>
    );
}

function CustomTemplateListModal({ show, onClose }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [templates, setTemplates] = useState(DUMMY_TEMPLATES);
    const [selectedId, setSelectedId] = useState(DUMMY_TEMPLATES[0]?.id ?? null);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [activeSubTabIndex, setActiveSubTabIndex] = useState(0);
    const [deleteRequestId, setDeleteRequestId] = useState(null);
    const [builderOpen, setBuilderOpen] = useState(false);
    const [builderInitialTemplate, setBuilderInitialTemplate] = useState(null);

    const filteredTemplates = templates.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
    const selectedTemplate = templates.find((t) => t.id === selectedId) ?? null;
    const activeTab = selectedTemplate?.tabs?.[activeTabIndex] ?? null;
    const hasSubTabs = Array.isArray(activeTab?.subTabs);
    const activeSubTab = hasSubTabs ? (activeTab.subTabs[activeSubTabIndex] ?? activeTab.subTabs[0]) : null;
    const fieldsToShow = hasSubTabs ? (activeSubTab?.fields ?? []) : (activeTab?.fields ?? []);

    const handleSelectTemplate = (id) => {
        setSelectedId(id);
        setActiveTabIndex(0);
        setActiveSubTabIndex(0);
    };

    const handleSelectTab = (idx) => {
        setActiveTabIndex(idx);
        setActiveSubTabIndex(0);
    };

    const handleConfirmDelete = () => {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteRequestId));
        if (selectedId === deleteRequestId) {
            setSelectedId(null);
            setActiveTabIndex(0);
        }
        setDeleteRequestId(null);
    };

    const handleCreateClick = () => {
        setBuilderInitialTemplate(null);
        setBuilderOpen(true);
    };

    const mapEditField = (f) => ({
        label: f.label,
        type: f.type,
        required: f.required,
        options: f.options ?? [],
    });

    const handleEditClick = () => {
        if (!selectedTemplate) return;
        setBuilderInitialTemplate({
            name: selectedTemplate.name,
            billingEntityId: "",
            tabs: selectedTemplate.tabs.map((tab) => ({
                name: tab.name,
                fields: (tab.fields ?? []).map(mapEditField),
                subTabs: (tab.subTabs ?? []).map((sub) => ({
                    name: sub.name,
                    fields: (sub.fields ?? []).map(mapEditField),
                })),
            })),
        });
        setBuilderOpen(true);
    };

    if (!show) return null;

    return (
        <>
            <div className="cardform-overlay ctl-modal-overlay">
                    <div className="cardform-panel">
                        <div className="cardform-topbar ctl-modal-topbar">
                            <div>
                                <span className="ctl-topbar-title">Custom Templates List</span>
                            </div>
                            <div className="cardform-topbar-right">
                                <button type="button" className="cardform-close-btn" onClick={onClose}>✕</button>
                            </div>
                        </div>

                        <div className="ctl-split-body">
                            <div className="ctl-split-left">
                                <div className="ctl-left-top">
                                    <button type="button" className="ctl-create-btn" onClick={handleCreateClick}>
                                        <FiPlus size={14} /> Create Custom Template
                                    </button>
                                    <div className="ctl-search-box">
                                        <FiSearch size={14} className="ctl-search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search templates"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="ctl-split-scroll-area">
                                    <div className="ctl-template-list">
                                        {filteredTemplates.length === 0 ? (
                                            <p className="ctl-list-empty">No templates found.</p>
                                        ) : (
                                            filteredTemplates.map((tpl) => (
                                                <TemplateListCard
                                                    key={tpl.id}
                                                    template={tpl}
                                                    isActive={tpl.id === selectedId}
                                                    onSelect={() => handleSelectTemplate(tpl.id)}
                                                    onDelete={() => setDeleteRequestId(tpl.id)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="ctl-split-right ctl-preview-panel">
                                {selectedTemplate ? (
                                    <div className="ctl-preview-card">
                                        <div className="ctl-preview-card-header">
                                            <div className="ctl-preview-heading">
                                                <span className="ctl-preview-title">{selectedTemplate.name}</span>
                                                <span className="ctl-preview-entity"> · Billing Entity: {selectedTemplate.billingEntityLabel}</span>
                                            </div>
                                            <button type="button" className="ctl-edit-btn" onClick={handleEditClick}>
                                                <FiEdit2 size={13} /> Edit Template
                                            </button>
                                        </div>

                                        <div className="cardform-tabs ctl-preview-tabs">
                                            {selectedTemplate.tabs.map((tab, idx) => (
                                                <button
                                                    key={tab.name}
                                                    type="button"
                                                    className={`tab ${idx === activeTabIndex ? "active" : ""}`}
                                                    onClick={() => handleSelectTab(idx)}
                                                >
                                                    {tab.name}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="ctl-preview-body">
                                            {hasSubTabs && (
                                                <aside className="ctl-preview-subnav">
                                                    {activeTab.subTabs.map((sub, idx) => (
                                                        <button
                                                            key={sub.name}
                                                            type="button"
                                                            className={`ctl-preview-subnav-item ${idx === activeSubTabIndex ? "is-active" : ""}`}
                                                            onClick={() => setActiveSubTabIndex(idx)}
                                                        >
                                                            {sub.name}
                                                        </button>
                                                    ))}
                                                </aside>
                                            )}

                                            <div className="ctl-preview-fields-scroll">
                                                {fieldsToShow.length > 0 ? (
                                                    <div className="ctl-preview-form-grid">
                                                        {fieldsToShow.map((field, idx) => (
                                                            <FieldPreviewControl key={idx} field={field} />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="ctl-preview-empty">No fields in this tab.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="ctl-preview-placeholder">
                                        <p>Select a template from the list to preview its structure.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ctm-footer">
                            <span className="ctm-required-note">{templates.length} template{templates.length === 1 ? "" : "s"}</span>
                        </div>
                    </div>
            </div>

            {builderOpen && (
                <div className="ctl-nested-builder">
                    <CustomTemplateBuilderModal
                        show={builderOpen}
                        onClose={() => setBuilderOpen(false)}
                        initialTemplate={builderInitialTemplate}
                    />
                </div>
            )}

            {!!deleteRequestId && (
                <DeleteConfirmationModal
                    show={!!deleteRequestId}
                    onCancel={() => setDeleteRequestId(null)}
                    onConfirm={handleConfirmDelete}
                    deleteText="Delete this template? This cannot be undone."
                    className="ctl-delete-confirm-modal"
                    backdropClassName="ctl-delete-confirm-backdrop"
                />
            )}
        </>
    );
}

export default CustomTemplateListModal;
