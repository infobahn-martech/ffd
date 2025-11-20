import closeIcon from '../assets/images/icon-close.svg';

function CommonFilter() {
  return (
    <div className="collapse show" id="filtersInputs" style={{}}>
      <div className="filters-inputs-wrp">
        <div className="row w-100">

          {/* Name */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingName1" placeholder="Name" />
              <label htmlFor="floatingName1">Name</label>
            </div>
          </div>

          {/* Designation */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingDesignation" placeholder="Designation" />
              <label htmlFor="floatingDesignation">Designation</label>
            </div>
          </div>

          {/* Joining Date */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingJoining" placeholder="Joining" />
              <label htmlFor="floatingJoining">Joining Date</label>
            </div>
          </div>

          {/* Status */}
          <div className="col-xl col-lg-6 col-sm-12 my-1">
            <div className="form-floating">
              <input type="text" className="form-control" id="floatingStatus" placeholder="Status" />
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
