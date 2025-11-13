/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import "../assets/styles/CardForm.css";

import GroupSettingsIcon from "../assets/images/GroupSettings.svg";
import ArrowIcon from "../assets/images/Arrow.svg";
import CalendarIcon from "../assets/images/Calender.svg";
import CircleTickIcon from "../assets/images/CircleTick.svg";

export default function CardForm({ show, close, card }) {
  if (!show) return null;

  console.log("show",show)

  const [openSection, setOpenSection] = useState("cardFields");

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
    // later you can lift this to KanbanBoard state
    close();
  };

  const ownerInitial = formValues.owner?.[0]?.toUpperCase() || "N";

  const AccentColor = card?.color || "#2A00FF";

  return (
    <div className="cardform-overlay">
      <div className="cardform-panel" onClick={(e) => e.stopPropagation()}>
        {/* Top blue bar */}
        <div
          className="cardform-topbar"
          style={{ backgroundColor: AccentColor }}
        >
          <div className="cardform-topbar-left">
            <div className="cardform-topbar-icon" />
            <div className="cardform-topbar-text">
              <span className="cardform-id">
                ID : {card?.code || card?.id || "123456"}
              </span>
              <span className="cardform-title">
                {card?.vessel || card?.title || "SUBSEA SEVEN – Import Call"}
              </span>
            </div>
          </div>
          <button className="cardform-close-btn" onClick={close}>
            ✕
          </button>
        </div>

        {/* Tabs row (static) */}
        <div className="cardform-tabs">
          <button className="tab active">General</button>
          <button className="tab">Pre Arrival</button>
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
          {/* LEFT – form sections */}
          <div className="cardform-left">
            {/* CARD FIELDS */}
            <AccordionSection
              id="cardFields"
              icon={GroupSettingsIcon}
              title="Card fields"
              openSection={openSection}
              setOpenSection={setOpenSection}
            >
              {/* Owner row */}
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
                    <option value={card?.user || "User"}>
                      {card?.user || "User"}
                    </option>
                  </select>
                </div>
              </div>

              {/* Dates row 1: Appointment Received & Acceptance */}
              <div className="cf-grid two">
                <div className="cf-field">
                  <label>Appointment Received Date</label>
                  <div className="cf-input with-icon">
                    <input
                      type="date"
                      value={formValues.appointmentReceivedDate}
                      onChange={handleChange("appointmentReceivedDate")}
                    />
                    <img src={CalendarIcon} alt="" />
                  </div>
                </div>

                <div className="cf-field">
                  <label>Appointment Acceptance Date</label>
                  <div className="cf-input with-icon">
                    <input
                      type="date"
                      value={formValues.appointmentAcceptanceDate}
                      onChange={handleChange("appointmentAcceptanceDate")}
                    />
                    <img src={CalendarIcon} alt="" />
                  </div>
                </div>
              </div>

              {/* Last port + ETA */}
              <div className="cf-grid two">
                <div className="cf-field">
                  <label>Last Port</label>
                  <div className="cf-input">
                    <input
                      type="text"
                      placeholder="Bahrain"
                      value={formValues.lastPort}
                      onChange={handleChange("lastPort")}
                    />
                  </div>
                </div>

                <div className="cf-field">
                  <label>ETA</label>
                  <div className="cf-input eta-row">
                    <input
                      type="date"
                      value={formValues.etaDate}
                      onChange={handleChange("etaDate")}
                    />
                    <input
                      type="time"
                      value={formValues.etaTime}
                      onChange={handleChange("etaTime")}
                    />
                    <img src={CalendarIcon} alt="" className="eta-icon" />
                  </div>
                </div>
              </div>

              {/* Customs / Completion */}
              <div className="cf-field">
                <label>Expected commencement of customs inspection</label>
                <div className="cf-input">
                  <input
                    type="text"
                    value={formValues.customsStart}
                    onChange={handleChange("customsStart")}
                    placeholder="Type or select date/time"
                  />
                </div>
              </div>

              <div className="cf-field">
                <label>Expected completion of inward clearance</label>
                <div className="cf-input">
                  <input
                    type="text"
                    value={formValues.clearanceCompletion}
                    onChange={handleChange("clearanceCompletion")}
                    placeholder="Type or select date/time"
                  />
                </div>
              </div>

              {/* Last moved */}
              <div className="cf-grid two">
                <div className="cf-field">
                  <label>Last Moved</label>
                  <div className="cf-input lastmoved-row">
                    <input
                      type="date"
                      value={formValues.lastMovedDate}
                      onChange={handleChange("lastMovedDate")}
                    />
                    <input
                      type="time"
                      value={formValues.lastMovedTime}
                      onChange={handleChange("lastMovedTime")}
                    />
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* ATTACHMENTS */}
            <AccordionSection
              id="attachments"
              icon={CircleTickIcon}
              title="Attachments"
              openSection={openSection}
              setOpenSection={setOpenSection}
            >
              <div className="cf-empty-row">
                <p>No attachments added.</p>
                <button className="cf-link-btn">+ Add attachment</button>
              </div>
            </AccordionSection>

            {/* LINKS OVERVIEW */}
            <AccordionSection
              id="links"
              icon={CircleTickIcon}
              title="Links Overview"
              openSection={openSection}
              setOpenSection={setOpenSection}
            >
              <div className="cf-empty-row">
                <p>No links added.</p>
                <button className="cf-link-btn">+ Add link</button>
              </div>
            </AccordionSection>
          </div>

          {/* RIGHT – grey content area */}
          <div className="cardform-right">
            {/* Placeholder – you can put details / subtasks here later */}
          </div>
        </div>

        {/* Footer / Progress */}
        <div className="cardform-footer">
          <div className="cardform-footer-steps">
            <div className="step-dot">
              <img src={CircleTickIcon} alt="" />
            </div>
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

/* Simple Accordion component */
function AccordionSection({
  id,
  icon,
  title,
  children,
  openSection,
  setOpenSection,
}) {
  const isOpen = openSection === id;

  console.log("openSection",openSection)

  return (
    <div className="cf-accordion">
      <button
        className="cf-accordion-header"
        onClick={() => setOpenSection(isOpen ? "" : id)}
      >
        <div className="cf-accordion-left">
          <span className="cf-accordion-icon">
            <img src={icon} alt="" />
          </span>
          <span className="cf-accordion-title">{title}</span>
        </div>
        <span className={`cf-accordion-arrow ${isOpen ? "open" : ""}`}>
          <img src={ArrowIcon} alt="" />
        </span>
      </button>

      {isOpen && <div className="cf-accordion-body">{children}</div>}
    </div>
  );
}
