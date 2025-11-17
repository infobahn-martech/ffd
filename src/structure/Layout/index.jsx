import '../../design/scss/dashboard.scss';
import { Outlet } from 'react-router';
import SideNav from '../SideNav/index';
import Header from '../Header';

function Layout() {
  return (
    <div className="main-layout">
      
      {/* FULL-WIDTH HEADER */}
      <Header />

      {/* SIDEBAR + PAGE CONTENT */}
      <div className="dashboard-wrp">
        <SideNav />

        <div className="page-cont-wrp">
          <Outlet />
        </div>
      </div>

    </div>
  );
}

export default Layout;
