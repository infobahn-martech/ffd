/**
 * API may return coordinates as strings or { coordinates_id, value }.
 */

export function isCoordinatePairObject(item) {
    return item != null && typeof item === "object" && "value" in item;
}

export function coordinatePairDisplay(item) {
    if (item == null || item === "") return "";
    if (isCoordinatePairObject(item)) return String(item.value ?? "").trim();
    return String(item).trim();
}

/** Table / tooltip: join display values. */
export function formatCoordinatesList(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) return "—";
    const parts = coordinates.map(coordinatePairDisplay).filter(Boolean);
    return parts.length ? parts.join("; ") : "—";
}

/** Form rows for useFieldArray. */
export function mapApiCoordinatesToFormRows(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
        return [{ value: "", coordinates_id: "" }];
    }
    return coordinates.map((c) => {
        if (isCoordinatePairObject(c)) {
            return {
                value: String(c.value ?? ""),
                coordinates_id:
                    c.coordinates_id != null && c.coordinates_id !== ""
                        ? String(c.coordinates_id)
                        : "",
            };
        }
        return { value: String(c ?? ""), coordinates_id: "" };
    });
}
