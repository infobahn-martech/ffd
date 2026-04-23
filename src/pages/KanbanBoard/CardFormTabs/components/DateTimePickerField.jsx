import PropTypes from "prop-types";
import { useMemo, useCallback } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import "../../../../design/scss/general.scss";

const padDateTimePart = (value) => String(value).padStart(2, "0");

const combineDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;
  const [year, month, day] = String(dateValue)
    .split("-")
    .map((part) => Number(part));

  if (!year || !month || !day) return null;

  const [hours = 0, minutes = 0] = String(timeValue || "00:00")
    .split(":")
    .map((part) => Number(part));

  const localDate = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
  return Number.isNaN(localDate.getTime()) ? null : localDate;
};

const splitDateTimeValue = (dateTimeValue) => {
  if (!dateTimeValue) return { date: "", time: "" };

  const parsedValue = dateTimeValue instanceof Date ? dateTimeValue : new Date(dateTimeValue);
  if (Number.isNaN(parsedValue.getTime())) return { date: "", time: "" };

  return {
    date: `${parsedValue.getFullYear()}-${padDateTimePart(parsedValue.getMonth() + 1)}-${padDateTimePart(parsedValue.getDate())}`,
    time: `${padDateTimePart(parsedValue.getHours())}:${padDateTimePart(parsedValue.getMinutes())}`,
  };
};

const formatDisplayDateTime = (dateValue, timeValue) => {
  const combinedDate = combineDateTime(dateValue, timeValue);
  if (!combinedDate) return "";
  return combinedDate.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const DateTimePickerField = ({
  dateValue = "",
  timeValue = "",
  onDateChange,
  onTimeChange,
  onDateTimeChange,
  dateFieldName,
  timeFieldName,
  disabled = false,
  hasError = false,
  placeholder = "Select date and time",
  minDate,
  maxDate,
}) => {
  const selectedValue = useMemo(() => {
    const combinedDate = combineDateTime(dateValue, timeValue);
    return combinedDate ? dayjs(combinedDate) : null;
  }, [dateValue, timeValue]);
  const minDateValue = useMemo(() => (minDate ? dayjs(minDate) : undefined), [minDate]);
  const maxDateValue = useMemo(() => (maxDate ? dayjs(maxDate) : undefined), [maxDate]);

  const handlePickerChange = useCallback(
    (newValue) => {
      const nextValues = splitDateTimeValue(newValue ? newValue.toDate() : null);
      const dateEvent = { target: { name: dateFieldName || "", value: nextValues.date } };
      const timeEvent = { target: { name: timeFieldName || "", value: nextValues.time } };

      if (onDateChange) onDateChange(dateEvent);
      if (onTimeChange) onTimeChange(timeEvent);
      if (onDateTimeChange) onDateTimeChange(nextValues);
    },
    [dateFieldName, onDateChange, onDateTimeChange, onTimeChange, timeFieldName]
  );

  return (
    <div className={`cf-input date-time-row cf-datetime-picker ${hasError ? "is-invalid" : ""}`} title={formatDisplayDateTime(dateValue, timeValue)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          value={selectedValue}
          onChange={handlePickerChange}
          disabled={disabled}
          minDate={minDateValue}
          maxDate={maxDateValue}
          minutesStep={5}
          format="YYYY-MM-DD HH:mm"
          slotProps={{
            textField: {
              placeholder,
              fullWidth: true,
              error: hasError,
              className: "cf-datetime-input-field",
            },
            popper: {
              className: "cf-datetime-popper",
            },
          }}
        />
      </LocalizationProvider>
    </div>
  );
};

DateTimePickerField.propTypes = {
  dateValue: PropTypes.string,
  timeValue: PropTypes.string,
  onDateChange: PropTypes.func,
  onTimeChange: PropTypes.func,
  onDateTimeChange: PropTypes.func,
  dateFieldName: PropTypes.string,
  timeFieldName: PropTypes.string,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
  placeholder: PropTypes.string,
  minDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
  maxDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
};

export default DateTimePickerField;
