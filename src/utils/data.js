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
  cards[id] = {
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
  };

  columns[colId].cardIds.push(id);
  cardId++;
}

export const initialData = {
  columns,
  columnOrder: Object.keys(columns),
  cards,
};
