import { useState } from 'react';
import '../../design/scss/dashboard.scss';
import { Outlet } from 'react-router';
import SideNav from '../SideNav/index';
import Header from '../Header';

function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenuToggle = (isOpen) => {
    setMobileMenuOpen(isOpen);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="main-layout">
      
      {/* FULL-WIDTH HEADER */}
      <Header 
        onMenuToggle={handleMenuToggle}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* SIDEBAR + PAGE CONTENT */}
      <div className="dashboard-wrp">
        <SideNav 
          isMobileMenuOpen={mobileMenuOpen} 
          onCloseMobileMenu={handleCloseMobileMenu}
        />

        <div className="page-cont-wrp">
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default Layout;
