import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { FiFlag, FiAnchor, FiNavigation, FiHome, FiArrowDown, FiArrowUp, FiClock, FiUpload, FiPlus, FiCheckCircle, FiPrinter } from "react-icons/fi";
import { FaShip } from "react-icons/fa";
import { MdDirectionsBoat } from "react-icons/md";
import "../../../../../../design/scss/pages/kanban-board/taxi-boat-card.scss";
import "../../../../../../design/scss/pages/kanban-board/taxi-boat-service-scenarios.scss";

const CREW_CHANGE_SERVICES = ["Crew Change"];
const MATERIAL_SERVICES   = ["Material Delivery", "Provision Delivery", "Garbage Collection"];
const IMMIGRATION_SERVICES = ["Immigration Clearance"];

const MOCK_CREW_ROWS = [
  { name: "Ahmed Al-Rashid",  rank: "Chief Officer", nationality: "Saudi",    passportNo: "P1234567", seamanBookNo: "SB-10021" },
  { name: "Vikram Singh",     rank: "2nd Engineer",  nationality: "Indian",   passportNo: "P2345678", seamanBookNo: "SB-10022" },
  { name: "Juan Dela Cruz",   rank: "AB Seaman",     nationality: "Filipino", passportNo: "P3456789", seamanBookNo: "SB-10023" },
  { name: "Omar Hassan",      rank: "Cook",          nationality: "Egyptian", passportNo: "P4567890", seamanBookNo: "SB-10024" },
];

function getBatchCrewRows(crewCount) {
  const n = Math.max(0, parseInt(crewCount, 10) || 0);
  if (n === 0) return [];
  return Array.from({ length: n }, (_, i) => ({ ...MOCK_CREW_ROWS[i % MOCK_CREW_ROWS.length] }));
}

const STANDARD_TIMESTAMPS = [
  { key: "castOff",           label: "Cast off Time",       icon: FiFlag,       animKey: "castOff"           },
  { key: "boatAlongsideShip", label: "Boat Alongside Ship", icon: FiAnchor,     animKey: "boatAlongsideShip" },
  { key: "boatCastOffShip",   label: "Boat Cast off Ship",  icon: FiNavigation, animKey: "boatCastOffShip"   },
  { key: "backToJetty",       label: "Back to Jetty",       icon: FiHome,       animKey: "backToJetty"       },
];

const BATCH_ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

const makeTsState = (keys) =>
  keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});

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

