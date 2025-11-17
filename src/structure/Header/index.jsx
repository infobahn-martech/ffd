import { Link, NavLink } from "react-router-dom";
import "../../design/scss/header.scss";

import logo from '../../assets/images/SedresLogo.png';
import BackIcon from '../../assets/images/Back.png';
import SearchIcon from "../../assets/images/Search.svg";
import SettingsIcon from "../../assets/images/SettingIcon.svg";
import DocsIcon from "../../assets/images/DocumentIcon.svg";
import QuestionIcon from "../../assets/images/QuestionIcon.svg";
import NotificationIcon from "../../assets/images/Notification.svg";

function Header() {
 

  return (
    <div className="sedres-header">
      {/* LEFT — LOGO */}
   <div className="left-section">

  {/* Logo Before Menu */}
  <img src={logo} alt="Sedres Logo" className="sedres-logo" />

  <div className="top-links">
{/* <NavLink to="/kanban-board" className="top-link active back-link"> */}
<NavLink to="/dashboard" className="top-link active back-link">
  <img src={BackIcon} alt="back" className="back-icon" />
  Back to Board
</NavLink>


    <NavLink to="/workflows" className="top-link">Edit Workflows</NavLink>
    <NavLink to="/analytics" className="top-link">Show Analytics</NavLink>
  </div>

</div>


      {/* CENTER — SEARCH */}
      <div className="center-section">
        <div className="search-box">
          <input type="text" placeholder="Search" />
          <img src={SearchIcon} className="fa fa-search search-icon"></img>
        </div>
      </div>

      {/* RIGHT — Icons + USER */}
         {/* RIGHT — User pill + icons */}
      <div className="right-section">
        {/* White user circle on the left */}
        <div className="user-circle">
          <span className="user-letter">
            {("S").charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Icons on blue bar */}
        <button className="icon-btn">
          <img src={SettingsIcon} alt="Settings" />
        </button>
        <button className="icon-btn">
          <img src={DocsIcon} alt="Calendar" />
        </button>
        <button className="icon-btn">
          <img src={QuestionIcon} alt="Help" />
        </button>
        <button className="icon-btn">
          <img src={NotificationIcon} alt="Notifications" />
        </button>
      </div>

    </div>
  );
}

export default Header;
