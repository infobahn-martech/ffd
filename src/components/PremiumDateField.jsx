import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PREMIUM_DATEPICKER_PROPS = {
    dateFormat: "dd/MM/yyyy",
    placeholderText: "dd/mm/yyyy",
    className: "form-control premium-date-input",
    popperClassName: "premium-datepicker-popper",
    calendarClassName: "premium-datepicker-calendar",
    showPopperArrow: false,
};

function parseISODate(value) {
    if (!value) return null;
    const raw = String(value);
    const normalized = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : raw;
    const [year, month, day] = normalized.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

function toISODate(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export default function PremiumDateField({
    control,
    name,
    label,
    rules,
    error,
    required = false,
}) {
    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
                <div
                    className={`form-floating desig-inp premium-date-field ${field.value ? "has-value" : ""}`}
                >
                    <DatePicker
                        {...PREMIUM_DATEPICKER_PROPS}
                        selected={parseISODate(field.value)}
                        onChange={(date) => field.onChange(toISODate(date))}
                    />
                    <label>
                        {label} {required ? <span className="text-danger">*</span> : null}
                    </label>
                    {error ? <span className="error text-danger">{error.message}</span> : null}
                </div>
            )}
        />
    );
}
