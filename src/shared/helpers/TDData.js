import { TASK_WORKFLOW_TEMPLATE } from "./data";

// ============================================================
// TAXI-BOAT DEMO CARD (injected into Task Workflow)
// ============================================================

const TB_DEMO_CARDS = {
    "tb-demo-card-1": {
        id: "tb-demo-card-1",
        laneId: "default",
        columnId: "col-todo",
        workflow_id: "wf-demo",
        workflow_role_id: null,
        cardVariant: "taxi-boat",
        cardSource: "static",
        title: "TB – Crew Change",
        vesselName: "MV Atlantic Star",
        name: "Gulf Marine",
        user: "James Okonkwo",
        requestedOperator: "Ali Hassan",
        typeOfService: "Crew Change",
        location: "Freighter Anchorage",
        bookingDate: "23 Jun 2026",
        batchCount: 2,
        timeLeft: "4h 30m",
        progress: 0,
        color: "rgb(62 94 189)",
        crew: [
            { id: "c1", crewName: "Ahmed Al-Rashid", rank: "Chief Officer", nationality: "Saudi",    passportNo: "P1234567", seamanBookNo: "SB-10021" },
            { id: "c2", crewName: "Vikram Singh",     rank: "2nd Engineer",  nationality: "Indian",   passportNo: "P2345678", seamanBookNo: "SB-10022" },
            { id: "c3", crewName: "Juan Dela Cruz",   rank: "AB Seaman",     nationality: "Filipino", passportNo: "P3456789", seamanBookNo: "SB-10023" },
            { id: "c4", crewName: "Omar Hassan",      rank: "Cook",          nationality: "Egyptian", passportNo: "P4567890", seamanBookNo: "SB-10024" },
        ],
    },
};

// Task Workflow template merged with taxi-boat demo card
export const TASK_WORKFLOW_WITH_DEMO = {
    ...TASK_WORKFLOW_TEMPLATE,
    swimlanes: {
        default: {
            ...TASK_WORKFLOW_TEMPLATE.swimlanes.default,
            cardMap: {
                ...TASK_WORKFLOW_TEMPLATE.swimlanes.default.cardMap,
                "col-todo": ["tb-demo-card-1"],
            },
        },
    },
    cards: TB_DEMO_CARDS,
};

// ============================================================
// TAXI BOARD WORKFLOW TEMPLATE
// ============================================================

