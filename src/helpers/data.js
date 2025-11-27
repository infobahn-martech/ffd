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

for (let i = 0; i < 50; i++) {
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

  // Randomly decide if this card should have extra details (40% chance)
  const hasExtraDetails = Math.random() > 0.6;

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
  };

  // Add extra details to random cards
  if (hasExtraDetails) {
    const customerNames = ["ABC Shipping Co.", "Global Logistics Ltd.", "Maritime Transport Inc.", "Ocean Freight Solutions", "International Cargo Group"];
    const vesselNames = ["MV Atlantic Star", "SS Pacific Wave", "MV Indian Ocean", "SS Mediterranean", "MV Caribbean Breeze"];
    const drivers = ["John Smith", "Michael Johnson", "David Williams", "Robert Brown", "James Davis"];
    const times = ["09:00 AM", "02:30 PM", "11:15 AM", "04:45 PM", "08:00 AM", "01:20 PM"];

    cardData.customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    cardData.vesselName = vesselNames[Math.floor(Math.random() * vesselNames.length)];
    cardData.timeOfDelivery = times[Math.floor(Math.random() * times.length)];
    cardData.driver = drivers[Math.floor(Math.random() * drivers.length)];
    cardData.pickUpTime = times[Math.floor(Math.random() * times.length)];
  }

  cards[id] = cardData;

  columns[colId].cardIds.push(id);
  cardId++;
}

export const initialData = {
  columns,
  columnOrder: Object.keys(columns),
  cards,
};
