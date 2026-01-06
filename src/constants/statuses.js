// src/constants/statuses.js

// All available status names (used for dummy listing & dropdowns etc.)
export const STATUS_OPTIONS = [
    "Pending",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
    "Rejected",
];

// Optional: module / type options if you want to reuse in dropdowns
export const STATUS_MODULE_OPTIONS = [
    "Global",
    "Husbandry",
    "Transport",
    "Crew",
    "Warehouse",
];

// Small helper to show default descriptions in the table
export const getStatusDescription = (status) => {
    const map = {
        Pending: "Created but not started yet.",
        "In Progress": "Work is currently ongoing.",
        "On Hold": "Temporarily paused; waiting for inputs.",
        Completed: "All work is finished.",
        Cancelled: "Stopped and will not continue.",
        Rejected: "Not approved or failed review.",
    };

    return map[status] || "";
};
