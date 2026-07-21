import { useState, useCallback, useEffect, useRef } from "react";
import { useCTPendingCards } from "../../../../../../shared/store/ctStore";
import { useTaxiBoatStore } from "../../../../../../shared/store/taxiBoatStore";
import useTaxiBoatAssignmentReducer from "../../../../../../store/TaxiBoatAssignmentReducer";
import useAuthReducer from "../../../../../../store/AuthReducer";
import useAlertReducer from "../../../../../../store/AlertReducer";
import groService from "../../../../../../services/groService";
import launchHireService from "../../../../../../services/launchHireService";
import DateTimePickerField from "../../../../CardFormTabs/shared/components/DateTimePickerField";
import { formatGroDocumentDisplayName } from "../GRO/User/groCardUtils";
import PropTypes from "prop-types";
import { FiFlag, FiAnchor, FiNavigation, FiHome, FiArrowDown, FiArrowUp, FiClock, FiUpload, FiPlus, FiCheckCircle, FiPrinter, FiUser } from "react-icons/fi";
import { FaShip } from "react-icons/fa";
import { MdDirectionsBoat } from "react-icons/md";
import "../../../../../../design/scss/pages/kanban-board/taxi-boat-card.scss";
import "../../../../../../design/scss/pages/kanban-board/taxi-boat-service-scenarios.scss";
import GroSummaryCard, { GroSummaryFieldCard } from "../GRO/User/GroSummaryCard";

const CREW_CHANGE_SERVICES = ["Crew Change"];
const MATERIAL_SERVICES   = ["Material Delivery", "Provision Delivery", "Garbage Collection"];
const IMMIGRATION_SERVICES = ["Immigration Clearance"];

const MOCK_CREW_ROWS = [
  { name: "Ahmed Al-Rashid",  rank: "Chief Officer", nationality: "Saudi",    passportNo: "P1234567", seamanBookNo: "SB-10021" },
  { name: "Vikram Singh",     rank: "2nd Engineer",  nationality: "Indian",   passportNo: "P2345678", seamanBookNo: "SB-10022" },
  { name: "Juan Dela Cruz",   rank: "AB Seaman",     nationality: "Filipino", passportNo: "P3456789", seamanBookNo: "SB-10023" },
  { name: "Omar Hassan",      rank: "Cook",          nationality: "Egyptian", passportNo: "P4567890", seamanBookNo: "SB-10024" },
];

const MOCK_PACKING_LIST_ROWS = [
  { itemNo: "PL-001", description: "Safety Helmets",          qty: 20,  unit: "pcs",  weight: 12.0,  notes: ""         },
  { itemNo: "PL-002", description: "Fire Hose Assemblies",    qty: 4,   unit: "sets", weight: 48.5,  notes: ""         },
  { itemNo: "PL-003", description: "Hydraulic Fluid (ISO 46)",qty: 200, unit: "L",    weight: 180.0, notes: "Hazmat"   },
  { itemNo: "PL-004", description: "Spare Pump Impellers",    qty: 2,   unit: "pcs",  weight: 35.0,  notes: ""         },
  { itemNo: "PL-005", description: "Rope (16mm, 200m coil)",  qty: 3,   unit: "coil", weight: 90.0,  notes: ""         },
  { itemNo: "PL-006", description: "Electrical Cable Reels",  qty: 6,   unit: "reels",weight: 144.0, notes: ""         },
  { itemNo: "PL-007", description: "Engine Lube Oil 40W",     qty: 100, unit: "L",    weight: 88.0,  notes: "Hazmat"   },
  { itemNo: "PL-008", description: "Life Jacket (SOLAS)",     qty: 30,  unit: "pcs",  weight: 24.0,  notes: ""         },
];

function getBatchCrewRows(crewCount) {
  const n = Math.max(0, parseInt(crewCount, 10) || 0);
  if (n === 0) return [];
  return Array.from({ length: n }, (_, i) => ({ ...MOCK_CREW_ROWS[i % MOCK_CREW_ROWS.length] }));
}

// launch_hire/get_crew_immigration_booking/{booking_id} — crew row shape isn't fully
// confirmed on the backend yet, so fall back across likely field name variants.
function normalizeImmigrationCrewRow(crew) {
  return {
    name:         formatGroDocumentDisplayName(crew?.crew_name ?? crew?.name) || "—",
    rank:         formatGroDocumentDisplayName(crew?.rank ?? crew?.crew_rank) || "—",
    nationality:  formatGroDocumentDisplayName(crew?.nationality) || "—",
    passportNo:   crew?.passport_no ?? crew?.passportNo ?? "—",
    seamanBookNo: crew?.seaman_book_no ?? crew?.seamanBookNo ?? crew?.seaman_book_number ?? "—",
  };
}

function mapImmigrationBatches(apiBatches) {
  const initKeys = STANDARD_TIMESTAMPS.map((t) => t.key);
  return (Array.isArray(apiBatches) ? apiBatches : []).map((b, idx) => {
    const crew = Array.isArray(b?.crew) ? b.crew.map(normalizeImmigrationCrewRow) : [];
    return {
      id: idx + 1,
      batchLabel: b?.batch ? formatGroDocumentDisplayName(b.batch) : null,
      crewCount: String(crew.length),
      crew,
      operator: "",
      ts: makeTsState(initKeys),
      tsOps: makeTsState(initKeys),
      cobTime: null,
      completedAt: null,
      stepBackLog: [],
      file: null,
      completed: false,
    };
  });
}

const STANDARD_TIMESTAMPS = [
  { key: "castOff",           label: "Cast off Time",       icon: FiFlag,       animKey: "castOff"                          },
  { key: "boatAlongsideShip", label: "Boat Alongside Ship", icon: FiAnchor,     animKey: "boatAlongsideShip", showShip: true },
  { key: "boatCastOffShip",   label: "Boat Cast off Ship",  icon: FiNavigation, animKey: "boatCastOffShip",   showShip: true },
  { key: "backToJetty",       label: "Back to Jetty",       icon: FiHome,       animKey: "backToJetty"                      },
];

const BATCH_ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
const CREW_PAGE_SIZE = 10;

const isBatchDone = (batch) => STANDARD_TIMESTAMPS.every((t) => batch.ts[t.key] !== null);

const makeTsState = (keys) =>
  keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});

const formatDuration = (ms) => {
  if (!ms || ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};


const formatDateTime = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

function TimestampAnimIcon({ animKey }) {
  if (animKey === "castOff") {
    return (
      <span className="tb-tsanim tb-tsanim--castoff">
        <span className="tb-tsanim-rope" />
        <FaShip size={16} className="tb-tsanim-ship" />
      </span>
    );
  }
  if (animKey === "boatAlongsideShip") {
    return (
      <span className="tb-tsanim tb-tsanim--alongside">
        <FaShip size={20} className="tb-tsanim-vessel" />
        <FaShip size={11} className="tb-tsanim-boat" />
      </span>
    );
  }
  if (animKey === "boatCastOffShip") {
    return (
      <span className="tb-tsanim tb-tsanim--castoff-ship">
        <FaShip size={20} className="tb-tsanim-vessel" />
        <FaShip size={11} className="tb-tsanim-boat" />
      </span>
    );
  }
  if (animKey === "backToJetty") {
    return (
      <span className="tb-tsanim tb-tsanim--back-jetty">
        <FiAnchor size={15} className="tb-tsanim-anchor" />
        <FaShip size={15} className="tb-tsanim-ship" />
      </span>
    );
  }
  if (animKey === "batchPickup") {
    return (
      <span className="tb-tsanim tb-tsanim--batch-pickup">
        <FaShip size={14} className="tb-tsanim-vessel" />
        <span className="tb-tsanim-crew-dot" />
      </span>
    );
  }
  if (animKey === "batchDrop") {
    return (
      <span className="tb-tsanim tb-tsanim--batch-drop">
        <FaShip size={14} className="tb-tsanim-vessel" />
        <span className="tb-tsanim-crew-dot" />
      </span>
    );
  }
  return null;
}

TimestampAnimIcon.propTypes = { animKey: PropTypes.string.isRequired };

function TimestampCard({ label, value, onCheck, icon: Icon, animKey }) {
  const isChecked = value !== null;
  const formatted = formatDateTime(value);
  return (
    <div
      className={`tb-ts-card${isChecked ? " tb-ts-card--done" : ""}`}
      onClick={() => !isChecked && onCheck()}
      role="button"
      tabIndex={isChecked ? -1 : 0}
      onKeyDown={(e) => { if (!isChecked && (e.key === "Enter" || e.key === " ")) onCheck(); }}
    >
      <div className="tb-ts-card-icon-box">
        {animKey ? <TimestampAnimIcon animKey={animKey} /> : <Icon size={20} />}
      </div>
      <div className="tb-ts-card-title">{label}</div>
      <div className={`tb-ts-card-pill${isChecked ? " tb-ts-card-pill--captured" : ""}`}>
        {isChecked ? formatted : "Tap to capture"}
      </div>
    </div>
  );
}

TimestampCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onCheck: PropTypes.func.isRequired,
  icon: PropTypes.elementType.isRequired,
  animKey: PropTypes.string,
};

