import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function VesselTypeModal({ showModal, closeModal }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: showModal?._id
      ? {
        name: showModal?.name,
      }
      : {
        name: "",
      },
  });

  const onSubmit = (data) => {
    console.log("VESSEL TYPE FORM SUBMITTED:", data);
    closeModal();
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Vessel Type" : "Add Vessel Type"}
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
        <form id="vesselTypeForm" onSubmit={handleSubmit(onSubmit)}>
          <div className="permInputs row mb-lg-3">
            <div className="col-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  placeholder="Name"
                  {...register("name", { required: "Name is required" })}
                />
                <label>
                  Name <span className="text-danger">*</span>
                </label>
                {errors.name && (
                  <span className="error text-danger">{errors.name.message}</span>
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
      <button type="submit" form="vesselTypeForm" className="btn btn-primary">
        Save
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
