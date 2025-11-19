import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function RoleModal({ showModal, closeModal }) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: showModal?._id
      ? {
          roleName: showModal?.roleName,
          description: showModal?.description
        }
      : {}
  });

  const onSubmit = (data) => {
    console.log("ROLE FORM SUBMITTED:", data);
    closeModal();
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Role" : "Add Role"}
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
        <form id="roleForm" onSubmit={handleSubmit(onSubmit)}>

          {/* ROW 1 — ROLE NAME */}
          <div className="permInputs row mb-lg-3">
            <div className="col-12">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.roleName ? "is-invalid" : ""}`}
                  placeholder="Role Name"
                  {...register("roleName", {
                    required: "Role name is required"
                  })}
                />
                <label>
                  Role <span className="text-danger">*</span>
                </label>
                {errors.roleName && (
                  <span className="error text-danger">
                    {errors.roleName.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2 — DESCRIPTION */}
          <div className="permInputs row mb-lg-3">
            <div className="col-12">
              <div className="form-floating desig-inp">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  style={{ height: "120px" }}
                  {...register("description")}
                ></textarea>
                <label>Description</label>
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
      <button type="submit" form="roleForm" className="btn btn-primary">
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
