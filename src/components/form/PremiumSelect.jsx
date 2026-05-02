import PropTypes from "prop-types";
import SearchableSelect, { deriveSearchPlaceholder } from "./SearchableSelect";
import "./PremiumSelect.scss";

/** Default z-index above Bootstrap modal stacking (~1055–1060). */
export const PREMIUM_SELECT_MODAL_Z_INDEX = 11000;

/**
 * Thin wrapper around SearchableSelect for master/admin modals — consistent
 * premium styling (see PremiumSelect.scss) and safe stacking inside modals.
 */
export default function PremiumSelect({
  value,
  onChange,
  options = [],
  placeholder,
  searchPlaceholder,
  disabled = false,
  hasError = false,
  className = "",
  menuZIndex = PREMIUM_SELECT_MODAL_Z_INDEX,
  noResultsText,
  ...rest
}) {
  const mergedClass = ["premium-select", className].filter(Boolean).join(" ");
  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder ?? deriveSearchPlaceholder(placeholder)}
      disabled={disabled}
      hasError={hasError}
      className={mergedClass}
      menuZIndex={menuZIndex}
      noResultsText={noResultsText}
      {...rest}
    />
  );
}

PremiumSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array,
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  className: PropTypes.string,
  menuZIndex: PropTypes.number,
  noResultsText: PropTypes.string,
};
