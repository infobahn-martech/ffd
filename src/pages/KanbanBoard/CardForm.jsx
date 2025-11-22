import { useState } from "react";
import PropTypes from "prop-types";
import "../../design/css/CardForm.css";
import GroupSettingsIcon from "../../assets/images/cv.png";
import CircleTickIcon from "../../assets/images/CircleTick.svg";
import ColorPickerIcon from "../../assets/images/ColorPicker.png";
import PriorityIcon from "../../assets/images/Priority.png";

function CardForm({ show, close, card }) {
  if (!show) return null;

  const [activeOperationTab, setActiveOperationTab] = useState("preArrival");

  const [formValues, setFormValues] = useState({
    owner: card?.user || "None",
    appointmentReceivedDate: card?.appointmentReceivedDate || "",
    appointmentAcceptanceDate: card?.appointmentAcceptanceDate || "",
    lastPort: card?.lastPort || "",
    etaDate: card?.etaDate || "",
    etaTime: card?.etaTime || "",
    customsStart: card?.customsStart || "",
    clearanceCompletion: card?.clearanceCompletion || "",
    lastMovedDate: card?.lastMovedDate || "",
    lastMovedTime: card?.lastMovedTime || "",
  });

  const handleChange = (field) => (e) =>
    setFormValues({ ...formValues, [field]: e.target.value });

  const handleUpdate = () => close();

  const accentColor = card?.color || "#2A00FF";
  const ownerInitial = formValues.owner?.[0]?.toUpperCase() || "N";

  return (
    <div className="cardform-overlay" onClick={close}>
      <div className="cardform-panel" onClick={(e) => e.stopPropagation()}>

        {/* Top bar */}
        <div className="cardform-topbar" style={{ backgroundColor: accentColor }}>
          <div>
            <span className="cardform-id">ID : {card?.code || card?.id}</span>
            <span className="cardform-title">{card?.title}</span>
          </div>

          <div className="cardform-topbar-right">
            <button className="topbar-icon-btn"><img src={ColorPickerIcon} /></button>
            <button className="topbar-icon-btn"><img src={PriorityIcon} /></button>
            <button className="cardform-close-btn" onClick={close}>✕</button>
          </div>
        </div>

        {/* ===== TOP TABS (RESTORED) ===== */}
        <div className="cardform-tabs">
          <button className="tab">General</button>
          <button className="tab active">Operation</button>
          <button className="tab">Checklist</button>
          <button className="tab">Husbandry</button>
          <button className="tab">Attachments</button>
          <button className="tab">Sales Order</button>
          <button className="tab">Tasks</button>
          <button className="tab">Reports</button>
          <button className="tab">KPI</button>
        </div>


        {/* ===== NEW OPERATION SIDE TABS ===== */}
        <div className="operation-wrapper">
          <div className="operation-left">
            <button
              className={`op-tab ${activeOperationTab === "preArrival" ? "active" : ""}`}
              onClick={() => setActiveOperationTab("preArrival")}
            >
              Pre Arrival
            </button>

            <button
              className={`op-tab ${activeOperationTab === "arrival" ? "active" : ""}`}
              onClick={() => setActiveOperationTab("arrival")}
            >
              Arrival
            </button>

            <button
              className={`op-tab ${activeOperationTab === "departure" ? "active" : ""}`}
              onClick={() => setActiveOperationTab("departure")}
            >
              Departure
            </button>
          </div>

          {/* RIGHT SIDE CONTENT */}
          <div className="operation-right">

            {/* ===== PRE ARRIVAL CONTENT ===== */}
            {activeOperationTab === "preArrival" && (
              <div className="cardform-left-full">

                <div className="cf-section">
                  <div className="cf-section-header">
                    <span className="cf-section-icon">
                      <img src={GroupSettingsIcon} />
                    </span>
                    <span className="cf-section-title">Card fields</span>
                  </div>

                  <div className="cf-section-body">

                    {/* Owner */}
                    <div className="cf-field">
                      <label>Owner</label>
                      <div className="cf-owner-row">
                        <div className="cf-owner-avatar">{ownerInitial}</div>
                        <select
                          value={formValues.owner}
                          onChange={handleChange("owner")}
                          className="cf-owner-select"
                        >
                          <option value="None">None</option>
                          <option value={card?.user}>{card?.user}</option>
                        </select>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="cf-grid two">
                      <div className="cf-field">
                        <label>Appointment Received Date</label>
                        <div className="cf-input">
                          <input
                            type="date"
                            value={formValues.appointmentReceivedDate}
                            onChange={handleChange("appointmentReceivedDate")}
                          />
                        </div>
                      </div>

                      <div className="cf-field">
                        <label>Appointment Acceptance Date</label>
                        <div className="cf-input">
                          <input
                            type="date"
                            value={formValues.appointmentAcceptanceDate}
                            onChange={handleChange("appointmentAcceptanceDate")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Last Port / ETA */}
                    <div className="cf-grid two">
                      <div className="cf-field">
                        <label>Last Port</label>
                        <div className="cf-input">
                          <input
                            type="text"
                            value={formValues.lastPort}
                            onChange={handleChange("lastPort")}
                          />
                        </div>
                      </div>

                      <div className="cf-field">
                        <label>ETA</label>
                        <div className="cf-input eta-row">
                          <input type="date" value={formValues.etaDate} onChange={handleChange("etaDate")} />
                          <input type="time" value={formValues.etaTime} onChange={handleChange("etaTime")} />
                        </div>
                      </div>
                    </div>

                    {/* Customs */}
                    <div className="cf-field">
                      <label>Expected commencement of customs inspection</label>
                      <div className="cf-input">
                        <input
                          type="text"
                          placeholder="Enter..."
                          value={formValues.customsStart}
                          onChange={handleChange("customsStart")}
                        />
                      </div>
                    </div>

                    <div className="cf-field">
                      <label>Expected completion of inward clearance</label>
                      <div className="cf-input">
                        <input
                          type="text"
                          placeholder="Enter..."
                          value={formValues.clearanceCompletion}
                          onChange={handleChange("clearanceCompletion")}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Attachments */}
                <div className="cf-section">
                  <div className="cf-section-header">
                    <span className="cf-section-icon"><img src={CircleTickIcon} /></span>
                    <span className="cf-section-title">Attachments</span>
                  </div>
                  <div className="cf-section-body">
                    <div className="cf-empty-row">
                      <p>No attachments added.</p>
                      <button className="cf-link-btn">+ Add attachment</button>
                    </div>
                  </div>
                </div>

                {/* links */}
                <div className="cf-section">
                  <div className="cf-section-header">
                    <span className="cf-section-icon"><img src={CircleTickIcon} /></span>
                    <span className="cf-section-title">Links</span>
                  </div>
                  <div className="cf-section-body">
                    <div className="cf-empty-row">
                      <p>No links added.</p>
                      <button className="cf-link-btn">+ Add Link</button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ===== ARRIVAL DETAILS ===== */}
            {activeOperationTab === "arrival" && (
              <div className="operation-content-box">
                <h2>Arrival Details</h2>
                <p>Show arrival details here…</p>
              </div>
            )}

            {/* ===== DEPARTURE DETAILS ===== */}
            {activeOperationTab === "departure" && (
              <div className="operation-content-box">
                <h2>Departure Details</h2>
                <p>Show departure details here…</p>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="cardform-footer">
          {/* ===== STEPS PROGRESS BAR (RESTORED) ===== */}
          <div className="cardform-steps-wrapper">
            <div className="step-item completed">
              <div className="step-circle">1</div>
              <span className="step-line"></span>
            </div>

            <div className="step-item active">
              <div className="step-circle">2</div>
              <span className="step-line"></span>
            </div>

            <div className="step-item">
              <div className="step-circle">3</div>
              <span className="step-line"></span>
            </div>

            <div className="step-item">
              <div className="step-circle">4</div>
              <span className="step-line"></span>
            </div>

            <div className="step-item">
              <div className="step-circle">5</div>
            </div>
          </div>

          <button
            className="cardform-update-btn"
            style={{ backgroundColor: accentColor }}
            onClick={handleUpdate}
          >
            Update Card
          </button>
        </div>

      </div>
    </div>
  );
}

export default CardForm;
