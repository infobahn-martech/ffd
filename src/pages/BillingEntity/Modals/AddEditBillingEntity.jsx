import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import userIcon from "../../../assets/images/DummyProPic.avif";
import edit from "../../../assets/images/edit.svg";


export function BillingEntityModal({ showModal, closeModal, onSuccess }) {
  const [logoImage, setLogoImage] = useState(null);
  const [logoImagePreview, setLogoImagePreview] = useState(
    showModal?.logo_path || userIcon
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: showModal?._id
      ? {
        customerId: showModal?.customerId || "",
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

  useEffect(() => {
    // Update form when showModal changes
    if (showModal?._id) {
      reset({
        customerId: showModal?.customerId || "",
        billingEntityName: showModal?.billingEntityName,
        vatNumber: showModal?.vatNumber || "",
        email: showModal?.email,
        phone: showModal?.phone || "",
        addressLine1: showModal?.addressLine1,
      });
      setLogoImagePreview(showModal?.logo_path || userIcon);
      setLogoImage(null);
    } else {
      reset({
        phone: "",
        customerId: "",
        billingEntityName: "",
        vatNumber: "",
        email: "",
        addressLine1: "",
      });
      setLogoImagePreview(userIcon);
      setLogoImage(null);
    }
  }, [showModal, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  console.log("errors", errors)

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Map form data to API format
      formData.append("customerId", data.customerId || "");
      formData.append("billingEntityName", data.billingEntityName);
      formData.append("vatNumber", data.vatNumber || "");
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("addressLine1", data.addressLine1);

      // Append logo image
      if (logoImage) {
        // New image selected - append the file
        formData.append("logo", logoImage);
      } else if (showModal?._id && showModal?.logo_path) {
        // Updating billing entity without new image - send existing image path
        // This ensures the backend knows to keep the existing image
        formData.append("logo", showModal.logo_path);
      }

      console.log("BILLING ENTITY FORM SUBMITTED:", data);
      // TODO: Replace with actual API call
      // if (showModal?._id) {
      //   await updateBillingEntity({
      //     id: showModal?._id,
      //     formData,
      //     cb: () => {
      //       closeModal();
      //       onSuccess && onSuccess();
      //     },
      //   });
      // } else {
      //   await createBillingEntity({
      //     formData,
      //     cb: () => {
      //       closeModal();
      //       onSuccess && onSuccess();
      //     },
      //   });
      // }

      onSuccess?.();
      closeModal();
    } catch (error) {
      console.error("Error submitting billing entity form:", error);
    }
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
          {/* ===== Logo Upload ===== */}
          <div className="d-flex justify-content-center mb-4">
            <div className="avatar-wrapper" style={{ position: "relative" }}>
              <img
                src={logoImagePreview}
                alt="Billing Entity Logo"
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
                htmlFor="logoUpload"
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

              <input
                type="file"
                id="logoUpload"
                className="d-none"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* ROW 1 — Customer ID + Billing Entity Name */}
          <div className="permInputs row mb-lg-3">

            {/* Customer ID */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.customerId ? "is-invalid" : ""}`}
                  placeholder="Customer ID"
                  {...register("customerId")}
                />
                <label>Customer ID</label>
                {errors.customerId && (
                  <span className="error text-danger">{errors.customerId.message}</span>
                )}
              </div>
            </div>

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

          </div>

          {/* ROW 2 — VAT Number + Email */}
          <div className="permInputs row mb-lg-3">

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

          </div>

          {/* ROW 3 — Phone + Address Line 1 */}
          <div className="permInputs row mb-lg-3">

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

            {/* Address Line 1 */}
            <div className="col-lg-6 col-sm-12 mb-3">
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
