const columnColors = {
  "col-1": "#2A00FF",
  "col-2": "#6C5CE7",
  "col-3": "#E17055",
  "col-4": "#00B894",
  "col-5": "#0984E3",
};

const columnTitles = [
  "Appointment Received",
  "Execute",
  "Vessel Arrived",
  "Vessel Cleared",
  "Vessel Sailed",
];

const columns = {};
const cards = {};

let cardId = 1;

// Color pool
const colorPool = Object.values(columnColors);

// Icon pool
const iconTypes = ["inprogress", "download", "document"];

for (let i = 0; i < 150; i++) {
  const colIndex = i % columnTitles.length;
  const colId = `col-${colIndex + 1}`;

  if (!columns[colId]) {
    columns[colId] = {
      id: colId,
      title: columnTitles[colIndex],
      cardIds: [],
      color: columnColors[colId],
    };
  }

  // Random color
  const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];

  // ⭐ Random icon assigned permanently
  const randomIconType = iconTypes[Math.floor(Math.random() * iconTypes.length)];

  const id = `card-${cardId}`;

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

  const cardData = {
    id,
    code: (100140 + cardId).toString(),
    user: ["Sarim Asaf", "Zimba Ray", "Alex Ford", "Alif Allen", "Daniel Joe"][
      Math.floor(Math.random() * 5)
    ],
    title: `SEDRES – ${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"][
      Math.floor(Math.random() * 8)
    ]} ${2025 + Math.floor(Math.random() * 2)}`,
    days: Math.floor(Math.random() * 300) + 20,
    timeLeft: `${Math.floor(Math.random() * 90)}d ${Math.floor(Math.random() * 24)}h ${Math.floor(
      Math.random() * 60
    )}m`,
    progress: Math.floor(Math.random() * 100),
    color: randomColor,
    iconType: randomIconType,   // ⭐ Added here
    priority: Math.random() > 0.7, // Randomly assign priority (30% chance)
    // Add extra details to all cards
    customerName: customerNames[Math.floor(Math.random() * customerNames.length)],
    vesselName: vesselNames[Math.floor(Math.random() * vesselNames.length)],
    timeOfDelivery: times[Math.floor(Math.random() * times.length)],
    driver: drivers[Math.floor(Math.random() * drivers.length)],
    pickUpTime: times[Math.floor(Math.random() * times.length)],
  };

  cards[id] = cardData;

  columns[colId].cardIds.push(id);
  cardId++;
}

export const initialData = {
  columns,
  columnOrder: Object.keys(columns),
  cards,
};
