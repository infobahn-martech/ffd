import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";

const ChecklistMultiSelect = ({
  value = [],
  onChange,
  options = [],
  placeholder,
  className = "",
  cardColor = "#2A00FF",
  disabled = false,
  id: domId = "cl-type-multiselect",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleToggle = (optionValue) => {
    const normalizedOptionValue = String(optionValue).trim();
    const normalizedValues = value.map((item) => String(item).trim());
    const newValue = normalizedValues.includes(normalizedOptionValue)
      ? normalizedValues.filter((item) => item !== normalizedOptionValue)
      : [...normalizedValues, normalizedOptionValue];
    onChange({ target: { value: newValue } });
  };

  const handleRemoveTag = (e, optionValue) => {
    e.stopPropagation();
    const normalizedOptionValue = String(optionValue).trim();
    onChange({
      target: { value: value.filter((v) => String(v).trim() !== normalizedOptionValue) },
    });
  };

  const getOptionLabel = (optionValue) => {
    const normalizedValue = String(optionValue).trim();
    const option = options.find((opt) => String(opt.value).trim() === normalizedValue);
    // Never surface the raw id — options can momentarily lag selection during merges.
    return option?.label || `Checklist ${normalizedValue}`;
  };

  return (
    <div
      className={`cf-multiselect cl-type-multiselect-fallback ${className} ${disabled ? "disabled" : ""}`}
      ref={dropdownRef}
      style={{ "--card-color": cardColor }}
      id={domId}
    >
      <div
        className="cf-multiselect-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1 }}
        role="combobox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        <div className="cf-multiselect-tags">
          {value.length === 0 ? (
            <span className="cf-multiselect-placeholder">{placeholder || "Select options…"}</span>
          ) : (
            value.map((val) => (
              <span key={val} className="cf-multiselect-tag" style={{ "--card-color": cardColor }}>
                <span className="cf-multiselect-tag-text">{getOptionLabel(val)}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="cf-multiselect-tag-remove"
                    onClick={(e) => handleRemoveTag(e, val)}
                    aria-label={`Remove ${getOptionLabel(val)}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        <span className="cf-multiselect-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="cf-multiselect-dropdown" style={{ "--card-color": cardColor }}>
          {options.map((option) => {
            const normalizedOptionValue = String(option.value).trim();
            const isSelected = value
              .map((item) => String(item).trim())
              .includes(normalizedOptionValue);
            return (
              <div
                key={option.value}
                className={`cf-multiselect-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleToggle(option.value)}
              >
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

ChecklistMultiSelect.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  cardColor: PropTypes.string,
  disabled: PropTypes.bool,
  id: PropTypes.string,
};

export default ChecklistMultiSelect;
