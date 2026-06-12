/**
 * UI preview — mirrors expected API shapes for checklist_by_* and get_checklist_by_id.
 */

export const MOCK_CHECKLIST_TYPE_ROWS = [
  { checklist_type_id: 101, checklist_name: "Pre-Entry Safety Review" },
  { checklist_type_id: 102, checklist_name: "Port Clearance & Documents" },
];

const mkItem = (idSuffix, name, extra = {}) => ({
  checklist_item_id: idSuffix,
  item_name: name,
  item_description: extra.description ?? "",
  expiry_date_reqd: extra.expiry ? "1" : "0",
  document_details: {
    description: extra.docDesc ?? "",
    require_copy_only: extra.copyOnly ?? false,
    notes: extra.notes,
    uploaded_files: extra.files ?? [],
  },
});

export const MOCK_CHECKLIST_BY_ID = {
  status: "success",
  checklist_details: {
    checklist_name: "Pre-Entry Safety Review",
    call_type: "Domestic",
    port_name: "Abu Dhabi",
    vessel_type: "Container",
    barge_type: null,
    created_at: "2025-12-01T10:00:00Z",
  },
  data: [
    {
      checklist_section_id: 1,
      title: "Vessel & cargo",
      items: [
        mkItem(1, "Crew list", { description: "Master-signed crew list for this port call." }),
        mkItem(2, "Stowage plan", {
          copyOnly: true,
          files: [{ name: "stowage_plan.pdf", size: 120400, file_id: 9 }],
        }),
      ],
      sub_sections: [
        {
          checklist_section_id: 11,
          title: "Hazardous cargo (if any)",
          items: [
            mkItem(3, "MSDS pack", { docDesc: "Original required for hazardous goods.", expiry: true }),
            mkItem(4, "IMDG declaration", { docDesc: "Format attached for company template." }),
          ],
        },
      ],
    },
    {
      checklist_section_id: 2,
      title: "Port & agent",
      items: [mkItem(5, "NOA / NOR", { description: "Notice of arrival as filed with the port." })],
      sub_sections: [],
    },
  ],
};
