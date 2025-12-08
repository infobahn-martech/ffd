const columnColors = {
  "col-1": "rgb(226 16 108)",
  "col-2": "rgb(121 21 188)",
  "col-3": "rgb(62 94 189)",
  "col-4": "rgb(65 178 74)",
  "col-5": "rgb(119 86 73)",
  "col-6": "rgb(237 142 55)",
};


const columnTitles = [
  "Appointment Received",
  "Enroute",
  "Vessel Arrived",
  "Vessel Cleared",
  "Vessel Sailed",
  "Ready to Fianalize",
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
