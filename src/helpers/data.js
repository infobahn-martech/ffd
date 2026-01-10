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
      "col-1": 18, // Appointment Received
      "col-2": 18,  // Enroute
      "col-3": 18,  // Vessel Arrived
      "col-4": 18, // Vessel Cleared
      "col-5": 18, // Vessel Sailed
      "col-6": 18, // Ready to Fianalize
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
      "col-1": 12, // Appointment Received
      "col-2": 12,  // Enroute
      "col-3": 12,  // Vessel Arrived
      "col-4": 11, // Vessel Cleared
      "col-5": 12, // Vessel Sailed
      "col-6": 11, // Ready to Fianalize
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

  const cardData = {
    id,
    title: `CARD – ${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"][
      Math.floor(Math.random() * 8)
    ]} ${2025 + Math.floor(Math.random() * 2)}`,
    name: customerNames[Math.floor(Math.random() * customerNames.length)],
    user: drivers[Math.floor(Math.random() * drivers.length)],
    timeLeft: `${Math.floor(Math.random() * 90)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(
      Math.random() * 60
    )}m`,
    progress: Math.floor(Math.random() * 100),
    color: randomColor,
    iconType: randomIconType,   // ⭐ Added here
    priority: cardId === 1, // Only first item has priority true
    vesselName: vesselNames[Math.floor(Math.random() * vesselNames.length)],
    transport: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    transportCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
    hotel: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    hotelCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
    medicalService: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    medicalServiceCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
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
