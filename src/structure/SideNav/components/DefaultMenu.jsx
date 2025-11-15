import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ArrowDownIcon } from '../icons';

const DefaultMenu = ({ menu, subMenus, to, icon, isOpen, toggleCollapse }) => {
  const { pathname } = useLocation();
  return !subMenus ? (
    <li className="menu-link">
      <Link to={to ?? '# '} className={`link ${pathname === to && 'active'}`}>
        <span className="ico">
          <img src={icon} alt="" />
        </span>
        <span className="txt">{menu}</span>
      </Link>
    </li>
  ) : (
    <li className="menu-link">
      <a
        onClick={() => toggleCollapse(menu)}
        className={isOpen ? 'link submenu' : 'link submenu collapsed'}
        href="# "
        role="button"
      >
        <span className="ico">
          <img src={icon} alt="usr manage" />
        </span>
        <span className="txt">{menu}</span>
        <span className="ms-auto drp-icon">
          <div className="drp-ico">
            <ArrowDownIcon />
          </div>
        </span>
      </a>

      {subMenus
        ?.filter((e) => e.hasPermission === true)
        ?.map(({ menu: subMenu, to }) => (
          <div
            className={`submenu_items ${!isOpen ? 'collapse' : 'show'}`}
            onClick={() => toggleCollapse(menu)}
          >
            <Link
              to={to}
              className={`link ${pathname === to && 'submenu_active'}`}
            >
              <ul>
                <li>{subMenu}</li>
              </ul>
            </Link>
          </div>
        ))}
    </li>
  );
};

DefaultMenu.propTypes = {
  menu: PropTypes.string,
  to: PropTypes.string,
  icon: PropTypes.func,
  subMenus: PropTypes.arrayOf(),
  isOpen: PropTypes.bool,
  toggleCollapse: PropTypes.func,
};

export default DefaultMenu;
