import { useEffect, useState, useCallback } from "react";
import { FiX } from "react-icons/fi";
import useCallTypeReducer from "../../store/CallTypeReducer";
import "../../design/css/common/CardForm.css";
import "../../design/scss/pages/callTypeBuilder.scss";

const FIELD_TYPES = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "dropdown", label: "Dropdown" },
    { value: "checkbox", label: "Checkbox" },
];

const PLACEHOLDER_MAP = {
    text: "Enter text...",
    number: "0",
    date: "dd/mm/yyyy",
    dropdown: "Select option",
    checkbox: "",
};

function PreviewField({ field }) {
    const label = field.label || "Unnamed Field";
    if (field.type === "checkbox") {
        return (
            <div className="ct-preview-field">
                <span className="ct-preview-field-label">
                    {label}{field.required && <span className="req">*</span>}
                </span>
                <div className="ct-preview-checkbox-mock">
                    <input type="checkbox" readOnly />
                    <span>{label}</span>
                </div>
            </div>
        );
    }
    return (
        <div className="ct-preview-field">
            <span className="ct-preview-field-label">
                {label}{field.required && <span className="req">*</span>}
            </span>
            <div className="ct-preview-input-mock">
                {field.type === "dropdown" ? "Select option ▾" : PLACEHOLDER_MAP[field.type] ?? "Enter value..."}
            </div>
        </div>
    );
}

