import React from "react";
import "../assets/styles/Header.css";

import Logo from "../assets/images/Logo.png";
import SearchIcon from "../assets/images/Search.svg";
import SettingsIcon from "../assets/images/SettingIcon.svg";
import DocsIcon from "../assets/images/DocumentIcon.svg";
import QuestionIcon from "../assets/images/QuestionIcon.svg";
import NotificationIcon from "../assets/images/Notification.svg";

export default function Header() {
  return (
    <header className="header">
      {/* LEFT */}
      <div className="header-left">
        <img src={Logo} alt="Sedres Logo" className="logo" />
        <nav className="nav-links">
          <a href="#" className="active">
            Chandling Operation
          </a>
          <a href="#">Edit Workflows</a>
          <a href="#">Show Analytics</a>
        </nav>
      </div>

      {/* CENTER */}
      <div className="header-center">
        <div className="search-box">
          <input type="text" placeholder="Search" />
          <img src={SearchIcon} alt="Search" className="search-icon" />
        </div>
      </div>

      {/* RIGHT */}
      <div className="header-right">
        <div className="user-section">
          <div className="user-circle">S</div>
          <div className="icon-group">
            <img src={SettingsIcon} alt="Settings" className="header-icon" />
            <img src={DocsIcon} alt="Docs" className="header-icon" />
            <img src={QuestionIcon} alt="Help" className="header-icon" />
            <img
              src={NotificationIcon}
              alt="Notifications"
              className="header-icon"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
