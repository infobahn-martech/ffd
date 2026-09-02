/**
 * TEMPORARY DEV-ONLY MOCK DATA — see src/mocks/ffd/index.js for the on/off switch.
 *
 * "Job window" field data (the Job: 12345 mockup — header, cargo/pickup/delivery
 * details, documentation checklist, status timeline, nomination) keyed by `card_id`.
 * Kept in its own file rather than cards.js so the board-card seed stays uncluttered.
 *
 * src/mocks/ffd/index.js merges this onto the matching raw card row at seed time —
 * see seedBoardCards()/fill(). Cards not listed here simply have no `job` field,
 * which is the signal CardForm.jsx's CardDetailsBody uses to fall back to the
 * generic placeholder body (see mapBoardWorkflowFromApi in shared/helpers/data.js).
 *
 * `status.current` is one of STATUS_STEPS' keys (src/pages/KanbanBoard/components/
 * cards/components/shared/CardParts/JobWindow/jobStatusSteps.js) — the vertical
 * Status Timeline renders every step up to and including this one as complete.
 */

export const jobDetailsByCardId = {
  // FFD Commercials — RFQ stage, before a job number exists yet.
  "comm-card-1": {
    numbers: { rfq_number: "RFQ-1042", quotation_number: null, job_number: null },
  },

  // FFD Operations Board — one representative card per column, walking the
  // status timeline further along as the column progresses.
  "ffd-card-1": {
    header: {
      mode_of_shipment: "Air",
      job_handover_date: "2026-09-05 09:00",
      type: "Import",
      pickup: true,
      client_name: "Acme Industries",
      location: "1234 King Fahd Rd, Riyadh",
      commercial_poc: "John Doe",
      date_time: "2026-09-05 09:00-12:00",
    },
    cargo: {
      description: "Electronics",
      hs_code: "ABC123456",
      dimensions: "100 x 50 x 70 cm",
      weight: "150 kg",
      packaging: "Cartons",
      condition: "New",
    },
    pickup: {
      location: "1234 King Fahd Rd, Riyadh",
      date_time: "2026-09-05 09:00-12:00",
      contact_person: "Mr. Ali",
      equipment: "3T Truck",
    },
    delivery: {
      location: "Jeddah Port",
      date_time: "2026-09-06 14:00",
      contact_person: "Mr. Fahad",
      mobile: "+966500000001",
    },
    documentation: {
      commercial_invoice: true,
      packing_list: true,
      airway_bill: false,
      certificate_of_origin: false,
      insurance: true,
    },
    status: { current: "pickup_request_sent" },
    nomination: { proposed_party: "XYZ Shipping Line", overridden_party: null },
    numbers: { rfq_number: "RFQ-1042", quotation_number: "QUO-1042", job_number: "SED-AIR-0123" },
  },
  "ffd-card-4": {
    header: {
      mode_of_shipment: "Sea",
      job_handover_date: "2026-09-04 10:00",
      type: "Export",
      pickup: true,
      client_name: "BGP Arabia Co.",
      location: "Jeddah Industrial City",
      commercial_poc: "Sara Al-Fahad",
      date_time: "2026-09-04 10:00-13:00",
    },
    cargo: {
      description: "Machinery parts",
      hs_code: "MCH445210",
      dimensions: "220 x 110 x 95 cm",
      weight: "1,240 kg",
      packaging: "Crated",
      condition: "New",
    },
    pickup: {
      location: "Jeddah Industrial City",
      date_time: "2026-09-04 10:00-13:00",
      contact_person: "Mr. Nasser",
      equipment: "Flatbed Trailer",
    },
    delivery: {
      location: "Jeddah Islamic Port",
      date_time: "2026-09-05 08:00",
      contact_person: "Ms. Huda",
      mobile: "+966500000002",
    },
    documentation: {
      commercial_invoice: true,
      packing_list: true,
      airway_bill: false,
      certificate_of_origin: true,
      insurance: false,
    },
    status: { current: "cargo_received" },
    nomination: { proposed_party: "Maersk Line", overridden_party: null },
    numbers: { rfq_number: "RFQ-1039", quotation_number: "QUO-1039", job_number: "SED-SEA-0124" },
  },
  "ffd-card-8": {
    header: {
      mode_of_shipment: "Air",
      job_handover_date: "2026-09-01 09:00",
      type: "DAP",
      pickup: true,
      client_name: "Gulf Freight Co.",
      location: "Dammam Free Zone",
      commercial_poc: "Omar Khaled",
      date_time: "2026-09-01 09:00-11:00",
    },
    cargo: {
      description: "Auto parts",
      hs_code: "AUT778821",
      dimensions: "80 x 60 x 50 cm",
      weight: "80 kg",
      packaging: "Boxed",
      condition: "New",
    },
    pickup: {
      location: "Dammam Free Zone",
      date_time: "2026-09-01 09:00-11:00",
      contact_person: "Mr. Yousef",
      equipment: "Van",
    },
    delivery: {
      location: "Riyadh, King Fahd Rd",
      date_time: "2026-09-02 16:00",
      contact_person: "Mr. Fahad",
      mobile: "+966500000003",
    },
    documentation: {
      commercial_invoice: true,
      packing_list: true,
      airway_bill: true,
      certificate_of_origin: true,
      insurance: true,
    },
    status: { current: "out_for_delivery" },
    nomination: { proposed_party: "DHL Express", overridden_party: "Aramex" },
    numbers: { rfq_number: "RFQ-1030", quotation_number: "QUO-1030", job_number: "SED-AIR-0119" },
  },
  "ffd-card-12": {
    header: {
      mode_of_shipment: "Sea",
      job_handover_date: "2026-08-28 08:00",
      type: "Import",
      pickup: false,
      client_name: "Al Rashid Trading",
      location: "Shanghai Port",
      commercial_poc: "Wei Zhang",
      date_time: "2026-08-28 08:00-10:00",
    },
    cargo: {
      description: "Furniture",
      hs_code: "FRN331209",
      dimensions: "300 x 200 x 180 cm",
      weight: "12,000 kg",
      packaging: "Palletized",
      condition: "New",
    },
    pickup: {
      location: "Shanghai Port",
      date_time: "2026-08-28 08:00-10:00",
      contact_person: "Ms. Lin",
      equipment: "40ft Container",
    },
    delivery: {
      location: "Jeddah Islamic Port",
      date_time: "2026-09-02 12:00",
      contact_person: "Mr. Fahad",
      mobile: "+966500000004",
    },
    documentation: {
      commercial_invoice: true,
      packing_list: true,
      airway_bill: false,
      certificate_of_origin: true,
      insurance: true,
    },
    status: { current: "delivered" },
    nomination: { proposed_party: "COSCO Shipping", overridden_party: null },
    numbers: { rfq_number: "RFQ-1018", quotation_number: "QUO-1018", job_number: "SED-SEA-0118" },
  },
  "ffd-card-18": {
    header: {
      mode_of_shipment: "Land",
      job_handover_date: "2026-08-20 09:00",
      type: "DDP",
      pickup: true,
      client_name: "Desert Rose LLC",
      location: "Riyadh",
      commercial_poc: "Fatima Noor",
      date_time: "2026-08-20 09:00-11:00",
    },
    cargo: {
      description: "Textiles",
      hs_code: "TXT119032",
      dimensions: "150 x 100 x 90 cm",
      weight: "900 kg",
      packaging: "Bales",
      condition: "New",
    },
    pickup: {
      location: "Riyadh",
      date_time: "2026-08-20 09:00-11:00",
      contact_person: "Mr. Talal",
      equipment: "3T Truck",
    },
    delivery: {
      location: "Dubai",
      date_time: "2026-08-21 15:00",
      contact_person: "Mr. Rashid",
      mobile: "+966500000005",
    },
    documentation: {
      commercial_invoice: true,
      packing_list: false,
      airway_bill: false,
      certificate_of_origin: false,
      insurance: false,
    },
    status: { current: "pickup_request_sent" },
    nomination: { proposed_party: null, overridden_party: null },
    numbers: { rfq_number: "RFQ-1010", quotation_number: "QUO-1010", job_number: "SED-LAND-0091" },
  },

  // FFD Billing Board — later lifecycle stage, further along the status timeline.
  "bill-card-3": {
    header: {
      mode_of_shipment: "Air",
      job_handover_date: "2026-08-15 09:00",
      type: "Export",
      pickup: true,
      client_name: "Nova Logistics",
      location: "Jeddah Airport Cargo",
      commercial_poc: "Layla Hassan",
      date_time: "2026-08-15 09:00-10:00",
    },
    cargo: {
      description: "Medical equipment",
      hs_code: "MED220145",
      dimensions: "60 x 40 x 40 cm",
      weight: "45 kg",
      packaging: "Boxed",
      condition: "New",
    },
    pickup: {
      location: "Jeddah Airport Cargo",
      date_time: "2026-08-15 09:00-10:00",
      contact_person: "Mr. Bilal",
      equipment: "Van",
    },
    delivery: {
      location: "Dubai Airport Cargo",
      date_time: "2026-08-15 18:00",
      contact_person: "Ms. Aisha",
      mobile: "+966500000006",
    },
    documentation: {
      commercial_invoice: true,
      packing_list: true,
      airway_bill: true,
      certificate_of_origin: true,
      insurance: true,
    },
    status: { current: "pod_uploaded" },
    nomination: { proposed_party: "Emirates SkyCargo", overridden_party: null },
    numbers: { rfq_number: "RFQ-0998", quotation_number: "QUO-0998", job_number: "SED-AIR-0098" },
  },
};
