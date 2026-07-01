import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useBillingEntityReducer from "../../../store/BillingEntityReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/billing-entity-modal.scss";
import userIcon from "../../../assets/images/DummyProPic.avif";
import edit from "../../../assets/images/edit.svg";


export function BillingEntityModal({ showModal, closeModal, onSuccess }) {
  const isEdit = !!showModal?.entity_id;

  const { updateBillingEntityDetail, addEditLoader } = useBillingEntityReducer((s) => s);

  const [logoImage, setLogoImage] = useState(null);
  const [logoImagePreview, setLogoImagePreview] = useState(userIcon);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      billingEntityName: "",
      creditLimit: "",
    },
  });

  useEffect(() => {
    if (isEdit) {
      reset({
        billingEntityName: showModal?.billing_entity ?? showModal?.billingEntityName ?? "",
        creditLimit: showModal?.credit_limit ?? showModal?.creditLimit ?? "",
      });
      setLogoImagePreview(showModal?.entity_logo || showModal?.logo_path || userIcon);
    } else {
      reset({ billingEntityName: "", creditLimit: "" });
      setLogoImagePreview(userIcon);
    }
    setLogoImage(null);
  }, [showModal, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateBillingEntityDetail({
        entityId: showModal.entity_id,
        billingEntityName: data.billingEntityName,
        creditLimit: data.creditLimit,
        logoFile: logoImage || null,
        cb: () => {
          onSuccess?.();
          closeModal();
        },
      });
    } else {
      // TODO: wire create endpoint when available
      onSuccess?.();
      closeModal();
    }
  };

  const renderHeader = () => (
    <h1 className="modal-title">
      {isEdit ? "Edit Billing Entity" : "Add Billing Entity"}
    </h1>
  );

  const renderBody = () => (
    <div className="modal-body billing-entity-modal">
      <div className="lead-form">
        <form id="billingEntityForm" onSubmit={handleSubmit(onSubmit)}>

          {/* Logo Upload */}
          <div className="d-flex justify-content-center mb-4">
            <div className="avatar-outer">
              <div className="avatar-wrapper">
                <img
                  src={logoImagePreview}
                  alt="Billing Entity Logo"
                  className="avatar-image"
                />
              </div>
              <label htmlFor="logoUpload" className="avatar-edit-icon">
                <img src={edit} alt="Edit" className="avatar-edit-pencil" />
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

          {/* Billing Entity Name + Credit Limit on one row */}
          <div className="permInputs row mb-lg-3">

            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.billingEntityName ? "is-invalid" : ""}`}
                  placeholder="Billing Entity Name"
                  disabled={isEdit}
                  {...register("billingEntityName", { required: !isEdit && "Billing Entity Name is required" })}
                />
                <label>Billing Entity Name <span className="text-danger">*</span></label>
                {errors.billingEntityName && (
                  <span className="error text-danger">{errors.billingEntityName.message}</span>
                )}
              </div>
            </div>

            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-control ${errors.creditLimit ? "is-invalid" : ""}`}
                  placeholder="Credit Limit"
                  {...register("creditLimit")}
                />
                <label>Credit Limit</label>
                {errors.creditLimit && (
                  <span className="error text-danger">{errors.creditLimit.message}</span>
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
      <button type="button" className="btn btn-outline" onClick={closeModal} disabled={addEditLoader}>
        Close
      </button>
      <button type="submit" form="billingEntityForm" className="btn btn-primary" disabled={addEditLoader}>
        {addEditLoader ? "Saving..." : "Save"}
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
