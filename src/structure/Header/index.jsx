import { Link, NavLink, useLocation } from "react-router-dom";
import "../../design/scss/header.scss";

import logo from '../../assets/images/SedresLogo.png';
import BackIcon from '../../assets/images/Back.png';
import SearchIcon from "../../assets/images/Search.svg";
import SettingsIcon from "../../assets/images/SettingIcon.svg";
import DocsIcon from "../../assets/images/DocumentIcon.svg";
import QuestionIcon from "../../assets/images/QuestionIcon.svg";
import NotificationIcon from "../../assets/images/Notification.svg";

function Header() {

  const { pathname } = useLocation();  // ← GET CURRENT ROUTE

  return (
    <div className="sedres-header">

      {/* LEFT — LOGO + NAV LINKS */}
      <div className="left-section">
        <img src={logo} alt="Sedres Logo" className="sedres-logo" />

        <div className="top-links">

          {/* SHOW THIS ONLY IF NOT ON KANBAN BOARD */}
          {pathname !== "/kanban-board" ? (
            <NavLink to="/kanban-board" className="top-link active back-link">
              <img src={BackIcon} alt="back" className="back-icon" />
              Back to Board
            </NavLink>
          ) : (
            <>
               <NavLink to="/user-onboarding" className="top-link active back-link">
              <img src={BackIcon} alt="back" className="back-icon" />
              Back to Users
            </NavLink>
              <NavLink to="/workflows" className="top-link">Edit Workflows</NavLink>
              <NavLink to="/analytics" className="top-link">Show Analytics</NavLink>
            </>
          )}

        </div>
      </div>

      {/* RIGHT — User + Icons */}
      <div className="right-section">
        <div className="user-circle">
          <span className="user-letter">S</span>
        </div>

        <button className="icon-btn"><img src={SettingsIcon} alt="Settings" /></button>
        <button className="icon-btn"><img src={DocsIcon} alt="Calendar" /></button>
        <button className="icon-btn"><img src={QuestionIcon} alt="Help" /></button>
        <button className="icon-btn"><img src={NotificationIcon} alt="Notifications" /></button>
      </div>

    </div>
  );
}

export default Header;
