import PropTypes from "prop-types";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import "./SearchableSelect.scss";

const defaultGetOptionLabel = (opt) => (opt && opt.label != null ? String(opt.label) : "");
const defaultGetOptionValue = (opt) => (opt && opt.value != null ? String(opt.value) : "");

/** Derive e.g. "Search port..." from "Select port" */
export const deriveSearchPlaceholder = (placeholder) => {
  if (!placeholder || String(placeholder).trim() === "") return "Search...";
  const trimmed = String(placeholder).trim();
  const m = /^Select\s+(.+)$/i.exec(trimmed);
  if (m) return `Search ${m[1]}...`;
  return `Search ${trimmed}...`;
};

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder,
  searchPlaceholder: searchPlaceholderProp,
  className = "",
  disabled = false,
  hasError = false,
  getOptionLabel = defaultGetOptionLabel,
  getOptionValue = defaultGetOptionValue,
  menuZIndex = 10000,
  noResultsText = "No results found",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const activeOptionRef = useRef(null);

  const normalizedValue = value === undefined || value === null ? "" : String(value);
  const searchPlaceholder = searchPlaceholderProp ?? deriveSearchPlaceholder(placeholder);

  const selectedOption = useMemo(
    () => options.find((opt) => String(getOptionValue(opt)) === normalizedValue),
    [options, normalizedValue, getOptionValue]
  );
  const displayLabel = selectedOption ? getOptionLabel(selectedOption) : "";

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(q));
  }, [options, searchQuery, getOptionLabel]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex((prev) => {
      if (filteredOptions.length === 0) return 0;
      return Math.min(prev, filteredOptions.length - 1);
    });
  }, [filteredOptions.length, isOpen]);

  useEffect(() => {
    if (!isOpen || filteredOptions.length === 0) return;
    const el = activeOptionRef.current;
    if (el && typeof el.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen, filteredOptions.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (optionValue) => {
      const syntheticEvent = {
        target: { value: optionValue },
      };
      onChange(syntheticEvent);
      setIsOpen(false);
      setSearchQuery("");
      setActiveIndex(0);
    },
    [onChange]
  );

  const handleTriggerAreaClick = () => {
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
      setSearchQuery("");
      setActiveIndex(0);
    }
  };

  const handleArrowClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen((prev) => {
      if (prev) {
        setSearchQuery("");
      }
      return !prev;
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setActiveIndex(0);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredOptions.length === 0) return;
      setActiveIndex((i) => Math.min(filteredOptions.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filteredOptions[activeIndex];
      if (opt) {
        handleSelect(getOptionValue(opt));
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div
      className={`cf-multi-select-email cf-searchable-select ${disabled ? "disabled" : ""} ${hasError ? "is-invalid" : ""} ${className}`}
      ref={dropdownRef}
      style={{ "--cf-searchable-menu-z": String(menuZIndex) }}
    >
      <div
        className={`cf-multi-select-email-input ${disabled ? "disabled" : ""}`}
        onClick={handleTriggerAreaClick}
        style={{ pointerEvents: disabled ? "none" : "auto" }}
      >
        <div className="cf-multi-select-email-tags">
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              className="cf-searchable-select-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleInputKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder={searchPlaceholder}
              disabled={disabled}
              aria-autocomplete="list"
              aria-expanded={isOpen}
              autoComplete="off"
            />
          ) : displayLabel ? (
            <span className="cf-multi-select-selected-value">{displayLabel}</span>
          ) : (
            <span className="cf-multi-select-placeholder">{placeholder || "Select..."}</span>
          )}
        </div>
        <span
          className="cf-multi-select-arrow"
          onClick={handleArrowClick}
          role="presentation"
        >
          ▼
        </span>
      </div>
      {isOpen && (
        <div className="cf-multi-select-dropdown">
          {filteredOptions.length === 0 ? (
            <div className="cf-multi-select-no-results">{noResultsText}</div>
          ) : (
            filteredOptions.map((option, index) => {
              const optVal = getOptionValue(option);
              const isSelected = normalizedValue === String(optVal);
              const isHighlighted = index === activeIndex;
              return (
                <div
                  key={`${String(optVal)}-${index}`}
                  ref={isHighlighted ? activeOptionRef : null}
                  className={`cf-multi-select-option ${isSelected ? "selected" : ""} ${isHighlighted ? "is-highlighted" : ""}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(optVal);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <span>{getOptionLabel(option)}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

SearchableSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
  menuZIndex: PropTypes.number,
  noResultsText: PropTypes.string,
};

export default SearchableSelect;
