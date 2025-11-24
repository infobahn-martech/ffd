import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import { checkListData } from "../../../utils/utils";
import "../../../design/scss/checklist.scss";

const FormField = ({ label, children, className = "" }) => {
  return (
    <div className={`cf-field ${className}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const FormInput = ({ type = "text", value, onChange, placeholder, className = "" }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

const ChecklistItem = ({ id, label, checked, onChange }) => {
  return (
    <div className="checklist-item">
      <label className="checklist-item-label">
        <input
          type="checkbox"
          checked={checked || false}
          onChange={(e) => onChange(id, e.target.checked)}
          className="checklist-checkbox"
        />
        <span className="checklist-item-text">{label}</span>
      </label>
    </div>
  );
};

ChecklistItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

const ChecklistSection = ({ id, title, items, checkedItems, onItemChange, isOpen, onToggle }) => {
  return (
    <div className="checklist-section">
      <button
        type="button"
        className="checklist-section-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className="checklist-section-title">{title}</h3>
        <span className="checklist-accordion-icon">{isOpen ? "▼" : "▶"}</span>
      </button>
      {isOpen && (
        <div className="checklist-items">
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              label={item.label}
              checked={checkedItems[item.id] || false}
              onChange={onItemChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ChecklistSection.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  checkedItems: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

function Checklist({ card, formValues, handleChange }) {
  // Get all items from checkListData for initial state
  const allItems = useMemo(() => {
    return checkListData.flatMap((section) => section.items);
  }, []);

  // State for checklist items
  const [checkedItems, setCheckedItems] = useState(() => {
    const initial = {};
    allItems.forEach((item) => {
      initial[item.id] = card?.checklistItems?.[item.id] || false;
    });
    return initial;
  });

  // State for accordion (which sections are open)
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    checkListData.forEach((section) => {
      initial[section.id] = true; // All sections open by default
    });
    return initial;
  });

  const handleChecklistChange = (id, checked) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSectionToggle = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  return (
    <div className="cardform-body checklist-body">
      <div className="cf-section">
        <div className="cf-section-header">
          <div className="cf-section-icon">
            <span>📋</span>
          </div>
          <div className="cf-section-title">Vessel Information</div>
        </div>
        <div className="cf-section-body">
          <div className="checklist-form">
            <div className="cf-grid two">
              <FormField label="Vessel Name">
                <FormInput
                  type="text"
                  value={formValues.vesselName || card?.vesselName || ""}
                  onChange={handleChange("vesselName")}
                  placeholder="Enter vessel name"
                />
              </FormField>

              <FormField label="Nomination Key">
                <FormInput
                  type="text"
                  value={formValues.nominationKey || card?.nominationKey || ""}
                  onChange={handleChange("nominationKey")}
                  placeholder="Enter nomination key"
                />
              </FormField>

              <FormField label="ETA">
                <FormInput
                  type="datetime-local"
                  value={formValues.eta || card?.eta || ""}
                  onChange={handleChange("eta")}
                />
              </FormField>

              <FormField label="Arrived / Sailed on">
                <FormInput
                  type="datetime-local"
                  value={formValues.arrivedSailedOn || card?.arrivedSailedOn || ""}
                  onChange={handleChange("arrivedSailedOn")}
                />
              </FormField>

              <FormField label="Principal">
                <FormInput
                  type="text"
                  value={formValues.principal || card?.principal || ""}
                  onChange={handleChange("principal")}
                  placeholder="Enter principal"
                />
              </FormField>

              <FormField label="Last Port">
                <FormInput
                  type="text"
                  value={formValues.lastPort || card?.lastPort || ""}
                  onChange={handleChange("lastPort")}
                  placeholder="Enter last port"
                />
              </FormField>

              <FormField label="Next Port">
                <FormInput
                  type="text"
                  value={formValues.nextPort || card?.nextPort || ""}
                  onChange={handleChange("nextPort")}
                  placeholder="Enter next port"
                />
              </FormField>
            </div>
          </div>
        </div>
      </div>

      <div className="cf-section">
        <div className="cf-section-header">
          <div className="cf-section-icon">
            <span>✅</span>
          </div>
          <div className="cf-section-title">Checklist Items</div>
        </div>
        <div className="cf-section-body">
          {checkListData.map((section) => (
            <ChecklistSection
              key={section.id}
              id={section.id}
              title={section.title}
              items={section.items}
              checkedItems={checkedItems}
              onItemChange={handleChecklistChange}
              isOpen={openSections[section.id] || false}
              onToggle={() => handleSectionToggle(section.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

Checklist.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Checklist;

