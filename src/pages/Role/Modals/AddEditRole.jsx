import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function RoleModal({
  showModal,
  closeModal,
  createRole,
  updateRole,
  onSuccess,
  isBeingUpdated
}) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: showModal?._id
      ? {
        roleName: showModal?.name,
        description: showModal?.description || ""
      }
      : {}
  });

  const onSubmit = (data) => {
    if (showModal?._id) {
      // Update existing role
      updateRole({
        id: showModal._id,
        formData: data,
        cb: onSuccess,
      });
    } else {
      // Create new role
      createRole({
        formData: data,
        cb: onSuccess,
      });
    }
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Role" : "Add Role"}
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="roleForm" onSubmit={handleSubmit(onSubmit)}>

          {/* ROLE NAME — FULL ROW */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="form-field">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.roleName ? "is-invalid" : ""}`}
                  placeholder="Role Name"
                  {...register("roleName", {
                    required: "Role name is required",
                    minLength: {
                      value: 3,
                      message: "Role name must be at least 3 characters"
                    }
                  })}
                />
                <label>
                  Role <span className="text-danger">*</span>
                </label>
              </div>
              {errors.roleName && (
                <span className="field-error">
                  {errors.roleName.message}
                </span>
              )}
            </div>
          </div>

          {/* DESCRIPTION — FULL ROW TEXTAREA */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="form-field">
              <div className="form-floating desig-inp">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  style={{ height: "120px" }}
                  {...register("description", {
                    required: false,
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters"
                    }
                  })}
                ></textarea>
                <label>Description</label>
              </div>
              {errors.description && (
                <span className="field-error">
                  {errors.description.message}
                </span>
              )}
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
        disabled={isBeingUpdated}
      >
        Close
      </button>
      <button
        type="submit"
        form="roleForm"
        className="btn btn-primary"
        disabled={isBeingUpdated}
      >
        {isBeingUpdated ? "Saving..." : "Save"}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="role-modal-sm"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
