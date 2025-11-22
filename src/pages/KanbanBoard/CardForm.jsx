import { useState } from "react";
import PropTypes from "prop-types";
import "../../design/css/CardForm.css";
import GroupSettingsIcon from "../../assets/images/cv.png";
import CircleTickIcon from "../../assets/images/CircleTick.svg";
import ColorPickerIcon from "../../assets/images/ColorPicker.png";
import PriorityIcon from "../../assets/images/Priority.png";

function CardForm({ show, close, card }) {
  if (!show) return null;

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

  const handleChange = (field) => (e) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleUpdate = () => {
    close();
  };

  const ownerInitial = formValues.owner?.[0]?.toUpperCase() || "N";
  const accentColor = card?.color || "#2A00FF";

  return (
    <div className="cardform-overlay" onClick={close}>
      <div className="cardform-panel" onClick={(e) => e.stopPropagation()}>

        {/* Top bar */}
        <div className="cardform-topbar" style={{ backgroundColor: accentColor }}>
          <div className="cardform-topbar-left">
            <div className="cardform-topbar-text">
              <span className="cardform-id">ID : {card?.code || card?.id}</span>
              <span className="cardform-title">{card?.title}</span>
            </div>
          </div>

          <div className="cardform-topbar-right">
            <button className="topbar-icon-btn" type="button">
              <img src={ColorPickerIcon} alt="color" />
            </button>
            <button className="topbar-icon-btn" type="button">
              <img src={PriorityIcon} alt="priority" />
            </button>
            <button className="cardform-close-btn" onClick={close} type="button">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="cardform-tabs">
          <button className="tab" type="button">General</button>
          <button className="tab active" type="button">Pre Arrival</button>
          <button className="tab" type="button">Checklist</button>
          <button className="tab" type="button">Arrival</button>
          <button className="tab" type="button">Crew</button>
          <button className="tab" type="button">Husbandry</button>
          <button className="tab" type="button">Subtasks</button>
          <button className="tab" type="button">Attachments</button>
          <button className="tab" type="button">Comments</button>
          <button className="tab" type="button">Departure</button>
          <button className="tab" type="button">Sales Order</button>
        </div>

        {/* Body – Now only LEFT SIDE (full width) */}
        <div className="cardform-body cardform-body-full">

          <div className="cardform-left cardform-left-full">

            {/* Card Fields */}
            <div className="cf-section">
              <div className="cf-section-header">
                <span className="cf-section-icon"><img src={GroupSettingsIcon} alt="" /></span>
                <span className="cf-section-title">Card fields</span>
              </div>

              <div className="cf-section-body">

                {/* Owner */}
                <div className="cf-field">
                  <label>Owner</label>
                  <div className="cf-owner-row">
                    <div className="cf-owner-avatar">{ownerInitial}</div>
                    <select value={formValues.owner} onChange={handleChange("owner")} className="cf-owner-select">
                      <option value="None">None</option>
                      <option value={card?.user}>{card?.user}</option>
                    </select>
                  </div>
                </div>

                {/* Appointment Dates */}
                <div className="cf-grid two">
                  <div className="cf-field">
                    <label>Appointment Received Date</label>
                    <div className="cf-input with-icon">
                      <input type="date" value={formValues.appointmentReceivedDate} onChange={handleChange("appointmentReceivedDate")} />
                    </div>
                  </div>

                  <div className="cf-field">
                    <label>Appointment Acceptance Date</label>
                    <div className="cf-input with-icon">
                      <input type="date" value={formValues.appointmentAcceptanceDate} onChange={handleChange("appointmentAcceptanceDate")} />
                    </div>
                  </div>
                </div>

                {/* Last Port + ETA */}
                <div className="cf-grid two">
                  <div className="cf-field">
                    <label>Last Port</label>
                    <div className="cf-input">
                      <input type="text" value={formValues.lastPort} onChange={handleChange("lastPort")} placeholder="Bahrain" />
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
                    <input type="text" value={formValues.customsStart} onChange={handleChange("customsStart")} placeholder="Enter..." />
                  </div>
                </div>

                <div className="cf-field">
                  <label>Expected completion of inward clearance</label>
                  <div className="cf-input">
                    <input type="text" value={formValues.clearanceCompletion} onChange={handleChange("clearanceCompletion")} placeholder="Enter..." />
                  </div>
                </div>

                {/* Last Moved */}
                <div className="cf-grid two">
                  <div className="cf-field">
                    <label>Last Moved</label>
                    <div className="cf-input lastmoved-row">
                      <input type="date" value={formValues.lastMovedDate} onChange={handleChange("lastMovedDate")} />
                      <input type="time" value={formValues.lastMovedTime} onChange={handleChange("lastMovedTime")} />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Attachments */}
            <div className="cf-section">
              <div className="cf-section-header">
                <span className="cf-section-icon"><img src={CircleTickIcon} alt="" /></span>
                <span className="cf-section-title">Attachments</span>
              </div>
              <div className="cf-section-body">
                <div className="cf-empty-row">
                  <p>No attachments added.</p>
                  <button className="cf-link-btn" type="button">+ Add attachment</button>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="cf-section">
              <div className="cf-section-header">
                <span className="cf-section-icon"><img src={CircleTickIcon} alt="" /></span>
                <span className="cf-section-title">Links Overview</span>
              </div>
              <div className="cf-section-body">
                <div className="cf-empty-row">
                  <p>No links added.</p>
                  <button className="cf-link-btn" type="button">+ Add link</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="cardform-footer">
          <div className="cardform-steps-wrapper">
            <div className="step-item completed"><div className="step-circle">1</div><span className="step-line"></span></div>
            <div className="step-item active"><div className="step-circle">2</div><span className="step-line"></span></div>
            <div className="step-item"><div className="step-circle">3</div><span className="step-line"></span></div>
            <div className="step-item"><div className="step-circle">4</div><span className="step-line"></span></div>
            <div className="step-item"><div className="step-circle">5</div></div>
          </div>

          <button
            className="cardform-update-btn"
            style={{ backgroundColor: accentColor }}
            onClick={handleUpdate}
            type="button"
          >
            Update Card
          </button>
        </div>

      </div>
    </div>
  );
}

CardForm.propTypes = {
  show: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  card: PropTypes.object,
};

export default CardForm;
