import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../../design/scss/header.scss';
import message from '../../assets/images/message.svg';
import noti from '../../assets/images/notification.svg';
import dummyImg from '../../assets/images/user.png';
import profile from '../../assets/images/Profile_view.svg';
import backIcon from '../../assets/images/BackIcon.png';
import changePass from '../../assets/images/change-password.svg';
import signOut from '../../assets/images/Sign_out.svg';
import modalsignout from '../../assets/images/signout.svg';
import useAuthReducer from '../../store/AuthReducer';
import CommonSkeleton from '../../components/CommonSkeleton';

function Header() {
  const doLogout = useAuthReducer((state) => state.doLogout);
  const profileData = useAuthReducer((state) => state.profileData);

  const { firstName = '', lastName = '' } = profileData ?? {};

  // State to track image loading
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  const handleImageLoad = () => {
    setIsLoadingImage(false);
  };

  return (
    <div className="container-fluid">
      <div className="row align-items-center">
      <div className="col-md-2 back-kanban">
  <img src={backIcon} alt="Back" className="back-icon" />
  <span className="back-text">Back to Kanban</span>
    </div>
        <div className="col-md-10 actn-col">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link user-drop" href="# " role="button">
                <img src={noti} alt="notification" />
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link user-drop" href="# " role="button">
                <img src={message} alt="msg" />
              </a>
            </li>
            <li className="nav-item dropdown user-drop-dwn">
              <div className="usr-img">
                {isLoadingImage && <CommonSkeleton borderRadius={100} />}

                <img
                  src={profileData?.image || dummyImg}
                  alt="user"
                  onLoad={handleImageLoad} // Handle image load event
                  style={{ display: isLoadingImage ? 'none' : 'block' }}
                />
              </div>
              <a
                className="nav-link dropdown-toggle"
                href="# "
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="user-detai">
                  <span className="user-name">
                    {firstName} {lastName}
                  </span>
                  <span className="user-position">Oceanwoods</span>
                </div>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <NavLink
                    to="/userprofile"
                    style={{ all: 'unset', cursor: 'pointer' }}
                  >
                    <a className="dropdown-item" href="# ">
                      <span className="img">
                        <img src={profile} alt="profile" />
                      </span>
                      <span className="name">My Profile</span>
                    </a>
                  </NavLink>
                </li>
                <li className="mob-only-items">
                  <hr className="dropdown-divider" />
                </li>
                <li className="mob-only-items">
                  <Link to="/change-password" className="dropdown-item">
                    <span className="ico">
                      <img src={changePass} alt="Channels" />
                    </span>
                    <span className="txt">Change Password</span>
                  </Link>
                </li>
                <li className="mob-only-items">
                  <hr className="dropdown-divider" />
                </li>
                <li className="mob-only-items">
                  <a
                    className="dropdown-toggle1 dropdown-item"
                    href="# "
                    id="logoutDropdown"
                    role="button"
                    data-bs-toggle="modal"
                    data-bs-target="#logoutModal"
                    aria-expanded="false"
                  >
                    <span className="ico">
                      <img src={signOut} alt="Privacy" />
                    </span>
                    <span className="txt">Logout</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <div
          className="modal change-pass fade employee-modal logout-modal1"
          id="logoutModal"
          tabIndex="-1"
          aria-labelledby="logoutModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <div className="profile-img">
                  <img src={modalsignout} alt="sign" />
                </div>
                <div className="popup-title">
                  Are you sure you want to logout?
                </div>
                <div className="two-btn logout-btn">
                  <button
                    type="submit"
                    className="btn-common close"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save btn-common green-btn"
                    data-bs-dismiss="modal"
                    onClick={() => doLogout()}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
