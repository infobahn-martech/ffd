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
import useUserReducer from "../../../store/UserReducer";
import useRoleReducer from "../../../store/RoleReducer";

export function UserModal({ showModal, closeModal, onSuccess }) {
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    showModal?.image || userIcon
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: showModal?.user_id
      ? {
        name: showModal?.name,
        email: showModal?.email,
        roleid: showModal?.role?.role_id || "",
        phone: showModal?.phone || "",
        address: showModal?.address || "",
      }
      : {
        phone: "",
      },
  });

  const { createUser, updateUser, addEditLoader } = useUserReducer((state) => state);
  const { fetchRoles, roles } = useRoleReducer((state) => state);

  useEffect(() => {
    // Fetch roles when modal opens
    fetchRoles({ params: { page: 1, limit: 100 } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Update form when showModal changes
    if (showModal?.user_id) {
      reset({
        name: showModal?.name,
        email: showModal?.email,
        roleid: showModal?.role_id || "",
        phone: showModal?.phone || "",
        address: showModal?.address || "",
      });
      setProfileImagePreview(showModal?.avatar_path || userIcon);
      setProfileImage(null);
    } else {
      reset({
        phone: "",
        name: "",
        email: "",
        roleid: "",
        address: "",
      });
      setProfileImagePreview(userIcon);
      setProfileImage(null);
    }
  }, [showModal, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Map form data to API format
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("address", data.address || "");
      formData.append("roleid", data.roleid);

      // Append profile image if selected
      if (profileImage) {
        formData.append("profileimg", profileImage);
      }

      if (showModal?.user_id) {
        // Update user
        await updateUser({
          id: showModal?.user_id,
          formData,
          cb: () => {
            closeModal();
            onSuccess && onSuccess();
          },
        });
      } else {
        // Create user
        await createUser({
          formData,
          cb: () => {
            closeModal();
            onSuccess && onSuccess();
          },
        });
      }
    } catch (error) {
      console.error("Error submitting user form:", error);
    }
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?.user_id ? "Edit User" : "Add User"}
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="userForm" onSubmit={handleSubmit(onSubmit)}>
          {/* ===== Avatar Upload ===== */}
          <div className="d-flex justify-content-center mb-4">
            <div className="avatar-wrapper" style={{ position: "relative" }}>
              <img
                src={profileImagePreview}
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

              <input
                type="file"
                id="avatarUpload"
                className="d-none"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* ===== Name + Email ===== */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              {/* NAME */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder="Name"
                    {...register("name", {
                      required: "Name is required",
                    })}
                  />
                  <label>
                    Name <span className="text-danger">*</span>
                  </label>
                  {errors.name && (
                    <span className="error text-danger">{errors.name.message}</span>
                  )}
                </div>
              </div>

              {/* EMAIL */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""
                      }`}
                    placeholder="Email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                  <label>
                    Email <span className="text-danger">*</span>
                  </label>
                  {errors.email && (
                    <span className="error text-danger">{errors.email.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===== Role ===== */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              {/* ROLE */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.roleid ? "is-invalid" : ""}`}
                    {...register("roleid", { required: "User role is required" })}
                  >
                    <option value="">Select User Role</option>
                    {roles?.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <label>
                    User Role <span className="text-danger">*</span>
                  </label>
                  {errors.roleid && (
                    <span className="error text-danger">{errors.roleid.message}</span>
                  )}
                </div>
              </div>
              {/* PHONE */}
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
                        country="sa"
                        enableSearch
                        inputClass="phone-input"
                        buttonClass="phone-flag"
                      />
                    )}
                  />

                  {errors.phone && (
                    <span className="error text-danger">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===== Phone + Address ===== */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">


              {/* ADDRESS (optional) */}
              <div className="col-lg-6 col-sm-12">
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
          </div>
        </form>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-outline"
        onClick={closeModal}
        disabled={addEditLoader}
      >
        Close
      </button>
      <button
        type="submit"
        form="userForm"
        className="btn btn-primary"
        disabled={addEditLoader}
      >
        {addEditLoader ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          showModal?.user_id ? "Update" : "Save"
        )}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="user-modal-sm"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
