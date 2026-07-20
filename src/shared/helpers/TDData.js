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
// HELPERS
// ============================================================

/** Ensures Task Workflow is always present in the workflows array. */
export const ensureStaticWorkflows = (mapped) => {
    let result = mapped;
    if (!result.some((wf) => wf.id === "wf-demo" || wf.title === "Task Workflow")) {
        result = [...result, TASK_WORKFLOW_WITH_DEMO];
    }
    return result;
};

const GRO_STATIC_CREW_CHANGE_CARD_ID = "gro-static-crew-change";

/** Adds a static "Crew Change" card to GRO Workflow's To Do column, cloned from its Crew Immigration card so it renders identically. */
export const injectGROCrewChangeCard = (workflows) =>
    workflows.map((wf) => {
        if (wf.title !== "GRO Workflow" || wf.cards?.[GRO_STATIC_CREW_CHANGE_CARD_ID]) return wf;

        const todoColId = wf.columnOrder?.find((colId) => wf.columns?.[colId]?.title === "To Do");
        if (!todoColId) return wf;

        const source = Object.values(wf.cards || {}).find(
            (c) => (c.taskName || "").trim().toLowerCase() === "crew immigration"
        );
        if (!source) return wf;

        const laneId = source.laneId;
        const swimlane = wf.swimlanes?.[laneId];
        if (!swimlane) return wf;

        const staticCard = {
            ...source,
            id: GRO_STATIC_CREW_CHANGE_CARD_ID,
            columnId: todoColId,
            taskName: "Crew Change",
            taskId: "",
        };

        return {
            ...wf,
            cards: { ...wf.cards, [GRO_STATIC_CREW_CHANGE_CARD_ID]: staticCard },
            swimlanes: {
                ...wf.swimlanes,
                [laneId]: {
                    ...swimlane,
                    cardMap: {
                        ...swimlane.cardMap,
                        [todoColId]: [...(swimlane.cardMap?.[todoColId] || []), GRO_STATIC_CREW_CHANGE_CARD_ID],
                    },
                },
            },
        };
    });