function TimestampGrid({ timestamps, tsState, onCapture }) {
  return (
    <div className="tb-ts-grid">
      {timestamps.map(({ key, label, icon, animKey }) => (
        <TimestampCard
          key={key}
          label={label}
          value={tsState[key]}
          onCheck={() => onCapture(key)}
          icon={icon || FiClock}
          animKey={animKey}
        />
      ))}
    </div>
  );
}

TimestampGrid.propTypes = {
  timestamps: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string, label: PropTypes.string, icon: PropTypes.elementType })
  ).isRequired,
  tsState: PropTypes.object.isRequired,
  onCapture: PropTypes.func.isRequired,
};

const UNDO_REASONS = [
  "Wrong time captured",
  "Operator error",
  "Re-capture required",
  "System / technical error",
  "Other",
];

function ConfirmDialog({ label, onConfirm, onCancel }) {
  const [reason, setReason] = useState(null);
  const [otherText, setOtherText] = useState("");

  const canConfirm = reason !== null && (reason !== "Other" || otherText.trim().length > 0);
  const finalReason = reason === "Other" ? otherText.trim() : reason;

  return (
    <div className="tb-confirm-overlay" onClick={onCancel}>
      <div className="tb-confirm-box" onClick={(e) => e.stopPropagation()}>
        <p className="tb-confirm-msg">
          Are you sure you want to undo <strong>{label}</strong>?
          Selecting <em>Yes</em> will clear this timestamp and you will need to tap again to capture the current time.
        </p>

        <div className="tb-confirm-reason-section">
          <span className="tb-confirm-reason-label">Reason for going back</span>
          <div className="tb-confirm-reason-chips">
            {UNDO_REASONS.map((r) => (
              <button
                key={r}
                className={`tb-confirm-reason-chip${reason === r ? " tb-confirm-reason-chip--active" : ""}`}
                onClick={() => { setReason(r); if (r !== "Other") setOtherText(""); }}
              >
                {r}
              </button>
            ))}
          </div>
          {reason === "Other" && (
            <input
              type="text"
              className="tb-confirm-reason-input"
              placeholder="Please specify the reason..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              autoFocus
            />
          )}
        </div>

        <div className="tb-confirm-btns">
          <button
            className={`tb-confirm-btn tb-confirm-btn--yes${!canConfirm ? " tb-confirm-btn--disabled" : ""}`}
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm(finalReason)}
          >
            Yes, Go Back
          </button>
          <button className="tb-confirm-btn tb-confirm-btn--no" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  label:     PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel:  PropTypes.func.isRequired,
};

function TimestampStepper({ timestamps, tsState, onCapture, onComplete, jobCompleted, canFinish, onUndo, now, tsOps, shipName, intermediateTrip }) {
  const doneCount = timestamps.filter((t) => tsState[t.key] !== null).length;
  const totalSteps = timestamps.length;
  const allTimestampsDone = doneCount === totalSteps;
  const finalStepReady = canFinish !== undefined ? canFinish : allTimestampsDone;
  const totalWithFinal = totalSteps + (onComplete ? 1 : 0);
  const isArrived = onComplete ? jobCompleted : allTimestampsDone;

  return (
    <div className={`tb-stepper-wrap tb-stepper-wrap--step-${doneCount} tb-stepper-wrap--steps-${totalWithFinal}`}>
      <div className={`tb-stepper-boat-wrap${isArrived ? " tb-stepper-boat-wrap--arrived" : ""}`}>
        <MdDirectionsBoat size={20} className="tb-stepper-boat-icon" />
      </div>
      <ol className="tb-stepper">
      {timestamps.flatMap(({ key, label, icon: Icon, animKey, showShip }, i) => {
        const done = tsState[key] !== null;
        const prevKey = i > 0 ? timestamps[i - 1].key : null;
        const prevDone = i === 0 || tsState[prevKey] !== null;
        const isNext = !done && prevDone;
        const isLocked = !done && !isNext;
        const undoable = done && !!onUndo;

        const stepDuration = done && prevKey && tsState[prevKey]
          ? formatDuration(new Date(tsState[key]) - new Date(tsState[prevKey]))
          : null;

        const liveTimer = isNext && now && prevKey && tsState[prevKey]
          ? formatDuration(now - new Date(tsState[prevKey]))
          : null;

        const mainItem = (
          <li
            key={key}
            className={[
              "tb-stepper-item",
              done     ? "tb-stepper-item--done"     : "",
              undoable ? "tb-stepper-item--undoable" : "",
              isNext   ? "tb-stepper-item--next"     : "",
              isLocked ? "tb-stepper-item--locked"   : "",
            ].filter(Boolean).join(" ")}
            onClick={() => {
              if (undoable) onUndo(key, label);
              else if (isNext) onCapture(key);
            }}
            role={isNext || undoable ? "button" : undefined}
            tabIndex={isNext || undoable ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                if (undoable) onUndo(key, label);
                else if (isNext) onCapture(key);
              }
            }}
          >
            <div className="tb-stepper-track">
              <div className="tb-stepper-dot">{done ? "✓" : i + 1}</div>
              <div className="tb-stepper-line" />
            </div>
            <div className="tb-stepper-body">
              <div className="tb-stepper-icon-box">
                {animKey ? <TimestampAnimIcon animKey={animKey} /> : <Icon size={20} />}
              </div>
              <div className="tb-stepper-content">
                <span className="tb-stepper-label">
                  {label}
                  {showShip && shipName && shipName !== "—" && (
                    <span className="tb-stepper-ship-name"><FaShip size={8} />{shipName}</span>
                  )}
                </span>
                <span className={[
                  "tb-stepper-pill",
                  done   ? "tb-stepper-pill--done" : "",
                  isNext ? "tb-stepper-pill--next" : "",
                ].filter(Boolean).join(" ")}>
                  {done ? formatDateTime(tsState[key]) : isNext ? "Tap to capture" : "—"}
                </span>
                {stepDuration && (
                  <span className="tb-step-duration">{stepDuration}</span>
                )}
                {liveTimer && (
                  <span className="tb-step-live-timer">
                    <FiClock size={9} />
                    {liveTimer}
                  </span>
                )}
                {done && tsOps?.[key] && (
                  <span className="tb-stepper-operator-name">
                    <FiUser size={9} />
                    {tsOps[key]}
                  </span>
                )}
              </div>
            </div>
          </li>
        );

        if (key === "boatCastOffShip" && intermediateTrip) {
          return [mainItem, (
            <li key="intermediate-trip" className="tb-stepper-item tb-stepper-item--intermediate">
              <div className="tb-stepper-track">
                <div className="tb-stepper-dot tb-stepper-dot--trip"><FiArrowUp size={9} /></div>
                <div className="tb-stepper-line" />
              </div>
              <div className="tb-stepper-body">
                <div className="tb-stepper-icon-box tb-stepper-icon-box--trip">
                  <FiNavigation size={18} />
                </div>
                <div className="tb-stepper-content">
                  <span className="tb-stepper-label tb-stepper-label--trip">Intermediate Trip</span>
                  {intermediateTrip.purpose && <span className="tb-trip-split-purpose">{intermediateTrip.purpose}</span>}
                  {intermediateTrip.destShip && <span className="tb-trip-split-dest"><FaShip size={9} />{intermediateTrip.destShip}</span>}
                  {intermediateTrip.billingEntity && <span className="tb-trip-split-billing">{intermediateTrip.billingEntity}</span>}
                </div>
              </div>
            </li>
          )];
        }

        return [mainItem];
      })}
      {onComplete && (
        <li
          className={[
            "tb-stepper-item",
            jobCompleted                          ? "tb-stepper-item--done"   : "",
            finalStepReady && !jobCompleted       ? "tb-stepper-item--next"   : "",
            !finalStepReady && !jobCompleted      ? "tb-stepper-item--locked" : "",
          ].filter(Boolean).join(" ")}
          onClick={() => finalStepReady && !jobCompleted && onComplete()}
          role={finalStepReady && !jobCompleted ? "button" : undefined}
          tabIndex={finalStepReady && !jobCompleted ? 0 : -1}
          onKeyDown={(e) => {
            if (finalStepReady && !jobCompleted && (e.key === "Enter" || e.key === " ")) onComplete();
          }}
        >
          <div className="tb-stepper-track">
            <div className="tb-stepper-dot">{jobCompleted ? "✓" : totalSteps + 1}</div>
          </div>
          <div className="tb-stepper-body">
            <div className="tb-stepper-icon-box">
              <FiCheckCircle size={20} />
            </div>
            <div className="tb-stepper-content">
              <span className="tb-stepper-label">Trip Completed</span>
              <span className={[
                "tb-stepper-pill",
                jobCompleted                    ? "tb-stepper-pill--done" : "",
                finalStepReady && !jobCompleted ? "tb-stepper-pill--next" : "",
              ].filter(Boolean).join(" ")}>
                {jobCompleted ? "Completed" : finalStepReady ? "Tap to complete" : "—"}
              </span>
            </div>
          </div>
        </li>
      )}
      </ol>
      {allTimestampsDone && (() => {
        const firstTs = tsState[timestamps[0].key];
        const lastTs  = tsState[timestamps[timestamps.length - 1].key];
        const dur = firstTs && lastTs ? formatDuration(new Date(lastTs) - new Date(firstTs)) : null;
        return dur ? (
          <div className="tb-voyage-duration-bar">
            <FiClock size={12} />
            <span>Total voyage time: <strong>{dur}</strong></span>
          </div>
        ) : null;
      })()}
    </div>
  );
}

