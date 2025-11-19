import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import DefaultMenu from './components/DefaultMenu';
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
import InboxIcon from '../../assets/images/Inbox.svg';
import GroupIcon from '../../assets/images/Group.svg';
import CalendarIcon from '../../assets/images/Calendar.svg';
import AnalyticsIcon from '../../assets/images/analytics 1.svg';
import ReportsIcon from '../../assets/images/Reports.svg';
import SettingsIcon from '../../assets/images/Settings.svg';

function SideNav() {
  const { pathname } = useLocation();
  const { width } = useWindowSize();

  const isKanbanBoard = pathname === '/kanban-board';

  // 🆕 Kanban icon config
  const kanbanIcons = [
    { id: 1, icon: GroupIcon, label: 'Add' },
    { id: 2, icon: AnalyticsIcon, label: 'Analytics' },
    { id: 3, icon: InboxIcon, label: 'Inbox' },
    { id: 4, icon: CalendarIcon, label: 'Calendar' },
    { id: 5, icon: ReportsIcon, label: 'Reports' },
    { id: 6, icon: SettingsIcon, label: 'Settings' },
  ];

  // 🆕 Active state only for Kanban sidebar
  const [activeKanbanIcon, setActiveKanbanIcon] = useState(2); // default Analytics

  const [expand, setExpand] = useState(false);

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
          menu: 'Role',
          to: '/role-management',
          hasPermission: true,
        },
        {
          menu: 'Permission ',
          to: '/permission-management',
          hasPermission: true,
        },
        {
          menu: 'User Onboarding',
          to: '/user-onboarding',
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
      menu: 'Vessel Management',
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
          menu: 'Registration',
          to: '/registration',
          hasPermission: true,
        },
      ],
      icon: workerIcon,
    },
    {
      menu: 'Pre-arrival mangament',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'Document',
          to: '/document',
          hasPermission: true,
        },
        {
          menu: 'CheckList',
          to: '/checkList',
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
    setExpand(!expand);
  };

  // 🆕 Special layout for /kanban-board
  if (isKanbanBoard) {
    return (
      <aside className="kanban-sidebar">
        {kanbanIcons.map((item) => (
          <div
            key={item.id}
            className={`kanban-sidebar-icon ${
              activeKanbanIcon === item.id ? 'active' : ''
            }`}
            onClick={() => setActiveKanbanIcon(item.id)}
            data-tooltip-id="sidebar-tooltip"
            data-tooltip-content={item.label}
          >
            <img src={item.icon} alt={item.label} />
          </div>
        ))}
        <Tooltip
          id="sidebar-tooltip"
          place="right"
          style={{
            backgroundColor: '#333',
            color: '#fff',
            fontSize: '0.85rem',
            borderRadius: '6px',
            padding: '6px 10px',
          }}
        />
      </aside>
    );
  }

  // 🔵 Default sidebar (all other routes)
  return (
    <div className={expand ? 'sidebar show' : 'sidebar'}>
      <div className="st-wrp">
        <button
          type="button"
          onClick={() => setExpand(!expand)}
          className="sidebar-toggle"
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
  );
}

export default SideNav;
