/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import Select, { components } from 'react-select';
import { Tooltip } from 'react-tooltip';

function CustomSelect({
  showIndicator,
  options = [],
  className,
  classNamePrefix,
  value,
  onChange,
  placeholder = 'Select...',
  isLoading,
  maxheight,
  position = 'auto',
  noOptionsMessage = 'No options available',
  ...rest
}) {
  const { isMulti } = { ...rest };
  const [selectedValue, setSelectedValue] = useState(value);

  // Sync the value prop with the internal selected value (including when options load async)
  useEffect(() => {
    if (value && isMulti) setSelectedValue(value);
    else if (!value) setSelectedValue(null);
    else if (typeof value === 'string' || !value?.value)
      setSelectedValue(
        options.find((option) => option.value === value) || null
      );
    else setSelectedValue(value);
  }, [value, isMulti, options]);

  const handleChange = (selectedOption) => {
    // If clear button clicked, selectedOption is null
    if (!selectedOption) {
      setSelectedValue(isMulti ? [] : null);
      onChange({ value: null }); // Notify parent of cleared selection
    } else {
      // Update selected value and notify parent
      setSelectedValue(selectedOption);
      onChange(isMulti ? selectedOption.map((opt) => opt) : selectedOption);
    }
  };

  const fetchValue = () => {
    if (isMulti) {
      return options.filter((option) => selectedValue?.includes(option.value));
    }
    return (
      options.find((option) => option.value === selectedValue?.value) || null
    );
  };

  // Custom Option component with tooltip
  const CustomOption = (props) => {
    const { data, isSelected } = props;
    const labelRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
      if (labelRef.current) {
        setIsTruncated(
          labelRef.current.offsetWidth < labelRef.current.scrollWidth
        );
      }
    }, [data.label]);

    return (
      <components.Option {...props}>
        <div className="d-flex items-center gap-2">
          {isMulti && (
            <input className='form-check-input' type="checkbox" checked={isSelected} readOnly />
          )}
          <div
            ref={labelRef}
            data-tooltip-id={`tooltip-${data.value}`}
            data-tooltip-content={isTruncated ? data.label : ''}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {data.label}
          </div>
          {isTruncated && <Tooltip id={`tooltip-${data.value}`} place="top" />}
        </div>
      </components.Option>
    );
  };

  return (
    <Select
      menuPortalTarget={document.body}
      menuPosition="fixed"
      menuPlacement={position}
      maxMenuHeight={maxheight}
      isLoading={isLoading}
      classNamePrefix={classNamePrefix}
      value={fetchValue()}
      onChange={handleChange}
      className={`${className} ${isMulti ? 'multiple-select' : ''
        } react-select-container p-1`}
      placeholder={placeholder}
      options={options}
      closeMenuOnSelect={!isMulti ? true : false}
      hideSelectedOptions={false}
      styles={{
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
        menuPortal: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      isClearable
      noOptionsMessage={() => noOptionsMessage}
      components={{
        ...(!showIndicator && {
          DropdownIndicator: () => null,
          IndicatorSeparator: () => null,
        }),
        Option: CustomOption, // Use custom option with tooltip
      }}
      {...rest}
    />
  );
}

export default CustomSelect;