export const TAXI_BOARD_WORKFLOW_TEMPLATE = {
    id: "taxi-board-wf",
    title: "Taxi Board Workflow",
    columnOrder: ["tb-col-todo", "tb-col-inprogress", "tb-col-done"],
    columns: {
        "tb-col-todo":       { id: "tb-col-todo",       title: "To Do",       color: "#2666be", stageId: "tb-stage-1", stageTitle: "To Do",       wipLimit: null, cardsPerRow: 2, backgroundColor: "#ffffff" },
        "tb-col-inprogress": { id: "tb-col-inprogress", title: "In Progress", color: "#f38a30", stageId: "tb-stage-2", stageTitle: "In Progress", wipLimit: null, cardsPerRow: 2, backgroundColor: "#ffffff" },
        "tb-col-done":       { id: "tb-col-done",       title: "Completed",   color: "#42af49", stageId: "tb-stage-3", stageTitle: "Completed",   wipLimit: null, cardsPerRow: 2, backgroundColor: "#ffffff" },
    },
    swimlaneOrder: ["default"],
    swimlanes: {
        default: {
            id: "default",
            title: "Default",
            color: "#ffffff",
            cardMap: {
                "tb-col-todo":       ["tbwf-card-1", "tbwf-card-2", "tbwf-card-3"],
                "tb-col-inprogress": ["tbwf-card-4", "tbwf-card-5"],
                "tb-col-done":       ["tbwf-card-6"],
            },
        },
    },
    cards: {
        "tbwf-card-1": {
            id: "tbwf-card-1", laneId: "default", columnId: "tb-col-todo",
            workflow_id: "taxi-board-wf", workflow_role_id: null,
            cardVariant: "taxi-boat", cardSource: "static",
            title: "TB – JAN 2025", vesselName: "MV Atlantic Star", name: "Gulf Marine",
            user: "John Smith", requestedOperator: "Ali Hassan", typeOfService: "Crew Change",
            location: "Freighter Anchorage", bookingDate: "10 Jan 2025", batchCount: 2,
            timeLeft: "3d 2h", progress: 0, color: "#2666be",
            crew: [
                { id: "c1", crewName: "Ahmed Al-Rashid", rank: "Chief Officer", nationality: "Saudi",    passportNo: "P1234567", seamanBookNo: "SB-10021" },
                { id: "c2", crewName: "Vikram Singh",     rank: "2nd Engineer",  nationality: "Indian",   passportNo: "P2345678", seamanBookNo: "SB-10022" },
                { id: "c3", crewName: "Juan Dela Cruz",   rank: "AB Seaman",     nationality: "Filipino", passportNo: "P3456789", seamanBookNo: "SB-10023" },
                { id: "c4", crewName: "Omar Hassan",      rank: "Cook",          nationality: "Egyptian", passportNo: "P4567890", seamanBookNo: "SB-10024" },
                { id: "c5", crewName: "Carlos Mendez",    rank: "Bosun",         nationality: "Mexican",  passportNo: "P5678901", seamanBookNo: "SB-10025" },
            ],
        },
        "tbwf-card-2": {
            id: "tbwf-card-2", laneId: "default", columnId: "tb-col-todo",
            workflow_id: "taxi-board-wf", workflow_role_id: null,
            cardVariant: "taxi-boat", cardSource: "static",
            title: "TB – FEB 2025", vesselName: "SS Pacific Wave", name: "Saudi Marcap",
            user: "Michael Johnson", requestedOperator: "Faisal Al-Otaibi", typeOfService: "Technician Visit",
            location: "RT7", bookingDate: "15 Feb 2025", batchCount: 2,
            timeLeft: "1d 5h", progress: 0, color: "#2666be",
        },
        "tbwf-card-3": {
            id: "tbwf-card-3", laneId: "default", columnId: "tb-col-todo",
            workflow_id: "taxi-board-wf", workflow_role_id: null,
            cardVariant: "taxi-boat", cardSource: "static",
            title: "TB – MAR 2025", vesselName: "MV Indian Ocean", name: "Saipem",
            user: "David Williams", requestedOperator: "Khalid Mansour", typeOfService: "Immigration Clearance",
            location: "Sea Island", bookingDate: "20 Mar 2025", batchCount: 3,
            timeLeft: "5h 10m", progress: 0, color: "#2666be",
        },
        "tbwf-card-4": {
            id: "tbwf-card-4", laneId: "default", columnId: "tb-col-inprogress",
            workflow_id: "taxi-board-wf", workflow_role_id: null,
            cardVariant: "taxi-boat", cardSource: "static",
            title: "TB – APR 2025", vesselName: "SS Mediterranean", name: "Snamprogetti",
            user: "Robert Brown", requestedOperator: "Tariq Nasser", typeOfService: "Material Delivery",
            location: "Juaymah", bookingDate: "05 Apr 2025", batchCount: 2,
            timeLeft: "2d 8h", progress: 30, color: "#f38a30",
        },
        "tbwf-card-5": {
            id: "tbwf-card-5", laneId: "default", columnId: "tb-col-inprogress",
            workflow_id: "taxi-board-wf", workflow_role_id: null,
            cardVariant: "taxi-boat", cardSource: "static",
            title: "TB – MAY 2025", vesselName: "MV Caribbean Breeze", name: "Lamprell",
            user: "James Davis", requestedOperator: "Samir Al-Zahrani", typeOfService: "Provision Delivery",
            location: "Freighter Anchorage", bookingDate: "12 May 2025", batchCount: 2,
            timeLeft: "1d 1h", progress: 50, color: "#f38a30",
        },
        "tbwf-card-6": {
            id: "tbwf-card-6", laneId: "default", columnId: "tb-col-done",
            workflow_id: "taxi-board-wf", workflow_role_id: null,
            cardVariant: "taxi-boat", cardSource: "static",
            title: "TB – JUN 2025", vesselName: "MV Ocean Express", name: "Gulf Marine",
            user: "William Miller", requestedOperator: "Rayan Bakr", typeOfService: "Tanker Clearance",
            location: "RT7", bookingDate: "01 Jun 2025", batchCount: 2,
            timeLeft: "6h 45m", progress: 70, color: "#42af49",
        },
    },
};

// ============================================================
// HELPERS
// ============================================================

/** Ensures Task Workflow and Taxi Board Workflow are always present in the workflows array. */
export const ensureStaticWorkflows = (mapped) => {
    let result = mapped;
    if (!result.some((wf) => wf.id === "wf-demo" || wf.title === "Task Workflow")) {
        result = [...result, TASK_WORKFLOW_WITH_DEMO];
    }
    if (!result.some((wf) => wf.id === "taxi-board-wf" || wf.title === "Taxi Board Workflow")) {
        result = [...result, TAXI_BOARD_WORKFLOW_TEMPLATE];
    }
    return result;
};
