import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../../design/scss/dashboard.scss';
import { Outlet } from 'react-router';
import SideNav from '../SideNav/index';
import Header from '../Header';
import { LayoutViewProvider } from '../../shared/context/LayoutViewContext';
import useAuthReducer from '../../store/AuthReducer';

function Layout() {
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userProfile = useAuthReducer((state) => state.userProfile);
  const userRoleId =
    userProfile?.role_id ||
    userProfile?.roleId ||
    userProfile?.role?.role_id ||
    userProfile?.user?.role_id ||
    userProfile?.data?.role_id;
  const isPortManagerRole = String(userRoleId) === '1';
  const hideSidebar = pathname === '/edit-workflow' || pathname === '/da-module';
  const isKanbanBoard =
    pathname === '/kanban-board/operator' ||
    pathname.startsWith('/kanban-board/') ||
    pathname === '/compact' ||
    pathname === '/workspaces' ||
    pathname.startsWith('/workspaces/dashboard');
  const isKanbanIconSidebarRoute =
    pathname === '/kanban-board/operator' ||
    pathname.startsWith('/kanban-board/') ||
    pathname === '/compact';
  const kanbanFullWidth = isKanbanIconSidebarRoute && !isPortManagerRole;
  const isVendorPortal = pathname.startsWith('/vendor-portal');

  const handleMenuToggle = (isOpen) => {
    setMobileMenuOpen(isOpen);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <LayoutViewProvider>
      <div
        className={`main-layout ${isKanbanBoard ? 'kanban-board-layout' : ''} ${kanbanFullWidth ? 'kanban-full-width' : ''}`}
      >
        <Header
          onMenuToggle={handleMenuToggle}
          mobileMenuOpen={mobileMenuOpen}
          isVendorPortal={isVendorPortal}
        />

        <div
          className={`dashboard-wrp ${hideSidebar ? 'no-sidebar' : ''} ${kanbanFullWidth ? 'kanban-full-width' : ''}`}
        >
          {!hideSidebar && (
            <SideNav
              isMobileMenuOpen={mobileMenuOpen}
              onCloseMobileMenu={handleCloseMobileMenu}
              isVendorPortal={isVendorPortal}
            />
          )}

          <div
            className={`page-cont-wrp ${hideSidebar ? 'full-width' : ''} ${kanbanFullWidth ? 'kanban-full-width' : ''}`}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </LayoutViewProvider>
  );
}

export default Layout;
