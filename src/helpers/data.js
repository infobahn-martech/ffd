// ============================================
// WORKFLOW CONFIGURATION
// ============================================
// Add or modify workflows here - each workflow will appear as a separate accordion

const workflowsConfig = [
  {
    id: "workflow-1",
    title: "Cards workflow",
    columnColors: {
      "col-1": "#2666be",
      "col-2": "#2666be",
      "col-3": "#f38a30",
      "col-4": "#f38a30",
      "col-5": "#f38a30",
      "col-6": "#f38a30",
      "col-7": "#42af49",
    },
    columnTitles: [
      "Appointment Received",
      "Enroute",
      "Vessel Arrived",
      "Vessel Cleared",
      "Vessel on Standby",
      "Vessel Sailed",
      "Ready to Fianalize",
    ],
    cardCounts: {
      "col-1": 18, // Appointment Received
      "col-2": 18,  // Enroute
      "col-3": 18,  // Vessel Arrived
      "col-4": 18, // Vessel Cleared
      "col-5": 18, // Vessel on Standby
      "col-6": 18, // Vessel Sailed
      "col-7": 18, // Ready to Fianalize
    },
    wipLimits: {
      "col-1": 25,
      "col-2": 25,
      "col-3": 25,
      "col-4": 25,
      "col-5": 25,
      "col-6": 25,
      "col-7": 25,
    },
  },
  {
    id: "workflow-2",
    title: "Cards workflow 2",
    columnColors: {
      "col-1": "#2666be",
      "col-2": "#2666be",
      "col-3": "#f38a30",
      "col-4": "#f38a30",
      "col-5": "#f38a30",
      "col-6": "#42af49",
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
    wipLimits: {
      "col-1": 20,
      "col-2": 20,
      "col-3": 20,
      "col-4": 20,
      "col-5": 20,
      "col-6": 20,
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

  const colorOptions = [
    "#34a97b",
    "#7333bd",
    "#e6186a",
    "#f37325",
    "#af0020",
    "#607d8b",
    "#336633",]

  // Random color
  const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

  // ⭐ Random icon assigned permanently
  const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];

  const id = `${workflowId}-card-${cardId}`;

  const customerNames = [
    "Gulf Marine",
    "Saudi Marcap",
    "Snamprogetti",
    "Saipem",
    "Lamprell"
  ];
  const ports = ["DAM", "JED", "RUH", "JUB", "RAS", "YAN"];
  const vesselNames = [
    "Atlantic Star",
    "Pacific Wave",
    "Indian Ocean",
    "Mediterranean",
    "Caribbean Breeze",
    "Ocean Express",
    "Blue Horizon",
    "Sea Voyager",
    "Trade Wind",
    "Golden Gate",
    "Northern Star",
    "Southern Cross",
    "Eastern Dawn",
    "Western Tide",
    "Central Bay"
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

  // Footer status icons: random subset per card (1–5 icons, including link)
  const footerIconKeys = ["priority", "subtasks", "deadline", "watchers", "link"];
  const footerIconCount = Math.floor(Math.random() * 5) + 1; // 1, 2, 3, 4, or 5
  const shuffledKeys = [...footerIconKeys].sort(() => Math.random() - 0.5);
  const footerShowIcons = shuffledKeys.slice(0, footerIconCount);

  // Extra-details icons: random subset per card (1–6 icons)
  const extraDetailsKeys = ["transport", "hotel", "medical", "material", "waste", "launch"];
  const extraDetailsCount = Math.floor(Math.random() * 6) + 1; // 1, 2, 3, 4, 5, or 6
  const shuffledExtra = [...extraDetailsKeys].sort(() => Math.random() - 0.5);
  const extraDetailsShowIcons = shuffledExtra.slice(0, extraDetailsCount);

  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
  const cardData = {
    id,
    title: `CARD – ${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"][
      Math.floor(Math.random() * 8)
    ]} ${2025 + Math.floor(Math.random() * 2)}`,
    name: customerName,
    user: drivers[Math.floor(Math.random() * drivers.length)],
    timeLeft: `${Math.floor(Math.random() * 90)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(
      Math.random() * 60
    )}m`,
    progress: Math.floor(Math.random() * 100),
    color: randomColor,
    iconType: randomIconType,   // ⭐ Added here
    priority: cardId === 1, // Only first item has priority true
    vesselName: vesselNames[Math.floor(Math.random() * vesselNames.length)],
    port: ports[Math.floor(Math.random() * ports.length)],
    priorityLevel: ["H", "M", "L"][Math.floor(Math.random() * 3)],
    transport: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    transportCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
    hotel: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    hotelCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
    medicalService: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    medicalServiceCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
    materialManagement: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    wasteDisposal: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    launchHire: ["done", "rejected", "inProgress"][Math.floor(Math.random() * 3)],
    // Footer-1 status icons (priority, subtasks, deadline, watchers, link) – random subset per card
    footerShowIcons,
    // Extra-details icons (transport, hotel, medical, material, waste, launch) – random subset per card
    extraDetailsShowIcons,
    footerSubtasks: Math.floor(Math.random() * 5) + 1,
    footerDeadline: `${Math.floor(Math.random() * 30) + 1}d`,
    footerWatchers: Math.floor(Math.random() * 5) + 1,
    footerLinkCount: Math.floor(Math.random() * 5), // linked cards count (0–4)
  };

  return { id, cardData };
};

// Helper function to create a workflow
const createWorkflow = (workflowConfig) => {
  const { id, columnColors, columnTitles, cardCounts, wipLimits = {} } = workflowConfig;
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
      wipLimit: wipLimits[colId] ?? null,
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
