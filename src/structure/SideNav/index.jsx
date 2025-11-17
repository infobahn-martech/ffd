import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import DefaultMenu from './components/DefaultMenu';
import '../../design/scss/common.scss';
import '../../design/scss/sidebar.scss';

import dashboardIcon from '../../assets/images/icon-dashboard.svg';
import portIcon from '../../assets/images/icon-prospect.svg';
import workerIcon from '../../assets/images/icon-workers.svg';
import settingsIcon from '../../assets/images/icon-settings.svg';
import useWindowSize from '../../hooks/useWindowSize';

function SideNav() {
  const { pathname } = useLocation();
  const [expand, setExpand] = useState(false);
  const { width } = useWindowSize();

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
          to: '/role',
          hasPermission: true,
        },
        {
          menu: 'Permission ',
          to: '/permission',
          hasPermission: true,
        },
          {
          menu: 'Registration ',
          to: '/registration',
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
          menu: 'Worker Type',
          to: '/workers-type',
          hasPermission: true,
        },
      ],
    },
  ];

  const [menuState, setMenuState] = useState(menus);

  useEffect(() => {
    if (width > 991)
      setMenuState(
        menuState.map((e) => ({
          ...e,
          isOpen:
            e?.subMenus && e.subMenus.some((eS) => eS?.to === pathname)
              ? true
              : e?.isOpen,
        }))
      );
    else {
      setMenuState(menuState.map((e) => ({ ...e, isOpen: false })));
      setExpand(false);
    }
  }, [pathname, width]);

  const toggleCollapse = (menu) => {
    setMenuState(
      menuState.map((e) => ({
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
