const columnColors = {
  "col-1": "#2A00FF", // Blue
  "col-2": "#6C5CE7", // Purple
  "col-3": "#E17055", // Orange
  "col-4": "#00B894", // Green
  "col-5": "#0984E3", // Light Blue
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

// create 50 cards total, distributed equally
for (let i = 0; i < 50; i++) {
  const colIndex = i % columnTitles.length;
  const colId = `col-${colIndex + 1}`;
  const color = columnColors[colId];

  if (!columns[colId]) {
    columns[colId] = {
      id: colId,
      title: columnTitles[colIndex],
      cardIds: [],
      color,
    };
  }

  const id = `card-${cardId}`;
  cards[id] = {
    id,
    code: (100140 + cardId).toString(),
    user: ["sarim asaf", "emma ray", "alex ford", "sofia allen", "daniel joe"][
      Math.floor(Math.random() * 5)
    ],
    title: `SEDRES – ${["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"][
      Math.floor(Math.random() * 8)
    ]} ${2025 + Math.floor(Math.random() * 2)}`,
    days: Math.floor(Math.random() * 300) + 20,
    timeLeft: `${Math.floor(Math.random() * 90)}d ${Math.floor(
      Math.random() * 24
    )}h ${Math.floor(Math.random() * 60)}m`,
    points: Math.floor(Math.random() * 200) + 50,
    progress: Math.floor(Math.random() * 100),
    color,
  };

  columns[colId].cardIds.push(id);
  cardId++;
}

export const initialData = {
  columns,
  columnOrder: Object.keys(columns),
  cards,
};
