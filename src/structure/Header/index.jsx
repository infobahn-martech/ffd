import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../design/scss/header.scss";
import {
  FiSettings,
  FiFolder,
  FiHelpCircle,
  FiBell
} from 'react-icons/fi';

import logo from '../../assets/images/SedresLogo.png';
import BackIcon from '../../assets/images/Back.png';
import useWindowSize from '../../hooks/useWindowSize';

function Header({ onMenuToggle, mobileMenuOpen: externalMobileMenuOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
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

        <img
          src={logo}
          alt="Sedres Logo"
          className="sedres-logo"
          onClick={() => navigate('/workspaces')}
          style={{ cursor: 'pointer' }}
        />

        <div className="top-links">

          {/* Show "Back to Users" links only when on kanban-board */}
          {pathname === "/kanban-board" ? (
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
          ) : (
            /* Show "Back to Board" for all other routes */
            <NavLink to="/kanban-board" className="top-link active back-link">
              <img src={BackIcon} alt="back" className="back-icon" />
              <span className="link-text" style={{ cursor: 'pointer' }}>Back to Board</span>
            </NavLink>
          )}

        </div>
      </div>

      {/* RIGHT — User + Icons */}
      <div className="right-section">
        <div className="user-circle">
          <span className="user-letter">S</span>
        </div>

        <button className="icon-btn" aria-label="Settings" title="Settings">
          <FiSettings />
        </button>
        <button className="icon-btn icon-btn-hide-mobile" aria-label="Documents" title="Documents">
          <FiFolder />
        </button>
        <button className="icon-btn icon-btn-hide-mobile" aria-label="Help" title="Help">
          <FiHelpCircle />
        </button>
        <button className="icon-btn" aria-label="Notifications" title="Notifications">
          <FiBell />
        </button>
      </div>

    </div>
  );
}

export default Header;
