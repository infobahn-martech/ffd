// ============================================
// WORKFLOW CONFIGURATION
// ============================================
// Add or modify workflows here - each workflow will appear as a separate accordion

const workflowsConfig = [
  {
    id: "workflow-1",
    title: "Cards workflow",
    columnColors: {
      "col-1": "rgb(226 16 108)",
      "col-2": "rgb(121 21 188)",
      "col-3": "rgb(62 94 189)",
      "col-4": "rgb(65 178 74)",
      "col-5": "rgb(119 86 73)",
      "col-6": "rgb(237 142 55)",
    },
    columnTitles: [
      "Appointment Received",
      "Enroute",
      "Vessel Arrived",
      "Vessel Cleared",
      "Vessel Sailed",
      "Ready to Fianalize",
    ],
    cardCounts: {
      "col-1": 25, // Appointment Received
      "col-2": 3,  // Enroute
      "col-3": 5,  // Vessel Arrived
      "col-4": 25, // Vessel Cleared
      "col-5": 25, // Vessel Sailed
      "col-6": 25, // Ready to Fianalize
    },
  },
  {
    id: "workflow-2",
    title: "Cards workflow 2",
    columnColors: {
      "col-1": "rgb(226 16 108)",
      "col-2": "rgb(121 21 188)",
      "col-3": "rgb(62 94 189)",
      "col-4": "rgb(65 178 74)",
      "col-5": "rgb(119 86 73)",
      "col-6": "rgb(237 142 55)",
    },
    columnTitles: [
      "Appointment Received",
      "Enroute",
      "Vessel Arrived",
      "Vessel Cleared",
      "Vessel Sailed",
      "Ready to Fianalize",
    ],
    cardCounts: {
      "col-1": 20, // Appointment Received
      "col-2": 5,  // Enroute
      "col-3": 8,  // Vessel Arrived
      "col-4": 15, // Vessel Cleared
      "col-5": 10, // Vessel Sailed
      "col-6": 12, // Ready to Fianalize
    },
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

let globalCardId = 1;

// Icon pool
const iconTypes = ["inprogress", "download", "document"];

// Helper function to generate a single card
const generateCard = (workflowId, colId, cardId) => {
  const workflow = workflowsConfig.find(w => w.id === workflowId);
  const colorPool = Object.values(workflow.columnColors);

  // Random color
  const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];

  // ⭐ Random icon assigned permanently
  const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];

  const id = `${workflowId}-card-${cardId}`;

  const customerNames = [
    "ABC Shipping Co.",
    "Global Logistics Ltd.",
    "Maritime Transport Inc.",
    "Ocean Freight Solutions",
    "International Cargo Group",
    "ABCD",
    "BNMJ",
    "XYZ Logistics",
    "Pacific Shipping",
    "Atlantic Maritime",
    "Continental Freight",
    "Worldwide Cargo",
    "Express Shipping Co.",
    "Premium Logistics",
    "United Transport"
  ];
  const vesselNames = [
    "MV Atlantic Star",
    "SS Pacific Wave",
    "MV Indian Ocean",
    "SS Mediterranean",
    "MV Caribbean Breeze",
    "MV Ocean Express",
    "SS Blue Horizon",
    "MV Sea Voyager",
    "SS Trade Wind",
    "MV Golden Gate",
    "SS Northern Star",
    "MV Southern Cross",
    "SS Eastern Dawn",
    "MV Western Tide",
    "SS Central Bay"
  ];
  const drivers = [
    "John Smith",
    "Michael Johnson",
    "David Williams",
    "Robert Brown",
    "James Davis",
    "William Miller",
    "Richard Wilson",
    "Joseph Moore",
    "Thomas Taylor",
    "Christopher Anderson",
    "Daniel Martinez",
    "Matthew Jackson",
    "Anthony White",
    "Mark Harris",
    "Donald Clark"
  ];
  const times = [
    "09:00 AM",
    "02:30 PM",
    "11:15 AM",
    "04:45 PM",
    "08:00 AM",
    "01:20 PM",
    "10:30 AM",
    "03:15 PM",
    "06:00 AM",
    "12:45 PM",
    "05:30 PM",
    "07:20 AM"
  ];

  // Generate random date for lastMoved (within last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime()));
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const sapSalesOrders = [
    "3023192",
    "3025500",
    "3023193",
    "3025501",
    "3023194",
    "3025502",
    "3023195",
    "3025503"
  ];
  const srtPoWbsOptions = [
    "SRT-001|PO-12345|WBS-ABC",
    "SRT-002|PO-67890|WBS-XYZ",
    "SRT-003|PO-11111|WBS-DEF",
    "SRT-004|PO-22222|WBS-GHI"
  ];
  const appointmentEmails = [
    "appointment@shipping.com",
    "booking@logistics.com",
    "schedule@maritime.com",
    "appt@cargo.com",
    "booking@express.com"
  ];
  const serviceRequesters = [
    "John Smith",
    "Michael Johnson",
    "David Williams",
    "Robert Brown",
    "James Davis"
  ];

  const statuses = [
    "Pre Arrival",
    "Custom Inspection",
    "Crew Immigration",
    "Vessel Inward Formalities",
    "Marine Work Permit",
    "SABER UT Closed",
    "Outward Clearance",
    "Vessel Sailed",
    "Ops Completed",
    "SO Approval",
    "Invoice Issued",
    "Submitted",
    "Confirmattion Received",
    "Closed"
  ];

  const cardData = {
    id,
    code: (100140 + cardId).toString(),
    user: ["Sarim Asaf", "Zimba Ray", "Alex Ford", "Alif Allen", "Daniel Joe"][
      Math.floor(Math.random() * 5)
    ],
    title: `CARD – ${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"][
      Math.floor(Math.random() * 8)
    ]} ${2025 + Math.floor(Math.random() * 2)}`,
    days: Math.floor(Math.random() * 300) + 20,
    timeLeft: `${Math.floor(Math.random() * 90)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(
      Math.random() * 60
    )}m`,
    progress: Math.floor(Math.random() * 100),
    color: randomColor,
    iconType: randomIconType,   // ⭐ Added here
    priority: cardId === 1, // Only first item has priority true
    // New fields matching second image
    lastMoved: formatDate(randomDate),
    sapSalesOrder: sapSalesOrders[Math.floor(Math.random() * sapSalesOrders.length)],
    srtPoWbs: srtPoWbsOptions[Math.floor(Math.random() * srtPoWbsOptions.length)],
    appointmentEmail: appointmentEmails[Math.floor(Math.random() * appointmentEmails.length)],
    vesselName: vesselNames[Math.floor(Math.random() * vesselNames.length)],
    serviceRequester: serviceRequesters[Math.floor(Math.random() * serviceRequesters.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  };

  return { id, cardData };
};

// Helper function to create a workflow
const createWorkflow = (workflowConfig) => {
  const { id, columnColors, columnTitles, cardCounts } = workflowConfig;
  const columns = {};
  const cards = {};
  let cardId = 1;

  // Initialize all columns first
  for (let i = 0; i < columnTitles.length; i++) {
    const colId = `col-${i + 1}`;
    columns[colId] = {
      id: `${id}-${colId}`,
      title: columnTitles[i],
      cardIds: [],
      color: columnColors[colId],
    };
  }

  // Create cards for each column based on cardCounts
  for (let colIndex = 0; colIndex < columnTitles.length; colIndex++) {
    const colId = `col-${colIndex + 1}`;
    const count = cardCounts[colId];

    for (let i = 0; i < count; i++) {
      const { id: generatedCardId, cardData } = generateCard(id, colId, cardId);
      cards[generatedCardId] = cardData;
      columns[colId].cardIds.push(generatedCardId);
      cardId++;
      globalCardId++;
    }
  }

  return {
    id,
    title: workflowConfig.title,
    columns,
    columnOrder: Object.keys(columns),
    cards,
  };
};

// Generate all workflows
const workflows = workflowsConfig.map(createWorkflow);

// Export initial data as an array of workflows
export const initialData = workflows;

// Export workflows config for easy modification
export { workflowsConfig };
