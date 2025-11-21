import closeIcon from '../assets/images/icon-close.svg';
import { ROLE_OPTIONS } from '../constants/roles';
import { PORT_OPTIONS } from '../constants/ports';

function CommonFilter() {
  return (
    <div className="collapse show" id="filtersInputs" style={{}}>
      <div className="filters-inputs-wrp">
        <div className="row w-100">

          {/* Port */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <select className="form-select" id="floatingPort">
                <option value="">Select Port</option>
                {PORT_OPTIONS.map((port) => (
                  <option key={port} value={port}>
                    {port}
                  </option>
                ))}
              </select>
              <label htmlFor="floatingPort">Port</label>
            </div>
          </div>

          {/* Role */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <select className="form-select" id="floatingRole">
                <option value="">Select Role</option>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <label htmlFor="floatingRole">Role</label>
            </div>
          </div>

          {/* Status */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <select className="form-select" id="floatingStatus">
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              <label htmlFor="floatingStatus">Status</label>
            </div>
          </div>

          {/* Buttons */}
          <div className="col-xl-auto col-lg-6 col-sm-12 my-1">
            <div className="inp-wrp">
              <button className="btn btn-primary">Apply Filter</button>
              <button className="btn btn-outline-danger">
                <img src={closeIcon} alt="close" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CommonFilter;
