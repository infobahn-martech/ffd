import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from '../../../components/CustomModal';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';
import userIcon from "../../../assets/images/user.png";
import edit from '../../../assets/images/edit.svg';


export function UserModal({ showModal, closeModal }) {
    const {
      // register,
      // handleSubmit,
      formState: { errors },
      control,          // ⬅️ add this
    } = useForm({
      defaultValues: showModal?._id
        ? {
            portName: showModal?.portName,
            address: showModal?.address,
            location: showModal?.location,
            contactPerson: showModal?.contactPerson,
            phone: showModal?.phone || "",
            primaryEmail: showModal?.primaryEmail,
            secondaryEmail: showModal?.secondaryEmail,
          }
        : {
            phone: "",
          },
    });
  const renderHeader = () => (
    <>
     <h1 className="modal-title">
      {showModal?._id ? "Edit User" : "Add User"}
    </h1>
     <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={closeModal}
      ></button>
    </>
   
  );

 const renderBody = () => (
  <div className="modal-body">
    <div className="lead-form">
      <form>

        {/* ===== Avatar Upload (Circular with Pen Icon) ===== */}
        <div className="d-flex justify-content-center mb-4">
          <div className="avatar-wrapper" style={{ position: "relative" }}>
            <img
              src={showModal?.avatar || userIcon}
              alt="User Avatar"
              className="avatar-image"
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #e6e6e6",
              }}
            />

            <label
              htmlFor="avatarUpload"
              className="avatar-edit-icon"
              style={{
                position: "absolute",
                bottom: "0",
                right: "10px",
                background: "#e7e7e7",
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <img
                src={edit}
                alt="Edit"
                style={{ width: "14px", height: "18px", filter: "invert(1)" }}
              />
            </label>

            <input type="file" id="avatarUpload" className="d-none" />
          </div>
        </div>

            {/* ===== Row 2: Name + Email ===== */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">

            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input type="text" id="name" className="form-control" placeholder="Name" />
                <label htmlFor="name">
                  Name <span className="text-danger">*</span>
                </label>
              </div>
            </div>

            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <input type="email" id="email" className="form-control" placeholder="Email" />
                <label htmlFor="email">
                  Email <span className="text-danger">*</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* ===== Row 1: Port + User Role ===== */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">

            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <select className="form-control" id="port">
                  <option value="">Select Port</option>
                </select>
                <label htmlFor="port">
                  Port <span className="text-danger">*</span>
                </label>
              </div>
            </div>

            <div className="col-lg-6 col-sm-12">
              <div className="form-floating desig-inp">
                <select className="form-control" id="role">
                  <option value="">Select User Role</option>
                </select>
                <label htmlFor="role">
                  User Role <span className="text-danger">*</span>
                </label>
              </div>
            </div>

          </div>
        </div>


        {/* ===== Row 3: Phone + (Optional future field) ===== */}
        <div className="mb-lg-3 mb-sm-0">
          <div className="permInputs row">

            <div className="col-lg-6 col-sm-12">
               <div className="phone-wrapper">
                 <label className="phone-label">
                   Phone <span className="text-danger">*</span>
                 </label>
             
                 <Controller
                   name="phone"
                   control={control}
                   rules={{
                     required: "Phone is required",
                     validate: (value) => {
                       const digits = (value || "").replace(/\D/g, "");
                       return digits.length >= 7 || "Enter a valid phone number";
                     },
                   }}
                   render={({ field }) => (
                     <PhoneInput
                       {...field}
                       country="ae"
                       enableSearch
                       inputClass="phone-input"
                       buttonClass="phone-flag"
                       placeholder=""
                     />
                   )}
                 />
             
                 {errors.phone && (
                   <span className="error text-danger">{errors.phone.message}</span>
                 )}
               </div>
            </div>

            <div className="col-lg-6 col-sm-12">
           <div className="form-floating desig-inp">
                <textarea
                  id="address"
                  className="form-control"
                  placeholder="Address"
                  style={{ height: "100px" }}
                ></textarea>
                <label htmlFor="address">Address</label>
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
        Save
      </button>
    </div>
  );

  return (
    <CustomModal
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
