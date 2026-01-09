import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "../../design/scss/header.scss";
import {
  FiSettings,
  FiFolder,
  FiHelpCircle,
  FiBell,
  FiLayout,
  FiGrid,
  FiBarChart2
} from 'react-icons/fi';

import logo from '../../assets/images/SedresLogo.png';
import useWindowSize from '../../hooks/useWindowSize';
import useAuthReducer from '../../store/AuthReducer';
import MyAccountsModal from './MyAccountsModal';
import ChangePasswordModal from './ChangePasswordModal';
import LogoutConfirmationModal from '../../components/LogoutConfirmationModal';
import NotificationsModal from './NotificationsModal';
import DocumentsModal from './DocumentsModal';

function Header({ onMenuToggle, mobileMenuOpen: externalMobileMenuOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { width } = useWindowSize();
  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMyAccountsModal, setShowMyAccountsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);
  const isMobile = width <= 991;
  const doLogout = useAuthReducer((state) => state.doLogout);
  const profileData = useAuthReducer((state) => state.profileData);
  const authData = useAuthReducer((state) => state.authData);

  // Dummy data for demonstration
  const DUMMY_USER = {
    name: 'John Smith',
    avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=00368c&color=fff&size=128',
  };

  // Get user initial from profile or auth data, fallback to dummy
  const getUserInitial = () => {
    const name = profileData?.name || profileData?.firstName ||
      authData?.name || authData?.firstName ||
      DUMMY_USER.name;
    return name.charAt(0).toUpperCase();
  };

  // Get user avatar, fallback to dummy
  const getUserAvatar = () => {
    return profileData?.avatar || authData?.avatar || DUMMY_USER.avatar;
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleUserCircleClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleMyAccountsClick = () => {
    setShowUserDropdown(false);
    setShowMyAccountsModal(true);
  };

  const handleChangePasswordClick = () => {
    setShowUserDropdown(false);
    setShowChangePasswordModal(true);
  };

  const handleLogoutClick = () => {
    setShowUserDropdown(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    doLogout();
    navigate('/');
  };

  const handleHelpClick = () => {
    window.open("https://sedres.com/contact-us", "_blank", "noopener,noreferrer");
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
          {/* Navigation links can be added here if needed */}
        </div>
      </div>

      {/* RIGHT — User + Icons */}
      <div className="right-section">
        <div className="user-circle-wrapper" ref={dropdownRef}>
          <div
            className="user-circle"
            onClick={handleUserCircleClick}
          >
            {!imageError ? (
              <img
                src={getUserAvatar()}
                alt="User"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="user-letter">{getUserInitial()}</span>
            )}
          </div>

          {showUserDropdown && (
            <div className="user-dropdown">
              <button
                className="dropdown-item"
                onClick={handleMyAccountsClick}
              >
                My Accounts
              </button>
              <button
                className="dropdown-item"
                onClick={handleChangePasswordClick}
              >
                Change Password
              </button>
              <button
                className="dropdown-item"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            </div>
          )}
        </div>
        <button
          className="icon-btn icon-btn-hide-mobile"
          aria-label="Master Module"
          title="Master Module"
          onClick={() => navigate('/dashboard')}
        >
          <FiLayout />
        </button>
        <button
          className="icon-btn icon-btn-hide-mobile"
          aria-label="Board"
          title="Board"
          onClick={() => navigate('/kanban-board')}
        >
          <FiGrid />
        </button>
        <button
          className="icon-btn icon-btn-hide-mobile"
          aria-label="KPI Dashboard"
          title="KPI Dashboard"
          onClick={() => navigate('/kpi-dashboard')}
        >
          <FiBarChart2 />
        </button>
        <button
          className="icon-btn icon-btn-hide-mobile"
          aria-label="Documents"
          title="Documents"
          onClick={() => setShowDocumentsModal(true)}
        >
          <FiFolder />
        </button>
        <button
          className="icon-btn icon-btn-hide-mobile"
          aria-label="Help"
          title="Help"
          onClick={handleHelpClick}
        >
          <FiHelpCircle />
        </button>

        <button
          className="icon-btn"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => setShowNotificationsModal(true)}
        >
          <FiBell />
        </button>
      </div>

      {/* My Accounts Modal */}
      <MyAccountsModal
        show={showMyAccountsModal}
        onClose={() => setShowMyAccountsModal(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        show={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        show={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        logoutText="Are you sure you want to logout?"
      />

      {/* Notifications Modal */}
      <NotificationsModal
        show={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />

      {/* Documents Modal */}
      <DocumentsModal
        show={showDocumentsModal}
        onClose={() => setShowDocumentsModal(false)}
      />

    </div>
  );
}

export default Header;
