/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import "../assets/styles/CardForm.css";

import GroupSettingsIcon from "../assets/images/cv.png";
import CircleTickIcon from "../assets/images/CircleTick.svg";
import ColorPickerIcon from "../assets/images/ColorPicker.png";
import PriorityIcon from "../assets/images/Priority.png";


export default function CardForm({ show, close, card }) {
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
    console.log("Updated values:", formValues);
    close();
  };

  const ownerInitial = formValues.owner?.[0]?.toUpperCase() || "N";
  const AccentColor = card?.color || "#2A00FF";

  return (
    <div className="cardform-overlay" onClick={close}>
      <div className="cardform-panel" onClick={(e) => e.stopPropagation()}>
        
        {/* Top bar */}
        <div className="cardform-topbar" style={{ backgroundColor: AccentColor }}>
          <div className="cardform-topbar-left">
            <div className="cardform-topbar-text">
              <span className="cardform-id">ID : {card?.code || card?.id}</span>
              <span className="cardform-title">{card?.title}</span>
            </div>
          </div>
        <div className="cardform-topbar-right">

  {/* Color Picker */}
  <button className="topbar-icon-btn">
    <img src={ColorPickerIcon} alt="color" />
  </button>

  {/* Priority */}
  <button className="topbar-icon-btn">
    <img src={PriorityIcon} alt="priority" />
  </button>

  {/* Close */}
  <button className="cardform-close-btn" onClick={close}>✕</button>

</div>

        </div>

        {/* Tabs */}
        <div className="cardform-tabs">
          <button className="tab">General</button>
          <button className="tab active">Pre Arrival</button>
          <button className="tab">Checklist</button>
          <button className="tab">Arrival</button>
          <button className="tab">Crew</button>
          <button className="tab">Husbandry</button>
          <button className="tab">Subtasks</button>
          <button className="tab">Attachments</button>
          <button className="tab">Comments</button>
          <button className="tab">Departure</button>
          <button className="tab">Sales Order</button>
        </div>

        {/* Body */}
        <div className="cardform-body">

          {/* LEFT SIDE (Scroll Enabled) */}
          <div className="cardform-left">

            {/* ✔ Card Fields Section */}
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
                      {/* <img src={CalendarIcon} alt="" /> */}
                    </div>
                  </div>

                  <div className="cf-field">
                    <label>Appointment Acceptance Date</label>
                    <div className="cf-input with-icon">
                      <input type="date" value={formValues.appointmentAcceptanceDate} onChange={handleChange("appointmentAcceptanceDate")} />
                      {/* <img src={CalendarIcon} alt="" /> */}
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
                      {/* <img src={CalendarIcon} alt="" className="eta-icon" /> */}
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

            {/* ✔ Attachments */}
            <div className="cf-section">
              <div className="cf-section-header">
                <span className="cf-section-icon"><img src={CircleTickIcon} alt="" /></span>
                <span className="cf-section-title">Attachments</span>
              </div>

              <div className="cf-section-body">
                <div className="cf-empty-row">
                  <p>No attachments added.</p>
                  <button className="cf-link-btn">+ Add attachment</button>
                </div>
              </div>
            </div>

            {/* ✔ Links Overview */}
            <div className="cf-section">
              <div className="cf-section-header">
                <span className="cf-section-icon"><img src={CircleTickIcon} alt="" /></span>
                <span className="cf-section-title">Links Overview</span>
              </div>

              <div className="cf-section-body">
                <div className="cf-empty-row">
                  <p>No links added.</p>
                  <button className="cf-link-btn">+ Add link</button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="cardform-right"></div>

        </div>

        {/* Footer */}
        <div className="cardform-footer">
          <div className="cardform-footer-steps">
            <div className="step-dot"><img src={CircleTickIcon} alt="" /></div>
            <div className="step-dot active" />
            <div className="step-dot" />
            <div className="step-dot" />
          </div>

          <button
            className="cardform-update-btn"
            style={{ backgroundColor: AccentColor }}
            onClick={handleUpdate}
          >
            Update Card
          </button>
        </div>

      </div>
    </div>
  );
}
