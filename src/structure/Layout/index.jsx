import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../design/scss/dashboard.scss';
import { Outlet } from 'react-router';
import SideNav from '../SideNav/index';
import Header from '../Header';
import { LayoutViewProvider } from '../../context/LayoutViewContext';

function Layout() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hideSidebar = pathname === '/edit-workflow' || pathname === '/da-module';
  const isKanbanBoard =
    pathname === '/kanban-board' ||
    pathname.startsWith('/kanban-board/') ||
    pathname === '/compact' ||
    pathname === '/workspaces';
  const isVendorPortal = pathname.startsWith('/vendor-portal');

  const handleMenuToggle = (isOpen) => {
    setMobileMenuOpen(isOpen);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <LayoutViewProvider>
      <div className={`main-layout ${isKanbanBoard ? 'kanban-board-layout' : ''}`}>

        {/* FULL-WIDTH HEADER */}
        <Header
          onMenuToggle={handleMenuToggle}
          mobileMenuOpen={mobileMenuOpen}
          isVendorPortal={isVendorPortal}
        />

        {/* SIDEBAR + PAGE CONTENT */}
        <div className={`dashboard-wrp ${hideSidebar ? 'no-sidebar' : ''}`}>
          {!hideSidebar && (
            <SideNav
              isMobileMenuOpen={mobileMenuOpen}
              onCloseMobileMenu={handleCloseMobileMenu}
              isVendorPortal={isVendorPortal}
            />
          )}

          <div className={`page-cont-wrp ${hideSidebar ? 'full-width' : ''}`}>
            <Outlet />
          </div>
        </div>

      </div>
    </LayoutViewProvider>
  );
}

export default Layout;
