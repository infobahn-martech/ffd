// Static dummy template data for the Custom Templates modals.
// Billing entities come from BillingEntityReducer (see CustomTemplateBuilderModal).

// Appointment Details is identical across all three call types, matching the
// real Sedres Appointment Details tab (General.jsx) at /kanban-board/:id.
const buildAppointmentDetailsTab = () => ({
    name: "Appointment Details",
    fields: [
        { label: "Owner", type: "dropdown", required: false },
        { label: "Appointment Email", type: "file", required: false },
        { label: "Appointment Type", type: "dropdown", required: true },
        { label: "Appointment Received", type: "datetime", required: true },
        { label: "Call Type", type: "dropdown", required: true },
        { label: "Port", type: "dropdown", required: true },
        { label: "Expected Time of Arrival", type: "datetime", required: true },
        { label: "Expected Time of Departure", type: "datetime", required: false },
        { label: "Last Port", type: "text", required: false },
        { label: "Vessel Type", type: "dropdown", required: false },
        { label: "Vessel Name", type: "text", required: true },
        { label: "Billing Entity", type: "dropdown", required: true },
        { label: "Vessel Owner", type: "text", required: false },
        { label: "Vessel Charterer", type: "text", required: false },
        { label: "Vessel Manager", type: "text", required: false },
        { label: "Checklist", type: "dropdown", required: false },
        { label: "Assigned Operator", type: "dropdown", required: false },
        { label: "Service Requestor Name", type: "text", required: false },
        { label: "Service Requestor Email", type: "email", required: false },
        { label: "Daily Report Emails", type: "text", required: false },
        { label: "Billing Instructions", type: "textarea", required: false },
    ],
});

// Tabs not detailed in the dummy data still appear (for the 9-tab count / tab row)
// but carry no fields yet.
const buildTrailingEmptyTabs = () => [
    { name: "Husbandry", fields: [] },
    { name: "Sales Order", fields: [] },
    { name: "Reports", fields: [] },
    { name: "Document Library", fields: [] },
    { name: "Comments", fields: [] },
    { name: "Subtasks", fields: [] },
    { name: "Notes", fields: [] },
];

export const DUMMY_TEMPLATES = [
    {
        id: "tpl-import-call",
        name: "Import Call",
        billingEntityLabel: "General",
        tabs: [
            buildAppointmentDetailsTab(),
            {
                name: "Operation",
                subTabs: [
                    {
                        name: "Pre Arrival",
                        fields: [
                            { label: "Expected Time of Arrival", type: "datetime", required: false },
                            { label: "Expected Commencement of Custom Inspection", type: "datetime", required: false },
                            { label: "Expected Commencement of Immigration Clearance for Crew", type: "datetime", required: false },
                            { label: "Expected Completion of Inward Clearance", type: "datetime", required: false },
                            { label: "SABER Status", type: "dropdown", required: false },
                            { label: "Weather Forecast", type: "dropdown", required: false },
                            { label: "Coordinates Type", type: "dropdown", required: false },
                        ],
                    },
                    {
                        name: "Crew Immigration",
                        fields: [
                            { label: "Crew Immigration Commenced", type: "datetime", required: false },
                            { label: "Crew Immigration Completed", type: "datetime", required: false },
                            { label: "Crew Immigration Status", type: "dropdown", required: false },
                        ],
                    },
                    {
                        name: "Arrival",
                        fields: [
                            { label: "Actual Time of Arrival", type: "datetime", required: false },
                            { label: "Custom Inspection Commenced", type: "datetime", required: false },
                            { label: "Custom Inspection Completed", type: "datetime", required: false },
                            { label: "Custom Clearance Time", type: "text", required: false },
                            { label: "Vessel Inward Formalities Completed", type: "datetime", required: false },
                            { label: "Custom Inspection Status", type: "dropdown", required: false },
                            { label: "Inward Clearance", type: "dropdown", required: false },
                        ],
                    },
                    {
                        name: "Departure",
                        fields: [
                            { label: "Email Requested Accept", type: "checkbox", required: false },
                            { label: "Outward Clearance Delivered", type: "datetime", required: false },
                            { label: "Next Port", type: "text", required: false },
                            { label: "Attachments", type: "file", required: false },
                        ],
                    },
                    {
                        name: "Check List",
                        fields: [
                            { label: "Checklist Completion Status", type: "dropdown", required: false },
                        ],
                    },
                ],
            },
            ...buildTrailingEmptyTabs(),
        ],
    },
    {
        id: "tpl-export-call",
        name: "Export Call",
        billingEntityLabel: "General",
        tabs: [
            buildAppointmentDetailsTab(),
            {
                name: "Operation",
                subTabs: [
                    { name: "Pre Arrival", fields: [] },
                    { name: "Crew Immigration", fields: [] },
                    { name: "Arrival", fields: [] },
                    {
                        name: "Departure",
                        fields: [
                            { label: "Expected Time of Departure", type: "datetime", required: true },
                            { label: "Email Requested Accept", type: "file", required: false },
                            { label: "Outward Clearance Delivered", type: "dropdown", required: false },
                            { label: "Next Port", type: "text", required: false },
                            { label: "Departure Attachments", type: "file", required: false },
                            { label: "Vessel Outward Formalities Completed", type: "datetime", required: false },
                        ],
                    },
                    { name: "Check List", fields: [] },
                ],
            },
            ...buildTrailingEmptyTabs(),
        ],
    },
    {
        id: "tpl-domestic-call",
        name: "Domestic Call",
        billingEntityLabel: "General",
        tabs: [
            buildAppointmentDetailsTab(),
            {
                name: "Operation",
                subTabs: [
                    {
                        name: "Pre Arrival",
                        fields: [
                            { label: "Expected Time of Arrival", type: "datetime", required: false },
                            { label: "Port", type: "dropdown", required: false },
                        ],
                    },
                    { name: "Crew Immigration", fields: [] },
                    {
                        name: "Arrival",
                        fields: [
                            { label: "Actual Time of Arrival", type: "datetime", required: false },
                            { label: "Vessel Name", type: "text", required: false },
                            { label: "Assigned Operator", type: "dropdown", required: false },
                        ],
                    },
                    {
                        name: "Departure",
                        fields: [
                            { label: "Expected Time of Departure", type: "datetime", required: false },
                            { label: "Actual Time of Departure", type: "datetime", required: false },
                            { label: "Next Port", type: "text", required: false },
                            { label: "Attachments", type: "file", required: false },
                            { label: "Remarks", type: "textarea", required: false },
                        ],
                    },
                    { name: "Check List", fields: [] },
                ],
            },
            ...buildTrailingEmptyTabs(),
        ],
    },
];

