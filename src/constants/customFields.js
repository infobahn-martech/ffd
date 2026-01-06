// constants/customFields.js

export const CUSTOM_FIELDS = [
    "Customer Reference",
    "Internal Notes",
    "Priority Level",
    "Dock Side",
    "Additional Instructions",
    "Agent Contact",
    "Vessel Nickname",
];

export const getCustomFieldDescription = (fieldName) => {
    switch (fieldName) {
        case "Customer Reference":
            return "Reference code or ID provided by the customer.";
        case "Internal Notes":
            return "Notes visible only to internal team members.";
        case "Priority Level":
            return "Indicates the urgency or importance of the record.";
        case "Dock Side":
            return "Specifies which side of the dock is used.";
        case "Additional Instructions":
            return "Extra handling or operational instructions.";
        case "Agent Contact":
            return "Contact details of the assigned agent.";
        case "Vessel Nickname":
            return "Short name / alias used for the vessel.";
        default:
            return `Custom field used for ${fieldName?.toLowerCase?.() || "this record"}.`;
    }
};


export const CUSTOM_FIELD_TYPES = [
    "Text",
    "Textarea",
    "Number",
    "Decimal",
    "Email",
    "Phone",
    "Date",
    "Date & Time",
    "Dropdown",
    "Multi Select",
    "Checkbox",
    "Toggle / Switch",
    "Radio",
    "File Upload",
    "Image Upload",
];