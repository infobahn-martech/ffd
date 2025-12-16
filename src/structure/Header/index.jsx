import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "../../design/scss/header.scss";

import logo from '../../assets/images/SedresLogo.png';
import BackIcon from '../../assets/images/Back.png';
import SearchIcon from "../../assets/images/Search.svg";
import SettingsIcon from "../../assets/images/SettingIcon.svg";
import DocsIcon from "../../assets/images/DocumentIcon.svg";
import QuestionIcon from "../../assets/images/QuestionIcon.svg";
import NotificationIcon from "../../assets/images/Notification.svg";
import useWindowSize from '../../hooks/useWindowSize';

function Header({ onMenuToggle, mobileMenuOpen: externalMobileMenuOpen }) {
  const { pathname } = useLocation();
  const { width } = useWindowSize();
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const isMobile = width <= 991;

  // Use external state if provided, otherwise use internal state
  const mobileMenuOpen = externalMobileMenuOpen !== undefined
    ? externalMobileMenuOpen
    : internalMobileMenuOpen;

  const handleMenuToggle = () => {
    const newState = !mobileMenuOpen;
    if (externalMobileMenuOpen === undefined) {
      setInternalMobileMenuOpen(newState);
    }
    if (onMenuToggle) {
      onMenuToggle(newState);
    }
  };

  return (
    <div className="sedres-header">

      {/* LEFT — LOGO + NAV LINKS */}
      <div className="left-section">
        {/* Mobile Menu Toggle Button */}
        {isMobile && (
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={handleMenuToggle}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}

        <img src={logo} alt="Sedres Logo" className="sedres-logo" />

        <div className="top-links">

          {/* SHOW THIS ONLY IF NOT ON KANBAN BOARD */}
          {pathname !== "/kanban-board" && pathname !== "/workflows" ? (
            <NavLink to="/kanban-board" className="top-link active back-link">
              <img src={BackIcon} alt="back" className="back-icon" />
              <span className="link-text" style={{ cursor: 'pointer' }} >Back to Board</span>
            </NavLink>
          ) : pathname === "/workflows" ? (
            <NavLink to="/kanban-board" className="top-link active back-link">
              <img src={BackIcon} alt="back" className="back-icon" />
              <span style={{ cursor: 'pointer' }} className="link-text">Back to Board</span>
            </NavLink>
          ) : (
            <>
              <NavLink to="/users" className="top-link active back-link">
                <img src={BackIcon} alt="back" className="back-icon" />
                <span style={{ cursor: 'pointer' }} className="link-text">Back to Users</span>
              </NavLink>
              <NavLink to="/workflows" className="top-link">
                <span className="link-text">Edit Workflows</span>
              </NavLink>
              <NavLink to="/analytics" className="top-link">
                <span className="link-text">Show Analytics</span>
              </NavLink>
            </>
          )}

        </div>
      </div>

      {/* RIGHT — User + Icons */}
      <div className="right-section">
        <div className="user-circle">
          <span className="user-letter">S</span>
        </div>

        <button className="icon-btn" aria-label="Settings">
          <img src={SettingsIcon} alt="Settings" />
        </button>
        <button className="icon-btn icon-btn-hide-mobile" aria-label="Documents">
          <img src={DocsIcon} alt="Calendar" />
        </button>
        <button className="icon-btn icon-btn-hide-mobile" aria-label="Help">
          <img src={QuestionIcon} alt="Help" />
        </button>
        <button className="icon-btn" aria-label="Notifications">
          <img src={NotificationIcon} alt="Notifications" />
        </button>
      </div>

    </div>
  );
}

export default Header;
