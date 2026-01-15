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
import BusinessRulesModal from '../SideNav/components/BusinessRulesModal';
import ManagersModal from '../SideNav/components/ManagersModal';
import DashboardsModal from '../SideNav/components/DashboardsModal';
import BlockersModal from '../SideNav/components/BlockersModal';
import StickersModal from '../SideNav/components/StickersModal';
import TagsModal from '../SideNav/components/TagsModal';
import TypesModal from '../SideNav/components/TypesModal';

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
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showBoardTeamsSubmenu, setShowBoardTeamsSubmenu] = useState(false);
  const [showCardManagementSubmenu, setShowCardManagementSubmenu] = useState(false);
  const [showBusinessRulesModal, setShowBusinessRulesModal] = useState(false);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [showDashboardsModal, setShowDashboardsModal] = useState(false);
  const [showBlockersModal, setShowBlockersModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Default count, can be updated with real data
  const dropdownRef = useRef(null);
  const settingsDropdownRef = useRef(null);
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
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
        setShowBoardTeamsSubmenu(false);
        setShowCardManagementSubmenu(false);
      }
    };

    if (showUserDropdown || showSettingsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, showSettingsDropdown]);

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

  const handleSettingsClick = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
    setShowBoardTeamsSubmenu(false);
    setShowCardManagementSubmenu(false);
  };

  const handleBoardTeamsClick = (e) => {
    e.stopPropagation();
    const newShowState = !showBoardTeamsSubmenu;
    setShowBoardTeamsSubmenu(newShowState);
    setShowBusinessRulesModal(false);
    setShowCardManagementSubmenu(false);
  };

  const handleCardManagementClick = (e) => {
    e.stopPropagation();
    const newShowState = !showCardManagementSubmenu;
    setShowCardManagementSubmenu(newShowState);
    setShowBoardTeamsSubmenu(false);
    setShowBusinessRulesModal(false);
    // Close all card management modals when toggling submenu
    if (!newShowState) {
      setShowBlockersModal(false);
      setShowStickersModal(false);
      setShowTagsModal(false);
      setShowTypesModal(false);
    }
  };

  const handleBusinessRulesClick = () => {
    setShowSettingsDropdown(false);
    setShowBoardTeamsSubmenu(false);
    setShowCardManagementSubmenu(false);
    // Close all modals before opening business rules
    setShowManagersModal(false);
    setShowDashboardsModal(false);
    setShowBlockersModal(false);
    setShowStickersModal(false);
    setShowTagsModal(false);
    setShowTypesModal(false);
    setShowBusinessRulesModal(true);
  };

  const handleManagersClick = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    setShowBoardTeamsSubmenu(false);
    // Close all other modals
    setShowDashboardsModal(false);
    setShowBusinessRulesModal(false);
    setShowBlockersModal(false);
    setShowStickersModal(false);
    setShowTagsModal(false);
    setShowTypesModal(false);
    setShowManagersModal(true);
  };

  const handleDashboardsClick = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    setShowBoardTeamsSubmenu(false);
    // Close all other modals
    setShowManagersModal(false);
    setShowBusinessRulesModal(false);
    setShowBlockersModal(false);
    setShowStickersModal(false);
    setShowTagsModal(false);
    setShowTypesModal(false);
    setShowDashboardsModal(true);
  };

  const handleBlockersClick = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    setShowCardManagementSubmenu(false);
    // Close all other modals
    setShowBoardTeamsSubmenu(false);
    setShowManagersModal(false);
    setShowDashboardsModal(false);
    setShowBusinessRulesModal(false);
    setShowStickersModal(false);
    setShowTagsModal(false);
    setShowTypesModal(false);
    setShowBlockersModal(true);
  };

  const handleStickersClick = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    setShowCardManagementSubmenu(false);
    // Close all other modals
    setShowBoardTeamsSubmenu(false);
    setShowManagersModal(false);
    setShowDashboardsModal(false);
    setShowBusinessRulesModal(false);
    setShowBlockersModal(false);
    setShowTagsModal(false);
    setShowTypesModal(false);
    setShowStickersModal(true);
  };

  const handleTagsClick = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    setShowCardManagementSubmenu(false);
    // Close all other modals
    setShowBoardTeamsSubmenu(false);
    setShowManagersModal(false);
    setShowDashboardsModal(false);
    setShowBusinessRulesModal(false);
    setShowBlockersModal(false);
    setShowStickersModal(false);
    setShowTypesModal(false);
    setShowTagsModal(true);
  };

  const handleTypesClick = (e) => {
    e.stopPropagation();
    setShowSettingsDropdown(false);
    setShowCardManagementSubmenu(false);
    // Close all other modals
    setShowBoardTeamsSubmenu(false);
    setShowManagersModal(false);
    setShowDashboardsModal(false);
    setShowBusinessRulesModal(false);
    setShowBlockersModal(false);
    setShowStickersModal(false);
    setShowTagsModal(false);
    setShowTypesModal(true);
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

        <div className="settings-btn-wrapper" ref={settingsDropdownRef}>
          <button
            className="icon-btn icon-btn-hide-mobile"
            aria-label="Settings"
            title="Settings"
            onClick={handleSettingsClick}
          >
            <FiSettings />
          </button>
          {showSettingsDropdown && (
            <div className="settings-dropdown">
              <div 
                className={`settings-dropdown-item settings-dropdown-item-with-submenu ${showBoardTeamsSubmenu ? 'submenu-open' : ''}`}
                onClick={handleBoardTeamsClick}
              >
                Board teams
              </div>
              {showBoardTeamsSubmenu && (
                <div className="settings-submenu">
                  <div className="settings-submenu-item" onClick={handleManagersClick}>
                    Managers
                  </div>
                  <div className="settings-submenu-item" onClick={handleDashboardsClick}>
                    Dashboards
                  </div>
                </div>
              )}
              <div className="settings-dropdown-item" onClick={handleBusinessRulesClick}>
                Business rules
              </div>
              <div 
                className={`settings-dropdown-item settings-dropdown-item-with-submenu ${showCardManagementSubmenu ? 'submenu-open' : ''}`}
                onClick={handleCardManagementClick}
              >
                Card management
              </div>
              {showCardManagementSubmenu && (
                <div className="settings-submenu">
                  <div className="settings-submenu-item" onClick={handleBlockersClick}>
                    Blockers
                  </div>
                  <div className="settings-submenu-item" onClick={handleStickersClick}>
                    Stickers
                  </div>
                  <div className="settings-submenu-item" onClick={handleTagsClick}>
                    Tags
                  </div>
                  <div className="settings-submenu-item" onClick={handleTypesClick}>
                    Types
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="notification-btn-wrapper">
          <button
            className="icon-btn"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setShowNotificationsModal(true)}
          >
            <FiBell />
          </button>
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
          )}
        </div>
      </div>

      {/* My Accounts Modal */}
      {!!showMyAccountsModal && (
        <MyAccountsModal
          show={showMyAccountsModal}
          onClose={() => setShowMyAccountsModal(false)}
        />
      )}

      {/* Change Password Modal */}
      {!!showChangePasswordModal && (
        <ChangePasswordModal
          show={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      {!!showLogoutModal && (
        <LogoutConfirmationModal
          show={showLogoutModal}
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={handleLogoutConfirm}
          logoutText="Are you sure you want to logout?"
        />
      )}

      {/* Notifications Modal */}
      {!!showNotificationsModal && (
        <NotificationsModal
          show={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}

      {/* Documents Modal */}
      {!!showDocumentsModal && <DocumentsModal
        show={showDocumentsModal}
        onClose={() => setShowDocumentsModal(false)}
      />}

      {/* Settings Modals */}
      <BusinessRulesModal 
        show={showBusinessRulesModal} 
        onClose={() => setShowBusinessRulesModal(false)} 
      />
      <ManagersModal 
        show={showManagersModal} 
        onClose={() => setShowManagersModal(false)} 
      />
      <DashboardsModal 
        show={showDashboardsModal} 
        onClose={() => setShowDashboardsModal(false)} 
      />
      <BlockersModal 
        show={showBlockersModal} 
        onClose={() => setShowBlockersModal(false)} 
      />
      <StickersModal 
        show={showStickersModal} 
        onClose={() => setShowStickersModal(false)} 
      />
      <TagsModal 
        show={showTagsModal} 
        onClose={() => setShowTagsModal(false)} 
      />
      <TypesModal 
        show={showTypesModal} 
        onClose={() => setShowTypesModal(false)} 
      />

    </div>
  );
}

export default Header;
