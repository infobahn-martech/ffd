import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import DefaultMenu from './components/DefaultMenu';
import BoardFilterPanel from './components/BoardFilterPanel';
import ManagersModal from './components/ManagersModal';
import DashboardsModal from './components/DashboardsModal';
import BusinessRulesModal from './components/BusinessRulesModal';
import BlockersModal from './components/BlockersModal';
import StickersModal from './components/StickersModal';
import TagsModal from './components/TagsModal';
import TypesModal from './components/TypesModal';
import '../../design/scss/common.scss';
import '../../design/scss/sidebar.scss';

// Existing icons
import dashboardIcon from '../../assets/images/icon-dashboard.svg';
import portIcon from '../../assets/images/icon-prospect.svg';
import workerIcon from '../../assets/images/icon-workers.svg';
import settingsIcon from '../../assets/images/icon-settings.svg';

import useWindowSize from '../../hooks/useWindowSize';

// 🆕 Kanban sidebar icons + tooltip
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import {
  FiPlus,
  FiInbox,
  FiCalendar,
  FiBarChart2,
  FiFileText,
  FiSettings,
  FiFilter,
  FiLayers,
  FiImage,
  FiUsers,
  FiShield,
  FiGrid
} from 'react-icons/fi';

function SideNav({ isMobileMenuOpen, onCloseMobileMenu }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { width } = useWindowSize();

  const isKanbanBoard = pathname === '/kanban-board' || pathname === '/workspaces';
  const isMobile = width <= 991;

  // 🆕 Kanban icon config - different icons for /kanban-board vs /workspaces
  const kanbanBoardIcons = [
    { id: 1, icon: FiPlus, label: 'Add' },
    { id: 2, icon: FiFilter, label: 'Filter' },
    { id: 3, icon: FiLayers, label: 'Card tokens' },
    { id: 4, icon: FiImage, label: 'Board background' },
  ];

  const workspacesIcons = [
    { id: 3, icon: FiInbox, label: 'Workspaces' },
    { id: 4, icon: FiUsers, label: 'Board teams' },
    { id: 8, icon: FiShield, label: 'Business rules' },
    { id: 9, icon: FiGrid, label: 'Card management' },
    { id: 5, icon: FiCalendar, label: 'Calendar' },
    { id: 6, icon: FiFileText, label: 'Reports' },
    { id: 7, icon: FiSettings, label: 'Settings' },
  ];

  // Board teams submenu items
  const boardTeamsSubmenu = [
    { label: 'Managers', modal: 'managers' },
    { label: 'Dashboards', modal: 'dashboards' },
  ];

  // Card management submenu items
  const cardManagementSubmenu = [
    { label: 'Blockers', modal: 'blockers' },
    { label: 'Stickers', modal: 'stickers' },
    { label: 'Tags', modal: 'tags' },
    { label: 'Types', modal: 'types' },
  ];

  // Select icons based on route
  const kanbanIcons = pathname === '/kanban-board' ? kanbanBoardIcons : workspacesIcons;

  // 🆕 Active state only for Kanban sidebar
  const [activeKanbanIcon, setActiveKanbanIcon] = useState(2); // default Analytics
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showBoardTeamsSubmenu, setShowBoardTeamsSubmenu] = useState(false);
  const [showCardManagementSubmenu, setShowCardManagementSubmenu] = useState(false);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [showDashboardsModal, setShowDashboardsModal] = useState(false);
  const [showBusinessRulesModal, setShowBusinessRulesModal] = useState(false);
  const [showBlockersModal, setShowBlockersModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);

  const [expand, setExpand] = useState(false);

  // Sync with Header's mobile menu state
  useEffect(() => {
    if (isMobileMenuOpen !== undefined) {
      setExpand(isMobileMenuOpen);
    }
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && expand && onCloseMobileMenu) {
      setExpand(false);
      onCloseMobileMenu();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    if (isMobile && expand && onCloseMobileMenu) {
      const handleClickOutside = (e) => {
        const sidebar = document.querySelector('.sidebar');
        const headerToggle = document.querySelector('.mobile-menu-toggle');
        if (sidebar && !sidebar.contains(e.target) && !headerToggle?.contains(e.target)) {
          setExpand(false);
          onCloseMobileMenu();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, expand, onCloseMobileMenu]);

  const menus = [
    {
      menu: 'Dashboard',
      isDefaultMenu: true,
      to: '/dashboard',
      icon: dashboardIcon,
      hasPermission: true,
    },
    {
      menu: 'User Management',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'Roles',
          to: '/roles',
          hasPermission: true,
        },
        {
          menu: 'Permissions',
          to: '/permissions',
          hasPermission: true,
        },
        {
          menu: 'Users',
          to: '/users',
          hasPermission: true,
        },
      ],
      icon: workerIcon,
    },
    {
      menu: 'Port Management',
      isDefaultMenu: true,
      to: '/port-management',
      icon: portIcon,
      hasPermission: true,
    },
    {
      menu: 'Custom Inspection',
      isDefaultMenu: true,
      to: '/custom-inspection',
      icon: portIcon,
      hasPermission: true,
    },
    {
      menu: 'Crew Management',
      isDefaultMenu: true,
      to: '/crew-management',
      icon: portIcon,
      hasPermission: true,
    },
    {
      menu: 'Report Management',
      isDefaultMenu: true,
      to: '/report-management',
      icon: portIcon,
      hasPermission: true,
    },
    {
      menu: 'Driver Management',
      isDefaultMenu: true,
      to: '/driver-management',
      icon: workerIcon,
      hasPermission: true,
    },
    {
      menu: 'Activity Log',
      isDefaultMenu: true,
      to: '/activity-log',
      icon: portIcon,
      hasPermission: true,
    },
    {
      menu: 'Notification',
      isDefaultMenu: true,
      to: '/notification',
      icon: portIcon,
      hasPermission: true,
    },
    {
      menu: 'Billing Accounts',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'Billing Entity',
          to: '/billing-entity',
          hasPermission: true,
        },
        {
          menu: 'Group Email',
          to: '/group-email',
          hasPermission: true,
        },
        {
          menu: 'Job Status',
          to: '/job-status',
          hasPermission: true,
        },
        {
          menu: 'Customer Pricing',
          to: '/customer-pricing',
          hasPermission: true,
        },
        {
          menu: 'Billing Instruction',
          to: '/billing-instruction',
          hasPermission: true,
        },
      ],
      icon: workerIcon,
    },
    {
      menu: 'Vessel Management',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'Vessel Types',
          to: '/vessel-types',
          hasPermission: true,
        },
        {
          menu: 'Barge Types',
          to: '/barge-types',
          hasPermission: true,
        },
        {
          menu: 'Vessels',
          to: '/vessel-onboarding',
          hasPermission: true,
        },
      ],
      icon: workerIcon,
    },
    {
      menu: 'Pre-Arrival',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'Documents',
          to: '/documents',
          hasPermission: true,
        },
      ],
      icon: workerIcon,
    },
    {
      menu: 'Operations Configuration',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'Appointment Acceptance',
          to: '/appointment-acceptance',
          hasPermission: true,
        },
        {
          menu: 'Pre-Arrival Information',
          to: '/pre-arrival-information',
          hasPermission: true,
        },
        {
          menu: 'Checklist',
          to: '/checklist',
          hasPermission: true,
        },
        {
          menu: 'Standard Tariff',
          to: '/standard-tariff',
          hasPermission: true,
        },
        {
          menu: 'Tariff Agreements',
          to: '/tariff-agreements',
          hasPermission: true,
        },
        {
          menu: 'Custom Fields',
          to: '/custom-fields',
          hasPermission: true,
        },
      ],
      icon: workerIcon,
    },

    {
      menu: 'Settings',
      isDefaultMenu: true,
      icon: settingsIcon,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'My Accounts',
          to: '/workers-type',
          hasPermission: true,
        },
      ],
    },
  ];

  const [menuState, setMenuState] = useState(menus);

  useEffect(() => {
    // 🔒 Don’t touch normal menu behaviour when on Kanban sidebar
    if (isKanbanBoard) return;

    if (width > 991)
      setMenuState((prev) =>
        prev.map((e) => ({
          ...e,
          isOpen:
            e?.subMenus && e.subMenus.some((eS) => eS?.to === pathname)
              ? true
              : e?.isOpen,
        }))
      );
    else {
      setMenuState((prev) => prev.map((e) => ({ ...e, isOpen: false })));
      setExpand(false);
    }
  }, [pathname, width, isKanbanBoard]);

  const toggleCollapse = (menu) => {
    setMenuState((prev) =>
      prev.map((e) => ({
        ...e,
        isOpen:
          e.menu === menu
            ? width < 991 && !expand
              ? true
              : !e.isOpen
            : e.isOpen,
      }))
    );
    if (width < 991) {
      setExpand(!expand);
      if (onCloseMobileMenu && expand) {
        onCloseMobileMenu();
      }
    }
  };

  const handleToggle = () => {
    const newExpand = !expand;
    setExpand(newExpand);
    if (onCloseMobileMenu) {
      if (newExpand) {
        // Menu is opening, Header will handle state
      } else {
        onCloseMobileMenu();
      }
    }
  };

  // Set active icon based on current route (must be outside conditional to follow Rules of Hooks)
  useEffect(() => {
    if (isKanbanBoard) {
      if (pathname === '/workspaces') {
        setActiveKanbanIcon(3); // Workspaces icon
      } else if (pathname === '/kanban-board') {
        setActiveKanbanIcon(1); // Default to Add icon (or can be set to any icon id from kanbanBoardIcons)
      }
    }
  }, [pathname, isKanbanBoard]);

  // Add/remove class to body when submenu is open to blur workspaces container
  useEffect(() => {
    if (showBoardTeamsSubmenu || showCardManagementSubmenu) {
      document.body.classList.add('board-teams-submenu-open');
    } else {
      document.body.classList.remove('board-teams-submenu-open');
    }
    return () => {
      document.body.classList.remove('board-teams-submenu-open');
    };
  }, [showBoardTeamsSubmenu, showCardManagementSubmenu]);

  // Close submenu when clicking outside
  useEffect(() => {
    if (showBoardTeamsSubmenu) {
      const handleClickOutside = (event) => {
        const sidebar = document.querySelector('.kanban-sidebar');
        const submenu = document.querySelector('.kanban-sidebar-submenu');
        if (sidebar && !sidebar.contains(event.target) && submenu && !submenu.contains(event.target)) {
          setShowBoardTeamsSubmenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBoardTeamsSubmenu]);

  // Close card management submenu when clicking outside
  useEffect(() => {
    if (showCardManagementSubmenu) {
      const handleClickOutside = (event) => {
        const sidebar = document.querySelector('.kanban-sidebar');
        const submenu = document.querySelector('.card-management-submenu');
        if (sidebar && !sidebar.contains(event.target) && submenu && !submenu.contains(event.target)) {
          setShowCardManagementSubmenu(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCardManagementSubmenu]);

  // 🆕 Special layout for /kanban-board and /workspaces
  if (isKanbanBoard) {
    const handleIconClick = (item) => {
      // If Filter icon is clicked, toggle filter panel
      if (item.label === 'Filter') {
        const newShowState = !showFilterPanel;
        setShowFilterPanel(newShowState);
        setShowBoardTeamsSubmenu(false); // Close board teams submenu
        setShowCardManagementSubmenu(false); // Close card management submenu
        if (newShowState) {
          setActiveKanbanIcon(item.id);
        }
        return;
      }

      // If Board teams icon is clicked, toggle submenu
      if (item.label === 'Board teams') {
        const newShowState = !showBoardTeamsSubmenu;
        setShowBoardTeamsSubmenu(newShowState);
        setShowFilterPanel(false); // Close filter panel
        setShowBusinessRulesModal(false); // Close business rules modal
        setShowCardManagementSubmenu(false); // Close card management submenu
        if (newShowState) {
          setActiveKanbanIcon(item.id);
        }
        return;
      }

      // If Business rules icon is clicked, open modal
      if (item.label === 'Business rules') {
        setShowBusinessRulesModal(true);
        setShowFilterPanel(false); // Close filter panel
        setShowBoardTeamsSubmenu(false); // Close board teams submenu
        setShowCardManagementSubmenu(false); // Close card management submenu
        setActiveKanbanIcon(item.id);
        return;
      }

      // If Card management icon is clicked, toggle submenu
      if (item.label === 'Card management') {
        const newShowState = !showCardManagementSubmenu;
        setShowCardManagementSubmenu(newShowState);
        setShowFilterPanel(false); // Close filter panel
        setShowBoardTeamsSubmenu(false); // Close board teams submenu
        setShowBusinessRulesModal(false); // Close business rules modal
        setShowBlockersModal(false); // Close blockers modal
        setShowStickersModal(false); // Close stickers modal
        setShowTagsModal(false); // Close tags modal
        setShowTypesModal(false); // Close types modal
        if (newShowState) {
          setActiveKanbanIcon(item.id);
        }
        return;
      }

      // Close filter panel, board teams submenu, card management submenu, and business rules modal when other icons are clicked
      if (showFilterPanel) {
        setShowFilterPanel(false);
      }
      if (showBoardTeamsSubmenu) {
        setShowBoardTeamsSubmenu(false);
      }
      if (showCardManagementSubmenu) {
        setShowCardManagementSubmenu(false);
      }
      if (showBusinessRulesModal) {
        setShowBusinessRulesModal(false);
      }
      if (showBlockersModal) {
        setShowBlockersModal(false);
      }
      if (showStickersModal) {
        setShowStickersModal(false);
      }
      if (showTagsModal) {
        setShowTagsModal(false);
      }
      if (showTypesModal) {
        setShowTypesModal(false);
      }

      setActiveKanbanIcon(item.id);
      // If Add icon is clicked, dispatch event to open CardForm in add mode
      if (item.label === 'Add') {
        window.dispatchEvent(new CustomEvent('kanban:add-card'));
      }
      // If Workspaces icon is clicked, navigate to workspaces route
      if (item.label === 'Workspaces') {
        navigate('/workspaces');
      } else if (pathname === '/workspaces' && item.label !== 'Workspaces') {
        // If on workspaces page and clicking other icons, navigate to kanban-board
        navigate('/kanban-board');
        window.dispatchEvent(new CustomEvent('kanban:hide-workspaces', { detail: { activeIcon: item.id } }));
      } else {
        // Dispatch event to hide Workspaces view for other icons
        window.dispatchEvent(new CustomEvent('kanban:hide-workspaces', { detail: { activeIcon: item.id } }));
      }
    };

    const handleSubmenuClick = (item) => {
      setShowBoardTeamsSubmenu(false);
      if (item.modal === 'managers') {
        setShowManagersModal(true);
      } else if (item.modal === 'dashboards') {
        setShowDashboardsModal(true);
      }
    };

    const handleCardManagementSubmenuClick = (item) => {
      setShowCardManagementSubmenu(false);
      if (item.modal === 'blockers') {
        setShowBlockersModal(true);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowBusinessRulesModal(false);
        setShowStickersModal(false);
        setShowTagsModal(false);
        setShowTypesModal(false);
      } else if (item.modal === 'stickers') {
        setShowStickersModal(true);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowBusinessRulesModal(false);
        setShowBlockersModal(false);
        setShowTagsModal(false);
        setShowTypesModal(false);
      } else if (item.modal === 'tags') {
        setShowTagsModal(true);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowBusinessRulesModal(false);
        setShowBlockersModal(false);
        setShowStickersModal(false);
        setShowTypesModal(false);
      } else if (item.modal === 'types') {
        setShowTypesModal(true);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowBusinessRulesModal(false);
        setShowBlockersModal(false);
        setShowStickersModal(false);
        setShowTagsModal(false);
      } else if (item.route) {
        navigate(item.route);
      }
    };

    return (
      <>
        <aside className="kanban-sidebar">
          {kanbanIcons.map((item) => {
            const Icon = item.icon;
            const isActive = activeKanbanIcon === item.id ||
              (item.label === 'Filter' && showFilterPanel) ||
              (item.label === 'Board teams' && showBoardTeamsSubmenu) ||
              (item.label === 'Business rules' && showBusinessRulesModal) ||
              (item.label === 'Card management' && showCardManagementSubmenu);
            return (
              <div key={item.id} style={{ position: 'relative' }}>
                <div
                  className={`kanban-sidebar-icon ${isActive ? 'active' : ''}`}
                  onClick={() => handleIconClick(item)}
                  data-tooltip-id="sidebar-tooltip"
                  data-tooltip-content={item.label}
                >
                  <Icon size={22} />
                </div>
                {item.label === 'Board teams' && showBoardTeamsSubmenu && (
                  <div className="kanban-sidebar-submenu">
                    {boardTeamsSubmenu.map((subItem, index) => (
                      <div
                        key={index}
                        className="kanban-sidebar-submenu-item"
                        onClick={() => handleSubmenuClick(subItem)}
                      >
                        {subItem.label}
                      </div>
                    ))}
                  </div>
                )}
                {item.label === 'Card management' && showCardManagementSubmenu && (
                  <div className="kanban-sidebar-submenu card-management-submenu">
                    {cardManagementSubmenu.map((subItem, index) => (
                      <div
                        key={index}
                        className="kanban-sidebar-submenu-item"
                        onClick={() => handleCardManagementSubmenuClick(subItem)}
                      >
                        {subItem.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Tooltip
            id="sidebar-tooltip"
            place="right"
            style={{
              backgroundColor: '#333',
              color: '#fff',
              fontSize: '0.85rem',
              borderRadius: '6px',
              padding: '6px 10px',
              fontWeight: '500',
            }}
          />
        </aside>
        <BoardFilterPanel show={showFilterPanel} onClose={() => setShowFilterPanel(false)} />
        <ManagersModal show={showManagersModal} onClose={() => setShowManagersModal(false)} />
        <DashboardsModal show={showDashboardsModal} onClose={() => setShowDashboardsModal(false)} />
        <BusinessRulesModal show={showBusinessRulesModal} onClose={() => setShowBusinessRulesModal(false)} />
        <BlockersModal show={showBlockersModal} onClose={() => setShowBlockersModal(false)} />
        <StickersModal show={showStickersModal} onClose={() => setShowStickersModal(false)} />
        <TagsModal show={showTagsModal} onClose={() => setShowTagsModal(false)} />
        <TypesModal show={showTypesModal} onClose={() => setShowTypesModal(false)} />
      </>
    );
  }

  // 🔵 Default sidebar (all other routes)
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && expand && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            setExpand(false);
            if (onCloseMobileMenu) onCloseMobileMenu();
          }}
        />
      )}

      <div className={`sidebar ${expand ? 'show' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="st-wrp">
          <button
            type="button"
            onClick={handleToggle}
            className="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <div className="menuWrp">
          <ul className="menu">
            {menuState
              .filter((e) => e.hasPermission === true)
              .map(({ menu, subMenus, to, isDefaultMenu, icon, isOpen }) => {
                if (isDefaultMenu)
                  return (
                    <DefaultMenu
                      menu={menu}
                      subMenus={subMenus}
                      to={to}
                      key={menu}
                      icon={icon}
                      isOpen={isOpen}
                      toggleCollapse={toggleCollapse}
                    />
                  );
                return null;
              })}
          </ul>
        </div>
        <div className="toggleDark" />
      </div>
    </>
  );
}

export default SideNav;

