import '../../design/scss/dashboard.scss';

import { Outlet } from 'react-router';
import SideNav from '../SideNav/index';
import Header from '../Header';

function Layout() {
  return (
    <div className="dashboard-wrp">
      <SideNav />
      <div className="page-cont-wrp">
        <div className="dashboard-header">
          <Header />
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
