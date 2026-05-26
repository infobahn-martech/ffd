const padDateTimePart = (value) => String(value).padStart(2, "0");

const toValidDate = (value) => {
  if (!value) return null;

  const parsedValue = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? null : parsedValue;
};

export const buildApiDateTime = (dateValue, timeValue = "00:00") => {
  if (!dateValue) return "";

  const time = timeValue || "00:00";
  return `${dateValue} ${time}`;
};

export const splitApiDateTimeParts = (dateValue, timeValue = "") => {
  if (!dateValue) return { date: "", time: "" };

  const dateText = String(dateValue);
  const directMatch = dateText.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}))?/);

  if (directMatch) {
    return {
      date: directMatch[1],
      time: directMatch[2] || String(timeValue || "").slice(0, 5),
    };
  }

  const parsedDate = toValidDate(dateValue);
  if (!parsedDate) {
    return {
      date: dateText,
      time: String(timeValue || "").slice(0, 5),
    };
  }

  return {
    date: `${parsedDate.getFullYear()}-${padDateTimePart(parsedDate.getMonth() + 1)}-${padDateTimePart(parsedDate.getDate())}`,
    time: `${padDateTimePart(parsedDate.getHours())}:${padDateTimePart(parsedDate.getMinutes())}`,
  };
};

export const formatDisplayDateTime = (dateValue, timeValue = "") => {
  const { date, time } = splitApiDateTimeParts(dateValue, timeValue);
  if (!date) return "";

  const parsedDate = toValidDate(`${date}T${time || "00:00"}`);
  if (!parsedDate) return date;

  return parsedDate.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(time
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  });
};
