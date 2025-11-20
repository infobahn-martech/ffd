import closeIcon from '../assets/images/icon-close.svg';

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
                <option value="dubai">Dubai Port</option>
                <option value="sharjah">Sharjah Port</option>
                <option value="ajman">Ajman Port</option>
                <option value="fujairah">Fujairah Port</option>
              </select>
              <label htmlFor="floatingPort">Port</label>
            </div>
          </div>

          {/* Role */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <select className="form-select" id="floatingRole">
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                <option value="operator">Operator</option>
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