TimestampStepper.propTypes = {
  timestamps: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string, label: PropTypes.string, icon: PropTypes.elementType })
  ).isRequired,
  tsState:      PropTypes.object.isRequired,
  onCapture:    PropTypes.func.isRequired,
  onComplete:   PropTypes.func,
  jobCompleted: PropTypes.bool,
  canFinish:    PropTypes.bool,
  onUndo:       PropTypes.func,
  now:             PropTypes.instanceOf(Date),
  tsOps:           PropTypes.object,
  shipName:        PropTypes.string,
  intermediateTrip: PropTypes.shape({
    purpose:       PropTypes.string,
    destShip:      PropTypes.string,
    billingEntity: PropTypes.string,
  }),
};

function InfoCard({ label, value }) {
  return (
    <div className="tb-info-card">
      <span className="tb-info-label">{label}</span>
      <span className="tb-info-value">{value || "—"}</span>
    </div>
  );
}

InfoCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

function FinalStep({ canComplete, isDone, onComplete }) {
  return (
    <ol className="tb-stepper">
      <li
        className={[
          "tb-stepper-item",
          isDone                    ? "tb-stepper-item--done"   : "",
          canComplete && !isDone    ? "tb-stepper-item--next"   : "",
          !canComplete && !isDone   ? "tb-stepper-item--locked" : "",
        ].filter(Boolean).join(" ")}
        onClick={() => canComplete && !isDone && onComplete()}
        role={canComplete && !isDone ? "button" : undefined}
        tabIndex={canComplete && !isDone ? 0 : -1}
        onKeyDown={(e) => {
          if (canComplete && !isDone && (e.key === "Enter" || e.key === " ")) onComplete();
        }}
      >
        <div className="tb-stepper-track">
          <div className="tb-stepper-dot">✓</div>
        </div>
        <div className="tb-stepper-body">
          <div className="tb-stepper-icon-box">
            <FiCheckCircle size={20} />
          </div>
          <div className="tb-stepper-content">
            <span className="tb-stepper-label">Trip Completed</span>
            <span className={[
              "tb-stepper-pill",
              isDone                 ? "tb-stepper-pill--done" : "",
              canComplete && !isDone ? "tb-stepper-pill--next" : "",
            ].filter(Boolean).join(" ")}>
              {isDone ? "Completed" : canComplete ? "Tap to complete" : "—"}
            </span>
          </div>
        </div>
      </li>
    </ol>
  );
}

FinalStep.propTypes = {
  canComplete: PropTypes.bool.isRequired,
  isDone:      PropTypes.bool.isRequired,
  onComplete:  PropTypes.func.isRequired,
};

