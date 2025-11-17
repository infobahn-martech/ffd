import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import DefaultMenu from './components/DefaultMenu';
import '../../design/scss/common.scss';
import '../../design/scss/sidebar.scss';
import logo from '../../assets/images/CreatedLogo.svg';
import mobIcon from '../../assets/images/logo-icon.svg';
import darkModeIcon from '../../assets/images/icon-darktoggle.svg';
import dashboardIcon from '../../assets/images/icon-dashboard.svg';
import prospectIcon from '../../assets/images/icon-prospect.svg';
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
      menu: 'Prospect',
      isDefaultMenu: true,
      to: '/prospect',
      icon: prospectIcon,
      hasPermission: true,
    },
    {
      menu: 'Workers',
      isDefaultMenu: true,
      to: '/workers',
      icon: workerIcon,
      hasPermission: true,
    },
    {
      menu: 'User Management',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        {
          menu: 'Employees',
          to: '/employee',
          hasPermission: true,
        },
        {
          menu: 'Designation',
          to: '/permission',
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
      <div className="logoWrp">
        {/* <div>
          Sedres <br /> Logo
        </div> */}
        <a href="# " className="logo">
          <img src={logo} alt="dashboard" className="dt-logo" />

          <img src={mobIcon} alt="dashboard" className="mb-logo" />
        </a>
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

          <li className="menu-link">
            <a href="# " className="link darkmode-toggle">
              <span className="ico">
                <img src={darkModeIcon} alt="darkmode" />
              </span>
              <span className="txt">Dark Mode</span>
              <span className="toggleSwitch">
                <span className="togglerCheckbox">
                  <input type="checkbox" name="toggleD" id="toggleD" />
                  <label htmlFor="toggleD" className="checkLabel" />
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>
      <div className="toggleDark" />
    </div>
  );
}

export default SideNav;
