import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";


export function BillingEntityModal({ showModal, closeModal }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: showModal?._id
      ? {
        billingEntityName: showModal?.billingEntityName,
        vatNumber: showModal?.vatNumber || "",
        email: showModal?.email,
        phone: showModal?.phone || "",
        addressLine1: showModal?.addressLine1,
      }
      : {
        phone: "",
      },
  });


  console.log("errors", errors)

  const onSubmit = (data) => {
    console.log("BILLING ENTITY FORM SUBMITTED:", data);
    closeModal();
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Billing Entity" : "Add Billing Entity"}
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="billingEntityForm" onSubmit={handleSubmit(onSubmit)}>

          {/* ROW 1 — Billing Entity Name + VAT Number */}
          <div className="permInputs row mb-lg-3">

            {/* Billing Entity Name */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.billingEntityName ? "is-invalid" : ""}`}
                  placeholder="Billing Entity Name"
                  {...register("billingEntityName", { required: "Billing Entity Name is required" })}
                />
                <label>Billing Entity Name <span className="text-danger">*</span></label>
                {errors.billingEntityName && (
                  <span className="error text-danger">{errors.billingEntityName.message}</span>
                )}
              </div>
            </div>

            {/* VAT Number */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.vatNumber ? "is-invalid" : ""}`}
                  placeholder="VAT Number"
                  {...register("vatNumber")}
                />
                <label>VAT Number</label>
                {errors.vatNumber && (
                  <span className="error text-danger">{errors.vatNumber.message}</span>
                )}
              </div>
            </div>

          </div>

          {/* ROW 2 — Email + Phone */}
          <div className="permInputs row mb-lg-3">

            {/* Email */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email format",
                    },
                  })}
                />
                <label>Email <span className="text-danger">*</span></label>
                {errors.email && (
                  <span className="error text-danger">{errors.email.message}</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="phone-wrapper">
                <label className="phone-label">
                  Phone Number <span className="text-danger">*</span>
                </label>

                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: "Phone Number is required",
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

          {/* ROW 3 — Address Line 1 FULL WIDTH */}
          <div className="permInputs row mb-lg-3">
            <div className="col-12">
              <div className="form-floating desig-inp">
                <textarea
                  className={`form-control ${errors.addressLine1 ? "is-invalid" : ""}`}
                  placeholder="Address Line 1"
                  style={{ height: "100px" }}
                  {...register("addressLine1", { required: "Address Line 1 is required" })}
                ></textarea>
                <label>Address Line 1 <span className="text-danger">*</span></label>
                {errors.addressLine1 && (
                  <span className="error text-danger">{errors.addressLine1.message}</span>
                )}
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
      <button type="submit" form="billingEntityForm" className="btn btn-primary">
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