function TimestampStepper({ timestamps, tsState, onCapture, onComplete, jobCompleted, canFinish }) {
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
      {timestamps.map(({ key, label, icon: Icon, animKey }, i) => {
        const done = tsState[key] !== null;
        const prevDone = i === 0 || tsState[timestamps[i - 1].key] !== null;
        const isNext = !done && prevDone;
        const isLocked = !done && !isNext;
        return (
          <li
            key={key}
            className={[
              "tb-stepper-item",
              done     ? "tb-stepper-item--done"   : "",
              isNext   ? "tb-stepper-item--next"   : "",
              isLocked ? "tb-stepper-item--locked" : "",
            ].filter(Boolean).join(" ")}
            onClick={() => isNext && onCapture(key)}
            role={isNext ? "button" : undefined}
            tabIndex={isNext ? 0 : -1}
            onKeyDown={(e) => {
              if (isNext && (e.key === "Enter" || e.key === " ")) onCapture(key);
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
                <span className="tb-stepper-label">{label}</span>
                <span className={[
                  "tb-stepper-pill",
                  done   ? "tb-stepper-pill--done" : "",
                  isNext ? "tb-stepper-pill--next" : "",
                ].filter(Boolean).join(" ")}>
                  {done ? formatDateTime(tsState[key]) : isNext ? "Tap to capture" : "—"}
                </span>
              </div>
            </div>
          </li>
        );
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
              <span className="tb-stepper-label">Job Completed</span>
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
            <span className="tb-stepper-label">Job Completed</span>
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

function TaxiBoatCardView({ card }) {
  const serviceType = card?.typeOfService ?? "—";
  const assignedUser = card?.user ?? "—";
  const requestedOperator = card?.requestedOperator ?? "—";
  const vesselName = card?.vesselName ?? "—";
  const bookingDate = card?.bookingDate ?? "—";
  const location = card?.location ?? "—";
  const billingEntity = card?.name ?? "—";
  const isCrewChange     = CREW_CHANGE_SERVICES.includes(serviceType);
  const isMaterialService = MATERIAL_SERVICES.includes(serviceType);
  const isImmigration    = IMMIGRATION_SERVICES.includes(serviceType);

  const [dropTs, setDropTs] = useState(() =>
    makeTsState(STANDARD_TIMESTAMPS.map((t) => t.key))
  );
  const [pickupTs, setPickupTs] = useState(() =>
    makeTsState(STANDARD_TIMESTAMPS.map((t) => t.key))
  );
  const [activeTab, setActiveTab] = useState("drop");
  const [jobCompleted, setJobCompleted] = useState(false);
  const [launchSlipFile, setLaunchSlipFile] = useState(null);

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

  // Scenario B: Material / Provision / Garbage
  const [packingListFile, setPackingListFile] = useState(null);

  // Scenario C: unified batch state — each batch has its own crew count, operator, timestamps, and file
  const [activeBatchTab, setActiveBatchTab] = useState(0);
  const [batches, setBatches] = useState(() => {
    const initKeys = STANDARD_TIMESTAMPS.map((t) => t.key);
    return [
      { id: 1, crewCount: "10", operator: "", ts: makeTsState(initKeys), file: null, completed: false },
      { id: 2, crewCount: "8",  operator: "", ts: makeTsState(initKeys), file: null, completed: false },
      { id: 3, crewCount: "6",  operator: "", ts: makeTsState(initKeys), file: null, completed: false },
      { id: 4, crewCount: "5",  operator: "", ts: makeTsState(initKeys), file: null, completed: false },
    ];
  });

  const captureNow = useCallback((setter, key) => {
    setter((prev) => ({ ...prev, [key]: new Date().toISOString() }));
  }, []);

  const captureBatchTs = useCallback((batchIdx, key) => {
    setBatches((prev) =>
      prev.map((b, i) =>
        i === batchIdx ? { ...b, ts: { ...b.ts, [key]: new Date().toISOString() } } : b
      )
    );
  }, []);

  const handleAddBatch = useCallback(() => {
    const initKeys = STANDARD_TIMESTAMPS.map((t) => t.key);
    setBatches((prev) => [
      ...prev,
      { id: prev.length + 1, crewCount: "", operator: "", ts: makeTsState(initKeys), file: null, completed: false },
    ]);
    setActiveBatchTab(batches.length);
  }, [batches.length]);

  const allDone = (tsState, keys) => keys.every((k) => tsState[k] !== null);
  const isBatchDone = (batch) => STANDARD_TIMESTAMPS.every((t) => batch.ts[t.key] !== null);

  const tsKeys = STANDARD_TIMESTAMPS.map((t) => t.key);
  const canComplete = isImmigration
    ? batches.every((b) => b.completed)
    : allDone(dropTs, tsKeys) && allDone(pickupTs, tsKeys);

  return (
    <div className="tb-card-view">
      <div className="tb-info-grid">
        <InfoCard label="Assigned User"      value={assignedUser}      />
        <InfoCard label="Requested Operator" value={requestedOperator} />
        <InfoCard label="Billing Entity"     value={billingEntity}     />
        <InfoCard label="Vessel Name"        value={vesselName}        />
        <InfoCard label="Location"           value={location}          />
        <InfoCard label="Booking Date"       value={bookingDate}       />
      </div>

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
              Upload Packing List
            </label>
            {packingListFile && (
              <span className="tb-excel-upload-filename">{packingListFile.name}</span>
            )}
          </div>
        </div>
      )}

      {/* Scenario C: Immigration Clearance — per-batch tabs */}
      {isImmigration && (
        <div className="tb-scenario-section">
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
                Batch {BATCH_ORDINALS[i] ?? `${i + 1}th`}
              </button>
            ))}
            <button className="tb-add-batch-btn" onClick={handleAddBatch}>
              <FiPlus size={14} />
              Add Batch
            </button>
          </div>

          {batches.map((batch, i) => {
            if (i !== activeBatchTab) return null;
            const crewRows = getBatchCrewRows(batch.crewCount);
            const done = isBatchDone(batch);
            return (
              <div key={batch.id} className="tb-batch-tab-content">
                <div className="tb-batch-meta-row">
                  <div className="tb-batch-field-row">
                    <span className="tb-batch-field-label">
                      No. of Crew — Batch {BATCH_ORDINALS[i] ?? `${i + 1}th`}
                    </span>
                    <input
                      type="number"
                      className="tb-batch-field-input"
                      min="1"
                      value={batch.crewCount}
                      onChange={(e) =>
                        setBatches((prev) =>
                          prev.map((b, idx) =>
                            idx === i ? { ...b, crewCount: e.target.value } : b
                          )
                        )
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="tb-batch-field-row">
                    <span className="tb-batch-field-label">Operator</span>
                    <input
                      type="text"
                      className="tb-batch-field-input tb-batch-operator-input"
                      value={batch.operator}
                      onChange={(e) =>
                        setBatches((prev) =>
                          prev.map((b, idx) =>
                            idx === i ? { ...b, operator: e.target.value } : b
                          )
                        )
                      }
                      placeholder="Operator name"
                    />
                  </div>
                </div>

                {crewRows.length > 0 && (
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
                        {crewRows.map((row, ri) => (
                          <tr key={ri}>
                            <td>{ri + 1}</td>
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
                )}

                <TimestampStepper
                  timestamps={STANDARD_TIMESTAMPS}
                  tsState={batch.ts}
                  onCapture={(key) => captureBatchTs(i, key)}
                  onComplete={() => setBatches((prev) => prev.map((b, idx) => idx === i ? { ...b, completed: true } : b))}
                  jobCompleted={batch.completed}
                  canFinish={isBatchDone(batch)}
                />

                <div className="tb-batch-actions">
                  <button className="tb-batch-print-btn">
                    <FiPrinter size={14} />
                    Print Batch {BATCH_ORDINALS[i] ?? `${i + 1}th`}
                  </button>
                  <div>
                    <input
                      type="file"
                      id={`tb-batch-file-${batch.id}`}
                      className="tb-launch-slip-input"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setBatches((prev) =>
                          prev.map((b, idx) =>
                            idx === i ? { ...b, file: e.target.files?.[0] ?? null } : b
                          )
                        )
                      }
                    />
                    <label htmlFor={`tb-batch-file-${batch.id}`} className="tb-batch-upload-btn">
                      <FiUpload size={14} />
                      {batch.file ? batch.file.name : `Upload Batch ${BATCH_ORDINALS[i] ?? `${i + 1}th`}`}
                    </label>
                  </div>
                </div>

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
      )}

      {!isImmigration && (
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
              <TimestampStepper
                timestamps={STANDARD_TIMESTAMPS}
                tsState={dropTs}
                onCapture={(key) => captureNow(setDropTs, key)}
                onComplete={() => setJobCompleted(true)}
                jobCompleted={jobCompleted}
                canFinish={allDone(dropTs, tsKeys)}
              />
            ) : (
              <TimestampStepper
                timestamps={STANDARD_TIMESTAMPS}
                tsState={pickupTs}
                onCapture={(key) => captureNow(setPickupTs, key)}
                onComplete={() => setJobCompleted(true)}
                jobCompleted={jobCompleted}
                canFinish={allDone(pickupTs, tsKeys)}
              />
            )}
          </div>
        </div>
      )}


      {(isImmigration ? canComplete : jobCompleted) && (
        <div className="tb-launch-slip-section">
          <h4 className="tb-launch-slip-title">Upload Launch Slip</h4>
          <p className="tb-launch-slip-hint">Please upload the signed Launch Slip to finalize this job.</p>
          <div className="tb-launch-slip-upload">
            <input
              type="file"
              id="tb-launch-slip-input"
              className="tb-launch-slip-input"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setLaunchSlipFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="tb-launch-slip-input" className="tb-launch-slip-btn">
              {launchSlipFile ? "Change File" : "Choose File"}
            </label>
            {launchSlipFile && (
              <span className="tb-launch-slip-filename">{launchSlipFile.name}</span>
            )}
          </div>
        </div>
      )}
      <div className="tb-card-footer-bar">
        <button className="tb-save-btn">Save</button>
      </div>
    </div>
  );
}

TaxiBoatCardView.propTypes = {
  card: PropTypes.object,
};

export default TaxiBoatCardView;
