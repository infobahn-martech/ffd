import React from 'react';
import KIPSideNavBg from '../../../assets/images/KIP-SideNav-Bg.png';
import KIPLogo from '../../../assets/images/KIP_LOGO.png';
import './SideNav.scss';

const SideNav = () => {
  return (
    <div
      className="kpi-sidenav"
      style={{ backgroundImage: `url(${KIPSideNavBg})` }}
    >
      <div className="kpi-sidenav__content">
        {/* Logo Section */}
        <div className="kpi-sidenav__logo">
          <div
            className="kpi-sidenav__logo-image"
            style={{
              background: `url(${KIPLogo}) #050b27 50% / cover no-repeat`
            }}
          />
          <div className="kpi-sidenav__separator">
            <svg xmlns="http://www.w3.org/2000/svg" width="234" height="1" viewBox="0 0 234 1" fill="none">
              <path d="M0 0.5H233.25" stroke="url(#paint0_linear_1_787)" />
              <defs>
                <linearGradient id="paint0_linear_1_787" x1="0" y1="0.5" x2="231" y2="0.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E0E1E2" stopOpacity="0" />
                  <stop offset="0.5" stopColor="#E0E1E2" />
                  <stop offset="1" stopColor="#E0E1E2" stopOpacity="0.15625" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="kpi-sidenav__menu">
          {/* Menu items will be added here */}
        </nav>

        {/* Help Card */}
        <div className="kpi-sidenav__help">
          {/* Help card will be added here */}
        </div>
      </div>
    </div>
  );
};

export default SideNav;

