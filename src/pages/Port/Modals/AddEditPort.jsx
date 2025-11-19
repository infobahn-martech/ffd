import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";




export function PortModal({ showModal, closeModal }) {
  const {
    register,
    handleSubmit,
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


  console.log("errors",errors)

  const onSubmit = (data) => {
    console.log("PORT FORM SUBMITTED:", data);
    closeModal();
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Port" : "Add Port"}
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
    <form id="portForm" onSubmit={handleSubmit(onSubmit)}>

  {/* ROW 1 — Port Name + Location */}
  <div className="permInputs row mb-lg-3">

    {/* Port Name */}
    <div className="col-lg-6 col-sm-12 mb-3">
      <div className="form-floating desig-inp">
        <input
          className={`form-control ${errors.portName ? "is-invalid" : ""}`}
          placeholder="Port Name"
          {...register("portName", { required: "Port Name is required" })}
        />
        <label>Port Name <span className="text-danger">*</span></label>
        {errors.portName && (
          <span className="error text-danger">{errors.portName.message}</span>
        )}
      </div>
    </div>

    {/* Location */}
    <div className="col-lg-6 col-sm-12 mb-3">
      <div className="form-floating desig-inp">
        <input
          className={`form-control ${errors.location ? "is-invalid" : ""}`}
          placeholder="Location"
          {...register("location", { required: "Location is required" })}
        />
        <label>Location <span className="text-danger">*</span></label>
        {errors.location && (
          <span className="error text-danger">{errors.location.message}</span>
        )}
      </div>
    </div>

  </div>

  {/* ROW 2 — Contact Person + Phone */}
  <div className="permInputs row mb-lg-3">

    {/* Contact Person */}
    <div className="col-lg-6 col-sm-12 mb-3">
      <div className="form-floating desig-inp">
        <input
          className={`form-control ${errors.contactPerson ? "is-invalid" : ""}`}
          placeholder="Contact Person"
          {...register("contactPerson", { required: "Contact Person is required" })}
        />
        <label>Contact Person <span className="text-danger">*</span></label>
        {errors.contactPerson && (
          <span className="error text-danger">{errors.contactPerson.message}</span>
        )}
      </div>
    </div>

    {/* Phone */}
{/* Phone */}
<div className="col-lg-6 col-sm-12 mb-3">
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


  </div>

  {/* ROW 3 — Primary Email + Secondary Email */}
  <div className="permInputs row mb-lg-3">

    {/* Primary Email */}
    <div className="col-lg-6 col-sm-12 mb-3">
      <div className="form-floating desig-inp">
        <input
          className={`form-control ${errors.primaryEmail ? "is-invalid" : ""}`}
          placeholder="Primary Email"
          {...register("primaryEmail", {
            required: "Primary Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
        />
        <label>Primary Email <span className="text-danger">*</span></label>
        {errors.primaryEmail && (
          <span className="error text-danger">{errors.primaryEmail.message}</span>
        )}
      </div>
    </div>

    {/* Secondary Email */}
    <div className="col-lg-6 col-sm-12 mb-3">
      <div className="form-floating desig-inp">
        <input
          className="form-control"
          placeholder="Secondary Email"
          {...register("secondaryEmail", {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email format",
            },
          })}
        />
        <label>Secondary Email</label>
        {errors.secondaryEmail && (
          <span className="error text-danger">{errors.secondaryEmail.message}</span>
        )}
      </div>
    </div>

  </div>

  {/* ROW 4 — Address FULL WIDTH */}
  <div className="permInputs row mb-lg-3">
    <div className="col-12">
      <div className="form-floating desig-inp">
        <textarea
          className="form-control"
          placeholder="Address"
          style={{ height: "100px" }}
          {...register("address")}
        ></textarea>
        <label>Address</label>
      </div>
    </div>
  </div>

</form>

      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" onClick={closeModal}>
        Close
      </button>
      <button type="submit" form="portForm" className="btn btn-primary">
        Save Changes
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
