// ============================================================
// DA WORKFLOW (demo, frontend-only — mirrors Task Workflow/TDData.js)
// ============================================================

const DA_DEMO_CARDS = {
    "da-demo-card-1": {
        id: "da-demo-card-1",
        laneId: "default",
        columnId: "col-todo",
        workflow_id: "wf-da-demo",
        workflow_role_id: null,
        cardVariant: "da",
        cardSource: "static",
        title: "DA – Crew Change",
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

/** Static template for the DA Workflow injected on the frontend. */
export const DA_WORKFLOW_TEMPLATE = {
    id: "wf-da-demo",
    title: "DA Workflow",
    columnOrder: ["col-todo", "col-progress", "col-done"],
    columns: {
        "col-todo":     { id: "col-todo",     title: "To Do",       color: "#3b82f6", stageId: "stage-1", stageTitle: "To Do",       wipLimit: null, cardsPerRow: 2, backgroundColor: "#ffffff" },
        "col-progress": { id: "col-progress", title: "In Progress", color: "#f59e0b", stageId: "stage-2", stageTitle: "In Progress", wipLimit: null, cardsPerRow: 2, backgroundColor: "#ffffff" },
        "col-done":     { id: "col-done",     title: "Completed",   color: "#22c55e", stageId: "stage-3", stageTitle: "Completed",   wipLimit: null, cardsPerRow: 2, backgroundColor: "#ffffff" },
    },
    swimlaneOrder: ["default"],
    swimlanes: {
        default: { id: "default", title: "Default", color: "#ffffff", cardMap: { "col-todo": [], "col-progress": [], "col-done": [] } },
    },
    cards: {},
};

// DA Workflow template merged with the DA demo card
export const DA_WORKFLOW_WITH_DEMO = {
    ...DA_WORKFLOW_TEMPLATE,
    swimlanes: {
        default: {
            ...DA_WORKFLOW_TEMPLATE.swimlanes.default,
            cardMap: {
                ...DA_WORKFLOW_TEMPLATE.swimlanes.default.cardMap,
                "col-todo": ["da-demo-card-1"],
            },
        },
    },
    cards: DA_DEMO_CARDS,
};

/** Ensures DA Workflow is always present in the workflows array. */
export const ensureDAWorkflow = (mapped) => {
    if (mapped.some((wf) => wf.id === "wf-da-demo" || wf.title === "DA Workflow")) {
        return mapped;
    }
    return [...mapped, DA_WORKFLOW_WITH_DEMO];
};