function TimestampSummaryTable({ timestamps, tsState, jobCompletedAt, cobTime, onCaptureCob, stepsAllDone, stepBackLog }) {
  const anyDone = timestamps.some((t) => tsState[t.key] !== null);
  if (!anyDone) return null;

  return (
    <div className="tb-ts-summary">
      <span className="tb-ts-summary-title">Timestamps Summary</span>
      <table className="tb-ts-summary-table">
        <thead>
          <tr>
            <th className="tb-ts-summary-th-num">#</th>
            <th>Step</th>
            <th>Captured Time</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {timestamps.map(({ key, label }, i) => {
            const prevKey  = i > 0 ? timestamps[i - 1].key : null;
            const time     = tsState[key];
            const prevTime = prevKey ? tsState[prevKey] : null;
            const dur = time && prevTime ? formatDuration(new Date(time) - new Date(prevTime)) : null;
            return (
              <tr key={key} className={time ? "tb-ts-summary-row--done" : ""}>
                <td className="tb-ts-summary-num">{time ? "✓" : i + 1}</td>
                <td className="tb-ts-summary-step">{label}</td>
                <td className="tb-ts-summary-time">
                  {time ? formatDateTime(time) : <span className="tb-ts-summary-blank">—</span>}
                </td>
                <td className="tb-ts-summary-dur">{dur ?? "—"}</td>
              </tr>
            );
          })}

          {/* Trip Completed row */}
          <tr className={["tb-ts-summary-row--job", jobCompletedAt ? "tb-ts-summary-row--done" : "tb-ts-summary-row--locked"].join(" ")}>
            <td className="tb-ts-summary-num">{jobCompletedAt ? "✓" : <FiCheckCircle size={11} />}</td>
            <td className="tb-ts-summary-step tb-ts-summary-job-label">Trip Completed</td>
            <td className="tb-ts-summary-time">
              {jobCompletedAt
                ? formatDateTime(jobCompletedAt)
                : <span className="tb-ts-summary-blank">{stepsAllDone ? "Tap step 5 above" : "—"}</span>}
            </td>
            <td className="tb-ts-summary-dur">—</td>
          </tr>

          {/* COB Complete row */}
          <tr className={[
            "tb-ts-summary-row--cob",
            cobTime           ? "tb-ts-summary-row--done"   : "",
            !jobCompletedAt   ? "tb-ts-summary-row--locked" : "",
          ].filter(Boolean).join(" ")}>
            <td className="tb-ts-summary-num">{cobTime ? "✓" : <FiClock size={11} />}</td>
            <td className="tb-ts-summary-step tb-ts-summary-cob-label">COB Complete</td>
            <td className="tb-ts-summary-time">
              {cobTime ? (
                formatDateTime(cobTime)
              ) : jobCompletedAt ? (
                <button className="tb-cob-capture-btn" onClick={onCaptureCob}>
                  Tap to capture
                </button>
              ) : (
                <span className="tb-ts-summary-blank">Mark job complete first</span>
              )}
            </td>
            <td className="tb-ts-summary-dur">—</td>
          </tr>
          {/* Step Back Log rows */}
          {stepBackLog && stepBackLog.length > 0 && stepBackLog.map((entry, idx) => (
            <tr key={`sb-${idx}`} className="tb-ts-summary-row--stepback">
              <td className="tb-ts-summary-num"><FiArrowDown size={11} /></td>
              <td className="tb-ts-summary-step tb-ts-summary-stepback-label">
                Step Back — {entry.step}
              </td>
              <td className="tb-ts-summary-time">{formatDateTime(entry.time)}</td>
              <td className="tb-ts-summary-dur tb-ts-summary-stepback-reason">{entry.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

TimestampSummaryTable.propTypes = {
  timestamps:      PropTypes.array.isRequired,
  tsState:         PropTypes.object.isRequired,
  jobCompletedAt:  PropTypes.string,
  cobTime:         PropTypes.string,
  onCaptureCob:    PropTypes.func.isRequired,
  stepsAllDone:    PropTypes.bool.isRequired,
  stepBackLog:     PropTypes.array,
};

const parseToInputDate = (raw) => {
  if (!raw || raw === "—") return "";
  try {
    const d = new Date(raw);
    if (!isNaN(d)) return d.toISOString().split("T")[0];
  } catch {}
  return "";
};

function TaxiFleetAssignPanel({
  bookingDate, bookingTime,
  fleets, isLoadingFleets,
  selectedFleet, onSelectFleet,
  captains, isLoadingCaptains,
  selectedCaptainId, onSelectCaptainId,
  isAssigning,
  assigned, assignedCaptainName,
  onAssignCaptain,
}) {
  return (
    <div className="tb-fleet-panel">
      <h3 className="tb-fleet-panel-title">Taxi Fleet Assignment</h3>
      <span className="tb-fleet-select-label">Select Fleet</span>
      {isLoadingFleets ? (
        <span className="tb-fleet-empty-hint">Loading fleets…</span>
      ) : fleets.length === 0 ? (
        <span className="tb-fleet-empty-hint">No fleets found for this operator.</span>
      ) : (
        <div className="tb-fleet-cards">
          {fleets.map((fleet) => {
            const isSelected = selectedFleet?.taxi_boat_id === fleet.taxi_boat_id;
            const isAssigned = assigned && isSelected;
            return (
              <button
                key={fleet.taxi_boat_id}
                className={[
                  "tb-fleet-card",
                  isSelected ? "tb-fleet-card--selected" : "",
                  isAssigned ? "tb-fleet-card--assigned" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => !assigned && onSelectFleet(fleet)}
                disabled={assigned}
              >
                <MdDirectionsBoat size={24} className="tb-fleet-card-icon" />
                <span className="tb-fleet-card-name">{fleet.taxi_boat_name}</span>
                {fleet.registration_no && <span className="tb-fleet-card-tagline">{fleet.registration_no}</span>}
                {fleet.capacity_persons != null && (
                  <span className="tb-fleet-card-cap">Capacity: {fleet.capacity_persons}</span>
                )}
                {isAssigned && <span className="tb-fleet-card-badge"><FiCheckCircle size={10} /> Assigned</span>}
              </button>
            );
          })}
        </div>
      )}

      {selectedFleet && (
        <div className="tb-captain-assign-box">
          <span className="tb-fleet-select-label">Assign Captain</span>
          {!assigned ? (
            <div className="tb-captain-assign-row">
              <select
                className="tb-captain-select"
                value={selectedCaptainId ?? ""}
                onChange={(e) => onSelectCaptainId(e.target.value)}
                disabled={isLoadingCaptains || captains.length === 0}
              >
                <option value="" disabled>
                  {isLoadingCaptains
                    ? "Loading captains…"
                    : captains.length === 0
                    ? "No captains available"
                    : "Select a captain"}
                </option>
                {captains.map((captain) => (
                  <option key={captain.taxiboat_captain_id} value={captain.taxiboat_captain_id}>
                    {captain.captain_name}
                  </option>
                ))}
              </select>
              <button
                className={[
                  "tb-fleet-assign-btn",
                  (!selectedCaptainId || isAssigning) ? "tb-fleet-assign-btn--disabled" : "",
                ].filter(Boolean).join(" ")}
                disabled={!selectedCaptainId || isAssigning}
                onClick={onAssignCaptain}
              >
                {isAssigning ? "Assigning…" : "Assign Captain"}
              </button>
            </div>
          ) : (
            <div className="tb-fleet-assigned-banner">
              <FiCheckCircle size={15} />
              Captain <strong>{assignedCaptainName}</strong> assigned to <strong>{selectedFleet.taxi_boat_name}</strong>
              {bookingDate && <> · {bookingDate}</>}
              {bookingTime && <> at {bookingTime}</>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

TaxiFleetAssignPanel.propTypes = {
  bookingDate:         PropTypes.string.isRequired,
  bookingTime:         PropTypes.string.isRequired,
  fleets:              PropTypes.array.isRequired,
  isLoadingFleets:     PropTypes.bool.isRequired,
  selectedFleet:       PropTypes.object,
  onSelectFleet:       PropTypes.func.isRequired,
  captains:            PropTypes.array.isRequired,
  isLoadingCaptains:   PropTypes.bool.isRequired,
  selectedCaptainId:   PropTypes.string,
  onSelectCaptainId:   PropTypes.func.isRequired,
  isAssigning:         PropTypes.bool.isRequired,
  assigned:            PropTypes.bool.isRequired,
  assignedCaptainName: PropTypes.string,
  onAssignCaptain:     PropTypes.func.isRequired,
};

function CrewListBatchwisePanel({
  batches, setBatches, activeBatchTab, setActiveBatchTab, handleAddBatch,
  opFocusedBatch, setOpFocusedBatch, recentOps, handleOpBlur, handleOpChipClick,
  captureBatchTs, setUndoPending, vesselName, now, printLaunchSlip, bookingId,
}) {
  const [crewPage, setCrewPage] = useState(1);
  const [uploadingBatchId, setUploadingBatchId] = useState(null);
  const activeBatchId = batches[activeBatchTab]?.id;
  const notifySuccess = useAlertReducer((s) => s.success);
  const notifyError = useAlertReducer((s) => s.error);

  useEffect(() => {
    setCrewPage(1);
  }, [activeBatchId]);

  const handleUploadLaunchSlip = useCallback(async (batchIdx, batchIdVal, file) => {
    setBatches((prev) => prev.map((b, idx) => (idx === batchIdx ? { ...b, file } : b)));
    if (!file || bookingId == null) return;
    const formData = new FormData();
    formData.append("booking_id", bookingId);
    formData.append("file", file);
    try {
      setUploadingBatchId(batchIdVal);
      const { data } = await launchHireService.uploadLaunchHireSlip(formData);
      setBatches((prev) =>
        prev.map((b, idx) =>
          idx === batchIdx
            ? { ...b, file, fileUrl: data?.file_url ?? null, fileName: data?.launch_hire_slip ?? file.name }
            : b
        )
      );
      notifySuccess(data?.message ?? "Launch hire slip uploaded successfully");
    } catch (err) {
      notifyError(err?.response?.data?.message ?? err.message ?? "Failed to upload launch hire slip");
    } finally {
      setUploadingBatchId(null);
    }
  }, [bookingId, setBatches, notifySuccess, notifyError]);

  return (
    <div className="tb-scenario-section">
      <h3 className="tb-section-title">Crew List — Batchwise</h3>
      <div className="tb-batch-tab-strip">
        {batches.map((batch, i) => (
          <button
            key={batch.id}
            className={[
              "tb-batch-tab",
              activeBatchTab === i ? "tb-batch-tab--active" : "",
              isBatchDone(batch) ? "tb-batch-tab--done" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => setActiveBatchTab(i)}
          >
            {isBatchDone(batch) && <FiCheckCircle size={12} />}
            {batch.batchLabel ?? `Batch ${BATCH_ORDINALS[i] ?? `${i + 1}th`}`}
          </button>
        ))}
        <button className="tb-add-batch-btn" onClick={handleAddBatch}>
          <FiPlus size={13} />
          Add Batch
        </button>
      </div>

      {batches.map((batch, i) => {
        if (i !== activeBatchTab) return null;
        const done = isBatchDone(batch);
        const crewRows = batch.crew && batch.crew.length > 0 ? batch.crew : getBatchCrewRows(batch.crewCount);
        const totalCrewPages = Math.max(1, Math.ceil(crewRows.length / CREW_PAGE_SIZE));
        const crewPageSafe = Math.min(crewPage, totalCrewPages);
        const pagedCrewRows = crewRows.slice(
          (crewPageSafe - 1) * CREW_PAGE_SIZE,
          crewPageSafe * CREW_PAGE_SIZE
        );
        return (
          <div key={batch.id} className="tb-batch-tab-content">
            {batch.completed && (
              <div className="tb-batch-actions tb-batch-actions--top">
                <button className="tb-batch-print-btn" onClick={() => printLaunchSlip(batch.ts, `Immigration Batch ${BATCH_ORDINALS[i] ?? i + 1}`, batch.operator, batch.completedAt)}>
                  <FiPrinter size={14} />
                  Print Launch Slip
                </button>
                <div>
                  <input
                    type="file"
                    id={`tb-batch-file-${batch.id}`}
                    className="tb-launch-slip-input"
                    accept=".pdf,.jpg,.jpeg,.png"
                    disabled={uploadingBatchId === batch.id}
                    onChange={(e) => handleUploadLaunchSlip(i, batch.id, e.target.files?.[0] ?? null)}
                  />
                  <label htmlFor={`tb-batch-file-${batch.id}`} className="tb-batch-upload-btn">
                    <FiUpload size={14} />
                    {uploadingBatchId === batch.id
                      ? "Uploading…"
                      : batch.file ? batch.file.name : "Upload Launch Slip"}
                  </label>
                </div>
              </div>
            )}

            {crewRows.length > 0 && (
              <div className="tb-crew-table-wrapper tb-crew-table-wrapper--paged">
                <table className="tb-crew-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Rank</th>
                      <th>Nationality</th>
                      <th>Passport No.</th>
                      <th>Seaman Book No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCrewRows.map((row, ri) => (
                      <tr key={ri}>
                        <td>{(crewPageSafe - 1) * CREW_PAGE_SIZE + ri + 1}</td>
                        <td>{row.name}</td>
                        <td>{row.rank}</td>
                        <td>{row.nationality}</td>
                        <td>{row.passportNo}</td>
                        <td>{row.seamanBookNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalCrewPages > 1 && (
                  <div className="tb-crew-pagination">
                    <button
                      type="button"
                      className="tb-crew-page-btn"
                      onClick={() => setCrewPage((p) => Math.max(1, p - 1))}
                      disabled={crewPageSafe === 1}
                    >
                      Prev
                    </button>
                    <span className="tb-crew-page-status">
                      Page {crewPageSafe} of {totalCrewPages}
                    </span>
                    <button
                      type="button"
                      className="tb-crew-page-btn"
                      onClick={() => setCrewPage((p) => Math.min(totalCrewPages, p + 1))}
                      disabled={crewPageSafe === totalCrewPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            <TimestampStepper
              timestamps={STANDARD_TIMESTAMPS}
              tsState={batch.ts}
              tsOps={batch.tsOps}
              shipName={vesselName}
              onCapture={(key) => captureBatchTs(i, key)}
              onComplete={() => setBatches((prev) => prev.map((b, idx) => idx === i ? { ...b, completed: true, completedAt: new Date().toISOString() } : b))}
              jobCompleted={batch.completed}
              canFinish={isBatchDone(batch)}
              now={now}
              onUndo={(key, label) => setUndoPending({
                label,
                resetter: () => setBatches((prev) =>
                  prev.map((b, idx) =>
                    idx === i ? { ...b, ts: { ...b.ts, [key]: null }, completed: false } : b
                  )
                ),
                addToLog: (reason) => setBatches((prev) =>
                  prev.map((b, idx) =>
                    idx === i ? { ...b, stepBackLog: [...b.stepBackLog, { step: label, reason, time: new Date().toISOString() }] } : b
                  )
                ),
              })}
            />

            <TimestampSummaryTable
              timestamps={STANDARD_TIMESTAMPS}
              tsState={batch.ts}
              jobCompletedAt={batch.completedAt}
              cobTime={batch.cobTime}
              stepsAllDone={isBatchDone(batch)}
              stepBackLog={batch.stepBackLog}
              onCaptureCob={() =>
                setBatches((prev) =>
                  prev.map((b, idx) =>
                    idx === i ? { ...b, cobTime: new Date().toISOString() } : b
                  )
                )
              }
            />

            {done && (
              <div className="tb-batch-done-badge">
                <FiCheckCircle size={16} />
                Batch {BATCH_ORDINALS[i] ?? `${i + 1}th`} Complete
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

CrewListBatchwisePanel.propTypes = {
  batches:          PropTypes.array.isRequired,
  setBatches:       PropTypes.func.isRequired,
  activeBatchTab:   PropTypes.number.isRequired,
  setActiveBatchTab: PropTypes.func.isRequired,
  handleAddBatch:   PropTypes.func.isRequired,
  opFocusedBatch:   PropTypes.number,
  setOpFocusedBatch: PropTypes.func.isRequired,
  recentOps:        PropTypes.array,
  handleOpBlur:     PropTypes.func.isRequired,
  handleOpChipClick: PropTypes.func.isRequired,
  captureBatchTs:   PropTypes.func.isRequired,
  setUndoPending:   PropTypes.func.isRequired,
  vesselName:       PropTypes.string,
  now:              PropTypes.instanceOf(Date),
  printLaunchSlip:  PropTypes.func.isRequired,
  bookingId:        PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const TAXI_BOAT_OPERATOR_ROLE_ID = "20";
const TAXI_BOAT_CAPTAIN_ROLE_ID = "21";

function TaxiBoatCardView({ card, userRoleId = null }) {
  const serviceType = card?.typeOfService ?? "—";
  const isCrewChange     = CREW_CHANGE_SERVICES.includes(serviceType);
  const isMaterialService = MATERIAL_SERVICES.includes(serviceType);
  const isImmigration    = IMMIGRATION_SERVICES.includes(serviceType);
  const isTaxiBoatOperator = String(userRoleId ?? "") === TAXI_BOAT_OPERATOR_ROLE_ID;
  const isTaxiBoatCaptain  = String(userRoleId ?? "") === TAXI_BOAT_CAPTAIN_ROLE_ID;

  // A Taxi Boat Operator account has no separate operator record — confirmed with
  // backend that this login's own userid IS its operator_id (no dedicated field
  // exists on the user/login response, unlike e.g. vendor_id for vendor logins).
  const loggedInUserId = useAuthReducer((s) => s.userProfile?.userid ?? s.authData?.userid ?? null);

  // Open Call — call_file/get_call_detail_by_id/{call_id}/{card_id}
  const callId = card?.call_id ?? card?.callId ?? card?.id ?? null;
  const cardId = card?.card_id ?? card?.cardId ?? card?.id ?? null;
  const [callDetail, setCallDetail] = useState(null);

  useEffect(() => {
    if (callId == null || cardId == null) return undefined;
    let cancelled = false;
    groService.getCallDetailById(callId, cardId)
      .then((res) => {
        if (!cancelled) setCallDetail(res?.data?.data ?? res?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setCallDetail(null);
      });
    return () => { cancelled = true; };
  }, [callId, cardId]);

  const assignedUser = callDetail?.assigned_user_name ?? card?.user ?? "—";
  const requestedOperator = callDetail?.assigned_operator ?? card?.requestedOperator ?? "—";
  const vesselName = callDetail?.vessel_name ?? card?.vesselName ?? "—";
  const bookingDate = card?.bookingDate ?? "—";
  const location = callDetail?.port ?? card?.location ?? "—";
  const billingEntity = callDetail?.billing_entity ?? card?.name ?? "—";

  // Not yet promoted to top-level card fields by the board mapper — read from the
  // raw backend card payload until the API contract for taxi boat cards is finalized.
  const operatorId = card?.operator_id ?? card?.raw?.operator_id ?? card?.raw?.assigned_operator_id
    ?? callDetail?.assigned_operator_id
    ?? (isTaxiBoatOperator ? loggedInUserId : null);
  const bookingId = callDetail?.launch_hire_booking_id
    ?? card?.booking_id ?? card?.raw?.booking_id ?? card?.raw?.launch_hire_booking_id
    ?? card?.raw?.crew_immigration_booking_id ?? card?.callId ?? card?.id ?? null;

  const [assignedUserEdit, setAssignedUserEdit] = useState(() => card?.user ?? "");
  const [locationEdit, setLocationEdit] = useState(() => card?.location ?? "");

  useEffect(() => {
    if (!callDetail) return;
    setAssignedUserEdit(callDetail?.assigned_user_name ?? card?.user ?? "");
    setLocationEdit(callDetail?.port ?? card?.location ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callDetail]);

  const [dropTs, setDropTs] = useState(() =>
    makeTsState(STANDARD_TIMESTAMPS.map((t) => t.key))
  );
  const [pickupTs, setPickupTs] = useState(() =>
    makeTsState(STANDARD_TIMESTAMPS.map((t) => t.key))
  );
  const [activeTab, setActiveTab] = useState("drop");
  const [jobCompleted, setJobCompleted] = useState(false);
  const [jobCompletedAt, setJobCompletedAt] = useState(null);
  const [launchSlipFile, setLaunchSlipFile] = useState(null);
  const [dropCobTime, setDropCobTime] = useState(null);
  const [pickupCobTime, setPickupCobTime] = useState(null);
  const [dropStepBackLog, setDropStepBackLog] = useState([]);
  const [pickupStepBackLog, setPickupStepBackLog] = useState([]);
  const [undoPending, setUndoPending] = useState(null); // { label, resetter }

  // Operator name recorded with each timestamp
  const [operatorName, setOperatorName] = useState(() => card?.requestedOperator ?? "");
  const [dropTsOps, setDropTsOps] = useState(() => makeTsState(STANDARD_TIMESTAMPS.map(t => t.key)));
  const [pickupTsOps, setPickupTsOps] = useState(() => makeTsState(STANDARD_TIMESTAMPS.map(t => t.key)));

  // Intermediate trip form
  const addPendingCard = useCTPendingCards((state) => state.addPendingCard);
  const [addTripOpen, setAddTripOpen] = useState(false);
  const [addTripBillingEntity, setAddTripBillingEntity] = useState("");
  const [addTripPurpose, setAddTripPurpose] = useState("");
  const [addTripDestShip, setAddTripDestShip] = useState("");
  const [tripAdded, setTripAdded] = useState(false);

  // Taxi fleet assignment
  const {
    fleets, isLoadingFleets, getFleetsByOperator,
    captains, isLoadingCaptains, getCaptainsByTaxiBoat, resetCaptains,
    isAssigning, assignCaptain,
  } = useTaxiBoatAssignmentReducer((state) => state);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [selectedCaptainId, setSelectedCaptainId] = useState(null);
  const [fleetAssigned, setFleetAssigned] = useState(false);
  const [assignedCaptainName, setAssignedCaptainName] = useState(null);
  const [bookingDateEdit, setBookingDateEdit] = useState(() => parseToInputDate(card?.bookingDate));
  const [bookingTimeEdit, setBookingTimeEdit] = useState("");

  useEffect(() => {
    if (!isTaxiBoatCaptain) getFleetsByOperator(operatorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTaxiBoatCaptain, operatorId]);

  const handleSelectFleet = useCallback((fleet) => {
    setSelectedFleet(fleet);
    setSelectedCaptainId(null);
    resetCaptains();
    getCaptainsByTaxiBoat(fleet.taxi_boat_id);
  }, [resetCaptains, getCaptainsByTaxiBoat]);

  const handleAssignCaptain = useCallback(() => {
    if (!selectedFleet || !selectedCaptainId) return;
    const captain = captains.find((c) => String(c.taxiboat_captain_id) === String(selectedCaptainId));
    assignCaptain({
      booking_id: bookingId,
      taxi_boat_id: selectedFleet.taxi_boat_id,
      taxiboat_captain_id: selectedCaptainId,
      cb: () => {
        setFleetAssigned(true);
        setAssignedCaptainName(captain?.captain_name ?? null);
      },
    });
  }, [selectedFleet, selectedCaptainId, captains, bookingId, assignCaptain]);

  // Live clock — ticks every second for the live waiting timer on pending steps
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Operator quick-select — recent names from Zustand store
  const recentOps = useTaxiBoatStore((s) => s.recentOperators);
  const addRecentOperator = useTaxiBoatStore((s) => s.addRecentOperator);
  const [opFocusedBatch, setOpFocusedBatch] = useState(null);
  const opBlurTimer = useRef(null);

  const handleOpBlur = useCallback((operator) => {
    opBlurTimer.current = setTimeout(() => {
      if (operator?.trim()) addRecentOperator(operator);
      setOpFocusedBatch(null);
    }, 150);
  }, [addRecentOperator]);

  const handleOpChipClick = useCallback((batchIdx, op) => {
    clearTimeout(opBlurTimer.current);
    setBatches((prev) =>
      prev.map((b, i) => (i === batchIdx ? { ...b, operator: op } : b))
    );
    setOpFocusedBatch(null);
  }, []);

  // Scenario A: Crew Change
  const [signMode, setSignMode] = useState("sign-on");
  const [parsedCrewRows] = useState(() => {
    if (!Array.isArray(card?.crew) || card.crew.length === 0) return null;
    return card.crew.map((c) => ({
      name:        c.crewName     ?? "—",
      rank:        c.rank         ?? "—",
      nationality: c.nationality  ?? "—",
      passportNo:  c.passportNo   ?? "—",
      seamanBookNo: c.seamanBookNo ?? "—",
    }));
  });
  const crewFromCard = Array.isArray(card?.crew) && card.crew.length > 0;

  // Scenario A: Crew Change — own timestamps + print/upload
  const [crewTs, setCrewTs]               = useState(() => makeTsState(STANDARD_TIMESTAMPS.map((t) => t.key)));
  const [crewTsOps, setCrewTsOps]         = useState(() => makeTsState(STANDARD_TIMESTAMPS.map((t) => t.key)));
  const [crewStepBackLog, setCrewStepBackLog] = useState([]);
  const [crewJobCompleted, setCrewJobCompleted]   = useState(false);
  const [crewJobCompletedAt, setCrewJobCompletedAt] = useState(null);
  const [crewLaunchSlipFile, setCrewLaunchSlipFile] = useState(null);
  const [crewCobTime, setCrewCobTime]     = useState(null);

  // Scenario B: Material / Provision / Garbage
  const [packingListFile, setPackingListFile] = useState(null);
  const parsedPackingRows = packingListFile ? MOCK_PACKING_LIST_ROWS : null;

  // Scenario C: unified batch state — each batch has its own crew count, operator, timestamps, and file
  const [activeBatchTab, setActiveBatchTab] = useState(0);
  const [batches, setBatches] = useState(() => {
    const initKeys = STANDARD_TIMESTAMPS.map((t) => t.key);
    return [
      { id: 1, crewCount: "10", operator: "", ts: makeTsState(initKeys), cobTime: null, completedAt: null, stepBackLog: [], file: null, completed: false },
      { id: 2, crewCount: "8",  operator: "", ts: makeTsState(initKeys), cobTime: null, completedAt: null, stepBackLog: [], file: null, completed: false },
      { id: 3, crewCount: "6",  operator: "", ts: makeTsState(initKeys), cobTime: null, completedAt: null, stepBackLog: [], file: null, completed: false },
      { id: 4, crewCount: "5",  operator: "", ts: makeTsState(initKeys), cobTime: null, completedAt: null, stepBackLog: [], file: null, completed: false },
    ];
  });

  // Crew List — Batchwise is shown for Immigration Clearance and as the Captain/Operator
  // default view; load real batches from the booking wherever it's shown.
  const showsBatchwisePanel = !isCrewChange && !isMaterialService;
  useEffect(() => {
    if (!showsBatchwisePanel || bookingId == null) return undefined;
    let cancelled = false;
    launchHireService.getCrewImmigrationBooking(bookingId)
      .then((res) => {
        if (cancelled) return;
        const data = res?.data?.data ?? res?.data ?? {};
        const mapped = mapImmigrationBatches(data?.batches);
        if (mapped.length > 0) {
          setBatches(mapped);
          setActiveBatchTab(0);
        }
      })
      .catch(() => {
        /* keep existing/mock batches on failure */
      });
    return () => { cancelled = true; };
  }, [showsBatchwisePanel, bookingId]);

  const captureNow = useCallback((setter, key, opSetter, operator) => {
    setter((prev) => ({ ...prev, [key]: new Date().toISOString() }));
    if (opSetter) opSetter((prev) => ({ ...prev, [key]: operator || "—" }));
  }, []);

  const captureBatchTs = useCallback((batchIdx, key) => {
    setBatches((prev) =>
      prev.map((b, i) =>
        i === batchIdx
          ? { ...b, ts: { ...b.ts, [key]: new Date().toISOString() }, tsOps: { ...(b.tsOps ?? {}), [key]: b.operator || "—" } }
          : b
      )
    );
  }, []);

  const handleAddTrip = useCallback(() => {
    if (!addTripPurpose.trim()) return;
    addPendingCard({
      id: `ct-extra-${Date.now()}`,
      typeOfService: addTripPurpose.trim(),
      name: addTripBillingEntity.trim() || billingEntity,
      vesselName: addTripDestShip.trim() || vesselName,
      progress: 0,
      timeLeft: "",
    });
    setTripAdded(true);
    setAddTripOpen(false);
  }, [addTripPurpose, addTripBillingEntity, addTripDestShip, billingEntity, vesselName, addPendingCard]);

  const handleAddBatch = useCallback(() => {
    const initKeys = STANDARD_TIMESTAMPS.map((t) => t.key);
    setBatches((prev) => [
      ...prev,
      { id: prev.length + 1, crewCount: "", operator: "", ts: makeTsState(initKeys), cobTime: null, completedAt: null, stepBackLog: [], file: null, completed: false },
    ]);
    setActiveBatchTab(batches.length);
  }, [batches.length]);

  const allDone = (tsState, keys) => keys.every((k) => tsState[k] !== null);

  const tsKeys = STANDARD_TIMESTAMPS.map((t) => t.key);
  const canComplete = isImmigration
    ? batches.every((b) => b.completed)
    : allDone(dropTs, tsKeys) && allDone(pickupTs, tsKeys);

  const printLaunchSlip = useCallback((tsState, tabLabel, guide, completedAt) => {
    const slip = window.open("", "_blank", "width=820,height=680");
    if (!slip) return;
    const tsRows = STANDARD_TIMESTAMPS.map(({ key, label }, i) => {
      const val = tsState[key];
      const prevKey = i > 0 ? STANDARD_TIMESTAMPS[i - 1].key : null;
      const prevVal = prevKey ? tsState[prevKey] : null;
      const dur = val && prevVal ? formatDuration(new Date(val) - new Date(prevVal)) : null;
      return `<tr>
        <td>${label}</td>
        <td>${val ? formatDateTime(val) : "—"}</td>
        <td>${dur ?? "—"}</td>
      </tr>`;
    }).join("");
    slip.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Launch Slip</title>
<style>
  body{font-family:Arial,sans-serif;padding:36px 40px;color:#111;font-size:13px;}
  h1{font-size:20px;margin:0 0 2px;letter-spacing:.01em;}
  .sub{font-size:12px;color:#555;margin-bottom:18px;}
  .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;margin-bottom:20px;}
  .meta-item{display:flex;flex-direction:column;gap:1px;}
  .meta-label{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.05em;}
  .meta-value{font-size:13px;font-weight:600;}
  table{width:100%;border-collapse:collapse;margin-bottom:22px;}
  th{background:#f1f5f9;font-size:11px;text-align:left;padding:7px 10px;border:1px solid #e2e8f0;}
  td{font-size:12px;padding:7px 10px;border:1px solid #e2e8f0;vertical-align:top;}
  .sig-row{display:flex;gap:32px;margin-top:40px;}
  .sig-box{flex:1;border-top:1.5px solid #111;padding-top:8px;font-size:11px;color:#444;}
  .footer{margin-top:24px;font-size:10px;color:#aaa;text-align:center;}
  @media print{body{padding:0;}}
</style></head><body>
  <h1>Launch Slip &mdash; ${tabLabel}</h1>
  <div class="sub">Printed: ${new Date().toLocaleString("en-GB")}</div>
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">Vessel</span><span class="meta-value">${vesselName}</span></div>
    <div class="meta-item"><span class="meta-label">Service Type</span><span class="meta-value">${serviceType}</span></div>
    <div class="meta-item"><span class="meta-label">Billing Entity</span><span class="meta-value">${billingEntity}</span></div>
    <div class="meta-item"><span class="meta-label">Requested Operator</span><span class="meta-value">${requestedOperator}</span></div>
    <div class="meta-item"><span class="meta-label">Location</span><span class="meta-value">${location}</span></div>
    ${guide ? `<div class="meta-item"><span class="meta-label">Taxi Boat Guide</span><span class="meta-value">${guide}</span></div>` : ""}
    ${completedAt ? `<div class="meta-item"><span class="meta-label">Trip Completed</span><span class="meta-value">${formatDateTime(completedAt)}</span></div>` : ""}
  </div>
  <table>
    <thead><tr><th>Step</th><th>Captured Time</th><th>Duration</th></tr></thead>
    <tbody>${tsRows}</tbody>
  </table>
  <div class="sig-row">
    <div class="sig-box">Operator Signature</div>
    <div class="sig-box">Captain / OIM Signature</div>
    <div class="sig-box">Date &amp; Time</div>
  </div>
  <div class="footer">Sedres &mdash; Taxi Boat Launch Slip</div>
</body></html>`);
    slip.document.close();
    slip.focus();
    setTimeout(() => slip.print(), 250);
  }, [vesselName, serviceType, billingEntity, requestedOperator, location]);

  return (
    <div className="tb-card-view">
      <div className={`gro-summary-grid${isTaxiBoatOperator ? "" : " gro-summary-grid--six-col"}`}>
        {!isTaxiBoatOperator && (
          <GroSummaryCard label="Requested Operator" value={requestedOperator} />
        )}
        <GroSummaryCard label="Billing Entity" value={billingEntity} />
        <GroSummaryCard label="Vessel Name"    value={vesselName}    />
        {isTaxiBoatOperator ? (
          <GroSummaryFieldCard label="Location">
            <input
              type="text"
              className="tb-summary-input"
              value={locationEdit}
              onChange={(e) => setLocationEdit(e.target.value)}
            />
          </GroSummaryFieldCard>
        ) : (
          <GroSummaryCard label="Location" value={location} />
        )}
        {isTaxiBoatOperator ? (
          <GroSummaryFieldCard label="Booking Date">
            <DateTimePickerField
              dateValue={bookingDateEdit}
              timeValue={bookingTimeEdit}
              onDateChange={(e) => setBookingDateEdit(e.target.value)}
              onTimeChange={(e) => setBookingTimeEdit(e.target.value)}
            />
          </GroSummaryFieldCard>
        ) : (
          <GroSummaryCard label="Booking Date" value={bookingDate} />
        )}
        {isTaxiBoatOperator ? (
          <GroSummaryFieldCard label="Assigned Captian">
            <input
              type="text"
              className="tb-summary-input"
              value={assignedUserEdit}
              onChange={(e) => setAssignedUserEdit(e.target.value)}
            />
          </GroSummaryFieldCard>
        ) : (
          <GroSummaryCard label="Assigned Captian" value={assignedUser} />
        )}
      </div>

      {isTaxiBoatCaptain ? (
        <CrewListBatchwisePanel
          batches={batches}
          setBatches={setBatches}
          activeBatchTab={activeBatchTab}
          setActiveBatchTab={setActiveBatchTab}
          handleAddBatch={handleAddBatch}
          opFocusedBatch={opFocusedBatch}
          setOpFocusedBatch={setOpFocusedBatch}
          recentOps={recentOps}
          handleOpBlur={handleOpBlur}
          handleOpChipClick={handleOpChipClick}
          captureBatchTs={captureBatchTs}
          setUndoPending={setUndoPending}
          vesselName={vesselName}
          now={now}
          printLaunchSlip={printLaunchSlip}
          bookingId={bookingId}
        />
      ) : (
        <TaxiFleetAssignPanel
          bookingDate={bookingDateEdit}
          bookingTime={bookingTimeEdit}
          fleets={fleets}
          isLoadingFleets={isLoadingFleets}
          selectedFleet={selectedFleet}
          onSelectFleet={handleSelectFleet}
          captains={captains}
          isLoadingCaptains={isLoadingCaptains}
          selectedCaptainId={selectedCaptainId}
          onSelectCaptainId={setSelectedCaptainId}
          isAssigning={isAssigning}
          assigned={fleetAssigned}
          assignedCaptainName={assignedCaptainName}
          onAssignCaptain={handleAssignCaptain}
        />
      )}

      {/* Scenario A: Crew Change */}
      {isCrewChange && (
        <div className="tb-scenario-section">
          <h3 className="tb-section-title">Crew List</h3>
          <div className="tb-sign-mode-row">
            <div className="tb-sign-mode-toggle">
              <div className={`tb-sign-mode-slider${signMode === "sign-off" ? " tb-sign-mode-slider--off" : ""}`} />
              <button
                data-mode="sign-on"
                className={`tb-sign-mode-btn${signMode === "sign-on" ? " tb-sign-mode-btn--active" : ""}`}
                onClick={() => setSignMode("sign-on")}
              >
                <span className={`tb-ship-icon tb-ship-icon--in${signMode === "sign-on" ? " tb-ship-icon--sailing" : ""}`}>
                  <FaShip size={16} />
                </span>
                Sign On
              </button>
              <button
                data-mode="sign-off"
                className={`tb-sign-mode-btn${signMode === "sign-off" ? " tb-sign-mode-btn--active" : ""}`}
                onClick={() => setSignMode("sign-off")}
              >
                Sign Off
                <span className={`tb-ship-icon tb-ship-icon--out${signMode === "sign-off" ? " tb-ship-icon--sailing" : ""}`}>
                  <FaShip size={16} />
                </span>
              </button>
            </div>
            <span className="tb-sign-mode-hint">
              {signMode === "sign-on" ? "Crew boarding the vessel" : "Crew disembarking the vessel"}
            </span>
          </div>
          {parsedCrewRows && (
            <>
              <span className="tb-ai-parse-status">
                {crewFromCard
                  ? `From operator card — ${parsedCrewRows.length} crew members`
                  : `AI parsed — ${parsedCrewRows.length} crew members found`}
              </span>
              <div className="tb-crew-table-wrapper">
                <table className="tb-crew-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Rank</th>
                      <th>Nationality</th>
                      <th>Passport No.</th>
                      <th>Seaman Book No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedCrewRows.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{row.name}</td>
                        <td>{row.rank}</td>
                        <td>{row.nationality}</td>
                        <td>{row.passportNo}</td>
                        <td>{row.seamanBookNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <h3 className="tb-section-title">Movement Timestamps</h3>
          <TimestampStepper
            timestamps={STANDARD_TIMESTAMPS}
            tsState={crewTs}
            tsOps={crewTsOps}
            shipName={vesselName}
            onCapture={(key) => captureNow(setCrewTs, key, setCrewTsOps, operatorName)}
            onComplete={() => { setCrewJobCompleted(true); setCrewJobCompletedAt(new Date().toISOString()); }}
            jobCompleted={crewJobCompleted}
            canFinish={STANDARD_TIMESTAMPS.every((t) => crewTs[t.key] !== null)}
            now={now}
            onUndo={(key, label) => setUndoPending({
              label,
              resetter: () => { setCrewTs((prev) => ({ ...prev, [key]: null })); setCrewTsOps((prev) => ({ ...prev, [key]: null })); setCrewJobCompleted(false); setCrewJobCompletedAt(null); },
              addToLog: (reason) => setCrewStepBackLog((prev) => [...prev, { step: label, reason, time: new Date().toISOString() }]),
            })}
          />
          <TimestampSummaryTable
            timestamps={STANDARD_TIMESTAMPS}
            tsState={crewTs}
            jobCompletedAt={crewJobCompletedAt}
            cobTime={crewCobTime}
            stepsAllDone={STANDARD_TIMESTAMPS.every((t) => crewTs[t.key] !== null)}
            stepBackLog={crewStepBackLog}
            onCaptureCob={() => setCrewCobTime(new Date().toISOString())}
          />
          {crewJobCompleted && (
            <div className="tb-batch-actions">
              <button
                className="tb-batch-print-btn"
                onClick={() => printLaunchSlip(crewTs, `Crew Change — ${signMode === "sign-on" ? "Sign On" : "Sign Off"}`, operatorName, crewJobCompletedAt)}
              >
                <FiPrinter size={14} />
                Print Launch Slip
              </button>
              <div>
                <input
                  type="file"
                  id="tb-crew-launch-slip-file"
                  className="tb-launch-slip-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCrewLaunchSlipFile(e.target.files?.[0] ?? null)}
                />
                <label htmlFor="tb-crew-launch-slip-file" className="tb-batch-upload-btn">
                  <FiUpload size={14} />
                  {crewLaunchSlipFile ? crewLaunchSlipFile.name : "Upload Launch Slip"}
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scenario B: Material / Provision / Garbage Collection */}
      {isMaterialService && (
        <div className="tb-scenario-section">
          <h3 className="tb-section-title">Packing List</h3>
          <div className="tb-excel-upload-row">
            <input
              type="file"
              id="tb-packing-list-input"
              className="tb-excel-upload-input"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setPackingListFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="tb-packing-list-input" className="tb-excel-upload-btn">
              <FiUpload size={15} />
              {packingListFile ? "Replace File" : "Upload Packing List"}
            </label>
            {packingListFile && (
              <span className="tb-excel-upload-filename">{packingListFile.name}</span>
            )}
          </div>
          {parsedPackingRows && (
            <>
              <span className="tb-ai-parse-status">
                AI parsed — {parsedPackingRows.length} items found
              </span>
              <div className="tb-crew-table-wrapper">
                <table className="tb-crew-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item No.</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Weight (kg)</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPackingRows.map((row, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{row.itemNo}</td>
                        <td>{row.description}</td>
                        <td>{row.qty}</td>
                        <td>{row.unit}</td>
                        <td>{row.weight}</td>
                        <td>{row.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Scenario C: Immigration Clearance — per-batch tabs (Captain already sees this above, in place of Fleet Assignment) */}
      {isImmigration && !isTaxiBoatCaptain && (
        <CrewListBatchwisePanel
          batches={batches}
          setBatches={setBatches}
          activeBatchTab={activeBatchTab}
          setActiveBatchTab={setActiveBatchTab}
          handleAddBatch={handleAddBatch}
          opFocusedBatch={opFocusedBatch}
          setOpFocusedBatch={setOpFocusedBatch}
          recentOps={recentOps}
          handleOpBlur={handleOpBlur}
          handleOpChipClick={handleOpChipClick}
          captureBatchTs={captureBatchTs}
          setUndoPending={setUndoPending}
          vesselName={vesselName}
          now={now}
          printLaunchSlip={printLaunchSlip}
          bookingId={bookingId}
        />
      )}

      {!isImmigration && !isCrewChange && isTaxiBoatOperator && (
        <CrewListBatchwisePanel
          batches={batches}
          setBatches={setBatches}
          activeBatchTab={activeBatchTab}
          setActiveBatchTab={setActiveBatchTab}
          handleAddBatch={handleAddBatch}
          opFocusedBatch={opFocusedBatch}
          setOpFocusedBatch={setOpFocusedBatch}
          recentOps={recentOps}
          handleOpBlur={handleOpBlur}
          handleOpChipClick={handleOpChipClick}
          captureBatchTs={captureBatchTs}
          setUndoPending={setUndoPending}
          vesselName={vesselName}
          now={now}
          printLaunchSlip={printLaunchSlip}
          bookingId={bookingId}
        />
      )}

      {!isImmigration && !isCrewChange && !isTaxiBoatOperator && (
        <div className="tb-section">
          <h3 className="tb-section-title">Movement Timestamps</h3>
          <div className="tb-tabs">
            <button
              className={`tb-tab${activeTab === "drop" ? " tb-tab--active" : ""}`}
              onClick={() => setActiveTab("drop")}
            >
              <span
                key={`drop-${activeTab}`}
                className={`tb-tab-vessel-wrap${activeTab === "drop" ? " tb-tab-vessel-wrap--drop-firing" : ""}`}
              >
                <FaShip size={12} />
                <span className="tb-tab-cargo-dot" />
              </span>
              Drop
            </button>
            <button
              className={`tb-tab${activeTab === "pickup" ? " tb-tab--active" : ""}`}
              onClick={() => setActiveTab("pickup")}
            >
              <span
                key={`pickup-${activeTab}`}
                className={`tb-tab-vessel-wrap${activeTab === "pickup" ? " tb-tab-vessel-wrap--pickup-firing" : ""}`}
              >
                <FaShip size={12} />
                <span className="tb-tab-cargo-dot" />
              </span>
              Pickup
            </button>
          </div>
          <div key={activeTab} className={`tb-ts-panel tb-ts-panel--${activeTab}`}>
            {activeTab === "drop" ? (
              <>
                <TimestampStepper
                  timestamps={STANDARD_TIMESTAMPS}
                  tsState={dropTs}
                  tsOps={dropTsOps}
                  shipName={vesselName}
                  intermediateTrip={tripAdded ? { purpose: addTripPurpose, destShip: addTripDestShip, billingEntity: addTripBillingEntity } : undefined}
                  onCapture={(key) => captureNow(setDropTs, key, setDropTsOps, operatorName)}
                  onComplete={() => { setJobCompleted(true); setJobCompletedAt(new Date().toISOString()); }}
                  jobCompleted={jobCompleted}
                  canFinish={allDone(dropTs, tsKeys)}
                  now={now}
                  onUndo={(key, label) => setUndoPending({
                    label,
                    resetter: () => { setDropTs((prev) => ({ ...prev, [key]: null })); setDropTsOps((prev) => ({ ...prev, [key]: null })); setJobCompleted(false); setJobCompletedAt(null); },
                    addToLog: (reason) => setDropStepBackLog((prev) => [...prev, { step: label, reason, time: new Date().toISOString() }]),
                  })}
                />
                {dropTs.boatCastOffShip && (
                  tripAdded ? (
                    <div className="tb-add-trip-done"><FiCheckCircle size={13} />New task added to Coordinator Board</div>
                  ) : addTripOpen ? (
                    <div className="tb-add-trip-form">
                      <span className="tb-add-trip-form-title">Intermediate Trip Details</span>
                      <div className="tb-add-trip-fields">
                        <label className="tb-add-trip-label">Billing Entity</label>
                        <input className="tb-add-trip-input" type="text" placeholder="Billing entity..." value={addTripBillingEntity} onChange={(e) => setAddTripBillingEntity(e.target.value)} />
                        <label className="tb-add-trip-label">Purpose <span className="tb-add-trip-required">*</span></label>
                        <input className="tb-add-trip-input" type="text" placeholder="e.g. Material Delivery, Crew Change..." value={addTripPurpose} onChange={(e) => setAddTripPurpose(e.target.value)} />
                        <label className="tb-add-trip-label">Destination Ship</label>
                        <input className="tb-add-trip-input" type="text" placeholder="Vessel name..." value={addTripDestShip} onChange={(e) => setAddTripDestShip(e.target.value)} />
                      </div>
                      <div className="tb-add-trip-btns">
                        <button className="tb-add-trip-submit" onClick={handleAddTrip} disabled={!addTripPurpose.trim()}>Add to Board</button>
                        <button className="tb-add-trip-cancel" onClick={() => setAddTripOpen(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="tb-add-trip-btn" onClick={() => { setAddTripBillingEntity(billingEntity !== "—" ? billingEntity : ""); setAddTripDestShip(vesselName !== "—" ? vesselName : ""); setAddTripOpen(true); }}>
                      <FiPlus size={13} />Add Intermediate Trip
                    </button>
                  )
                )}
                <TimestampSummaryTable
                  timestamps={STANDARD_TIMESTAMPS}
                  tsState={dropTs}
                  jobCompletedAt={jobCompletedAt}
                  cobTime={dropCobTime}
                  stepsAllDone={allDone(dropTs, tsKeys)}
                  stepBackLog={dropStepBackLog}
                  onCaptureCob={() => setDropCobTime(new Date().toISOString())}
                />
              </>
            ) : (
              <>
                <TimestampStepper
                  timestamps={STANDARD_TIMESTAMPS}
                  tsState={pickupTs}
                  tsOps={pickupTsOps}
                  shipName={vesselName}
                  intermediateTrip={tripAdded ? { purpose: addTripPurpose, destShip: addTripDestShip, billingEntity: addTripBillingEntity } : undefined}
                  onCapture={(key) => captureNow(setPickupTs, key, setPickupTsOps, operatorName)}
                  onComplete={() => { setJobCompleted(true); setJobCompletedAt(new Date().toISOString()); }}
                  jobCompleted={jobCompleted}
                  canFinish={allDone(pickupTs, tsKeys)}
                  now={now}
                  onUndo={(key, label) => setUndoPending({
                    label,
                    resetter: () => { setPickupTs((prev) => ({ ...prev, [key]: null })); setPickupTsOps((prev) => ({ ...prev, [key]: null })); setJobCompleted(false); setJobCompletedAt(null); },
                    addToLog: (reason) => setPickupStepBackLog((prev) => [...prev, { step: label, reason, time: new Date().toISOString() }]),
                  })}
                />
                {pickupTs.boatCastOffShip && (
                  tripAdded ? (
                    <div className="tb-add-trip-done"><FiCheckCircle size={13} />New task added to Coordinator Board</div>
                  ) : addTripOpen ? (
                    <div className="tb-add-trip-form">
                      <span className="tb-add-trip-form-title">Intermediate Trip Details</span>
                      <div className="tb-add-trip-fields">
                        <label className="tb-add-trip-label">Billing Entity</label>
                        <input className="tb-add-trip-input" type="text" placeholder="Billing entity..." value={addTripBillingEntity} onChange={(e) => setAddTripBillingEntity(e.target.value)} />
                        <label className="tb-add-trip-label">Purpose <span className="tb-add-trip-required">*</span></label>
                        <input className="tb-add-trip-input" type="text" placeholder="e.g. Material Delivery, Crew Change..." value={addTripPurpose} onChange={(e) => setAddTripPurpose(e.target.value)} />
                        <label className="tb-add-trip-label">Destination Ship</label>
                        <input className="tb-add-trip-input" type="text" placeholder="Vessel name..." value={addTripDestShip} onChange={(e) => setAddTripDestShip(e.target.value)} />
                      </div>
                      <div className="tb-add-trip-btns">
                        <button className="tb-add-trip-submit" onClick={handleAddTrip} disabled={!addTripPurpose.trim()}>Add to Board</button>
                        <button className="tb-add-trip-cancel" onClick={() => setAddTripOpen(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="tb-add-trip-btn" onClick={() => { setAddTripBillingEntity(billingEntity !== "—" ? billingEntity : ""); setAddTripDestShip(vesselName !== "—" ? vesselName : ""); setAddTripOpen(true); }}>
                      <FiPlus size={13} />Add Intermediate Trip
                    </button>
                  )
                )}
                <TimestampSummaryTable
                  timestamps={STANDARD_TIMESTAMPS}
                  tsState={pickupTs}
                  jobCompletedAt={jobCompletedAt}
                  cobTime={pickupCobTime}
                  stepsAllDone={allDone(pickupTs, tsKeys)}
                  stepBackLog={pickupStepBackLog}
                  onCaptureCob={() => setPickupCobTime(new Date().toISOString())}
                />
              </>
            )}
          </div>
          {jobCompleted && (
            <div className="tb-batch-actions">
              <button className="tb-batch-print-btn" onClick={() => printLaunchSlip(activeTab === "drop" ? dropTs : pickupTs, activeTab === "drop" ? "Drop Trip" : "Pickup Trip", operatorName, jobCompletedAt)}>
                <FiPrinter size={14} />
                Print Launch Slip
              </button>
              <div>
                <input
                  type="file"
                  id="tb-launch-slip-file"
                  className="tb-launch-slip-input"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setLaunchSlipFile(e.target.files?.[0] ?? null)}
                />
                <label htmlFor="tb-launch-slip-file" className="tb-batch-upload-btn">
                  <FiUpload size={14} />
                  {launchSlipFile ? launchSlipFile.name : "Upload Launch Slip"}
                </label>
              </div>
            </div>
          )}
        </div>
      )}


      <div className="tb-card-footer-bar">
        <button className="tb-save-btn">Save</button>
      </div>

      {undoPending && (
        <ConfirmDialog
          label={undoPending.label}
          onConfirm={(reason) => { undoPending.resetter(); undoPending.addToLog?.(reason); setUndoPending(null); }}
          onCancel={() => setUndoPending(null)}
        />
      )}
    </div>
  );
}

TaxiBoatCardView.propTypes = {
  card: PropTypes.object,
  userRoleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default TaxiBoatCardView;