function CallTypeBuilderModal({ show, onClose }) {
    const {
        getCallTypes, callTypes, isLoadingGet,
        addCallType, updateCallType, deleteCallType,
        isBeingUpdated, isLoadingDelete,
    } = useCallTypeReducer((s) => s);

    const [editingCallType, setEditingCallType] = useState(null);
    const [callTypeName, setCallTypeName] = useState("");
    const [fields, setFields] = useState([]);
    const [nameError, setNameError] = useState("");

    useEffect(() => {
        if (show) getCallTypes({});
    }, [show, getCallTypes]);

    const handleNew = useCallback(() => {
        setEditingCallType(null);
        setCallTypeName("");
        setFields([]);
        setNameError("");
    }, []);

    const handleSelectCallType = (ct) => {
        setEditingCallType(ct);
        setCallTypeName(ct.call_type_name ?? "");
        setFields((ct.fields ?? []).map((f) => ({ ...f, id: Date.now() + Math.random() })));
        setNameError("");
    };

    const addField = () =>
        setFields((prev) => [...prev, { id: Date.now(), label: "", type: "text", required: false }]);

    const removeField = (id) => setFields((prev) => prev.filter((f) => f.id !== id));

    const updateField = (id, key, value) =>
        setFields((prev) => prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)));

    const handleSave = async () => {
        if (!callTypeName.trim()) { setNameError("Call type name is required"); return; }
        setNameError("");
        const payload = {
            call_type_name: callTypeName.trim(),
            fields: fields.map(({ label, type, required }) => ({ label, type, required })),
        };
        if (editingCallType?.call_type_id) {
            await updateCallType({
                formData: { call_type_id: editingCallType.call_type_id, ...payload },
                cb: () => getCallTypes({}),
            });
        } else {
            await addCallType({
                formData: payload,
                cb: () => { handleNew(); getCallTypes({}); },
            });
        }
    };

    const handleDelete = async (e, ct) => {
        e.stopPropagation();
        if (!window.confirm(`Delete "${ct.call_type_name}"?`)) return;
        await deleteCallType(ct.call_type_id);
        if (editingCallType?.call_type_id === ct.call_type_id) handleNew();
        getCallTypes({});
    };

    if (!show) return null;

    const list = Array.isArray(callTypes) ? callTypes : [];
    const isEditMode = !!editingCallType?.call_type_id;

    return (
        <div className="cardform-overlay" style={{ zIndex: 1350 }}>
            <div className="cardform-panel">

                {/* Top bar */}
                <div className="cardform-topbar" style={{ backgroundColor: "#7c3aed" }}>
                    <div>
                        <span className="ct-topbar-title">CALL TYPE BUILDER</span>
                    </div>
                    <div className="cardform-topbar-right">
                        <button type="button" className="ct-modal-close-btn" onClick={onClose}>
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Split body */}
                <div className="ct-split-body">

                    {/* ── Left panel ── */}
                    <div className="ct-split-left">

                        {/* Saved call types */}
                        <div className="ct-saved-section">
                            <div className="ct-saved-header">
                                <span className="ct-saved-label">Saved Call Types</span>
                                <button type="button" className="ct-new-btn" onClick={handleNew}>
                                    + New
                                </button>
                            </div>
                            <div className="ct-saved-list">
                                {isLoadingGet && <div className="ct-saved-empty">Loading...</div>}
                                {!isLoadingGet && list.length === 0 && (
                                    <div className="ct-saved-empty">No call types yet</div>
                                )}
                                {list.map((ct) => (
                                    <div
                                        key={ct.call_type_id}
                                        className={`ct-saved-item ${editingCallType?.call_type_id === ct.call_type_id ? "is-active" : ""}`}
                                        onClick={() => handleSelectCallType(ct)}
                                    >
                                        <div className="ct-saved-dot" />
                                        <span className="ct-saved-name">{ct.call_type_name}</span>
                                        <span className="ct-saved-count">
                                            {Array.isArray(ct.fields) ? ct.fields.length : 0} fields
                                        </span>
                                        <button
                                            type="button"
                                            className="ct-saved-del"
                                            disabled={isLoadingDelete}
                                            onClick={(e) => handleDelete(e, ct)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div className="ct-split-form-area">
                            <div className="form-group">
                                <h3 className="form-group-title">
                                    {isEditMode ? "Edit Call Type" : "New Call Type"}
                                </h3>
                                <div className="cf-field">
                                    <label>Call Type Name <span className="text-danger">*</span></label>
                                    <div className={`cf-input ${nameError ? "is-invalid" : ""}`}>
                                        <input
                                            type="text"
                                            placeholder="e.g. Delivery, Export, Survey..."
                                            value={callTypeName}
                                            onChange={(e) => { setCallTypeName(e.target.value); setNameError(""); }}
                                        />
                                    </div>
                                    {nameError && <div className="text-danger ct-field-error">{nameError}</div>}
                                </div>
                            </div>

                            <div className="form-group">
                                <h3 className="form-group-title">Template Fields</h3>

                                {fields.length === 0 && (
                                    <p className="text-muted small">No fields added yet. Use the button below to define the card template.</p>
                                )}

                                {fields.map((field, idx) => (
                                    <div key={field.id} className="ct-field-row">
                                        <div className="cf-input">
                                            <input
                                                placeholder={`Field ${idx + 1} label`}
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, "label", e.target.value)}
                                            />
                                        </div>
                                        <div className="cf-input">
                                            <select
                                                value={field.type}
                                                onChange={(e) => updateField(field.id, "type", e.target.value)}
                                            >
                                                {FIELD_TYPES.map((ft) => (
                                                    <option key={ft.value} value={ft.value}>{ft.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="ct-field-req-wrap">
                                            <input
                                                type="checkbox"
                                                id={`req-${field.id}`}
                                                checked={field.required}
                                                onChange={(e) => updateField(field.id, "required", e.target.checked)}
                                            />
                                            <label htmlFor={`req-${field.id}`}>Req</label>
                                        </div>
                                        <button type="button" className="ct-field-del" onClick={() => removeField(field.id)}>
                                            &times;
                                        </button>
                                    </div>
                                ))}

                                <button type="button" className="ct-add-field-btn" onClick={addField}>
                                    + Add Field
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="ct-split-footer">
                            <button type="button" className="ct-btn-cancel" onClick={handleNew}>
                                Cancel
                            </button>
                            <button type="button" className="ct-btn-save" disabled={isBeingUpdated} onClick={handleSave}>
                                {isBeingUpdated ? "Saving..." : isEditMode ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>

                    {/* ── Right panel: live preview ── */}
                    <div className="ct-split-right">
                        <div className="form-group">
                            <h3 className="form-group-title">Card Preview</h3>
                            <div className="ct-preview-card">
                                <div className="ct-preview-topbar">
                                    <h4>{callTypeName || "Call Type Name"}</h4>
                                    <span>{fields.length} {fields.length === 1 ? "field" : "fields"}</span>
                                </div>
                                <div className="ct-preview-body">
                                    <p className="ct-preview-section-title">Call Type Template Fields</p>
                                    {fields.length === 0 ? (
                                        <div className="ct-preview-empty">
                                            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
                                                <rect x="8" y="8" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="2" fill="none" />
                                                <path d="M16 18h16M16 24h10M16 30h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                                            </svg>
                                            <p>Add fields on the left to preview the card template here.</p>
                                        </div>
                                    ) : (
                                        <div className="ct-preview-grid">
                                            {fields.map((field) => (
                                                <PreviewField key={field.id} field={field} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CallTypeBuilderModal;
