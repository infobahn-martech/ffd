import CustomModal from '../../../components/CustomModal';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';


export function RoleModal({ showModal, closeModal }) {
  console.log("showModal",showModal)
  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Port" :"Add Port"}
      </h1>
    </>
  );

const renderBody = () => (
  <div className="modal-body">
    <div className="lead-form">
      <form>

        {/* Port Name */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">
            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input
                  className="form-control"
                  id="portName"
                  placeholder="Port Name"
                  type="text"
                />
                <label htmlFor="portName">
                  Port Name <span className="text-danger">*</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">
            <div className="col-lg-12 col-sm-12">
              <div className="form-floating desig-inp">
                <textarea
                  className="form-control"
                  id="address"
                  placeholder="Address"
                  style={{ height: "100px" }}
                ></textarea>
                <label htmlFor="address">
                  Address <span className="text-danger">*</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Location + Contact Person */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">

            {/* Location */}
            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input
                  className="form-control"
                  id="location"
                  placeholder="Location"
                  type="text"
                />
                <label htmlFor="location">
                  Location <span className="text-danger">*</span>
                </label>
              </div>
            </div>

            {/* Contact Person */}
            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input
                  className="form-control"
                  id="contactPerson"
                  placeholder="Contact Person"
                  type="text"
                />
                <label htmlFor="contactPerson">
                  Contact Person <span className="text-danger">*</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Phone + Primary Email */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">

            {/* Phone */}
            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input
                  className="form-control"
                  id="phone"
                  placeholder="Phone"
                  type="number"
                />
                <label htmlFor="phone">
                  Phone <span className="text-danger">*</span>
                </label>
              </div>
            </div>

            {/* Primary Email */}
            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input
                  className="form-control"
                  id="primaryEmail"
                  placeholder="Primary Email"
                  type="email"
                />
                <label htmlFor="primaryEmail">
                  Primary Email <span className="text-danger">*</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Secondary Email */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">
            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input
                  className="form-control"
                  id="secondaryEmail"
                  placeholder="Secondary Email"
                  type="email"
                />
                <label htmlFor="secondaryEmail">
                  Secondary Email
                </label>
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  </div>
);


  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" data-bs-dismiss="modal">
        Close
      </button>
      <button type="button" className="btn btn-primary">
        Save changes
      </button>
    </div>
  );
  return (
    <CustomModal
      // className="modal fade show"
      dialgName="modal-dialog modal-dialog-centered"
      // createModal
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
