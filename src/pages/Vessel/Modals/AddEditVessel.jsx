import { useForm } from "react-hook-form";
import { useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useVesselReducer from "../../../store/VesselReducer";
import useVesselTypeReducer from "../../../store/VesselTypeReducer";
import useBillingEntityReducer from "../../../store/BillingEntityReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function VesselModal({ showModal, closeModal, callBack }) {
  const { addVessel, updateVessel, isBeingUpdated } = useVesselReducer();
  const { vesselTypes, getVesselTypes, isLoading: isLoadingVesselTypes } = useVesselTypeReducer((state) => state);
  const { billingEntities: billingEntitiesData, getBillingEntities, isLoading: isLoadingBillingEntities } = useBillingEntityReducer((state) => state);

  // Fetch vessel types and billing entities when modal opens
  useEffect(() => {
    if (showModal) {
      getVesselTypes({ params: { limit: 1000 } });
      getBillingEntities({ params: { limit: 1000 } });
    }
  }, [showModal]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: showModal?._id
      ? {
        billingEntity: showModal?.billingEntity || "",
        vesselType: showModal?.vesselType || "",
        vesselName: showModal?.vesselName || "",
        imoNumber: showModal?.imoNumber || "",
        flagState: showModal?.flagState || "",
        grossTonnage: showModal?.grossTonnage || "",
        callSign: showModal?.callSign || "",
        yearBuilt: showModal?.yearBuilt || "",
        classSociety: showModal?.classSociety || "",
        pnIClub: showModal?.pnIClub || "",
        lengthOverall: showModal?.lengthOverall || "",
        beam: showModal?.beam || "",
        draft: showModal?.draft || "",
      }
      : {},
  });

  const onSubmit = (data) => {
    // Map form data to API payload format
    const apiPayload = {
      entity_id: data.billingEntity,
      vessel_name: data.vesselName,
      imo_number: data.imoNumber,
      vessel_type: data.vesselType,
      flag_state: data.flagState,
      gross_tonnage: data.grossTonnage,
      call_sign: data.callSign,
      year_built: data.yearBuilt,
      class_society: data.classSociety,
      p_i_club: data.pnIClub,
      loa: data.lengthOverall,
      beam: data.beam,
      draft: data.draft,
    };

    if (showModal?._id) {
      // Update existing vessel
      updateVessel({
        id: showModal._id,
        formData: apiPayload,
        cb: () => {
          closeModal();
          callBack();
        },
      });
    } else {
      // Add new vessel
      addVessel({
        formData: apiPayload,
        cb: () => {
          closeModal();
          callBack();
        },
      });
    }
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">
        {showModal?._id ? "Edit Vessel" : "Add Vessel"}
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
        <form id="vesselForm" onSubmit={handleSubmit(onSubmit)}>
          {/* ROW 1 — Vessel Type */}
          <div className="permInputs row mb-lg-3">
            {/* Vessel Type */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <select
                  className={`form-control ${errors.vesselType ? "is-invalid" : ""}`}
                  {...register("vesselType", { required: "Vessel Type is required" })}
                  disabled={isLoadingVesselTypes}
                >
                  <option value="">Select Vessel Type</option>
                  {vesselTypes?.map((type) => {
                    const value = type.vessel_type || type.name || type.vessel_type_id || type._id;
                    const label = type.vessel_type || type.name || value;
                    return (
                      <option key={type.vessel_type_id || type._id || value} value={value}>
                        {label}
                      </option>
                    );
                  })}
                </select>
                <label>
                  Vessel Type <span className="text-danger">*</span>
                </label>
                {errors.vesselType && (
                  <span className="error text-danger">{errors.vesselType.message}</span>
                )}
              </div>
            </div>
            {/* Billing Entity */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <select
                  className={`form-control ${errors.billingEntity ? "is-invalid" : ""}`}
                  {...register("billingEntity", { required: "Billing Entity is required" })}
                  disabled={isLoadingBillingEntities}
                >
                  <option value="">Select Billing Entity</option>

                  {billingEntitiesData?.map((entity) => (
                    <option
                      key={entity.entity_id}
                      value={entity.entity_id}
                    >
                      {entity.billing_entity}
                    </option>
                  ))}
                </select>

                <label>
                  Billing Entity <span className="text-danger">*</span>
                </label>
                {errors.billingEntity && (
                  <span className="error text-danger">{errors.billingEntity.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2 — Vessel Name + IMO Number */}
          <div className="permInputs row mb-lg-3">
            {/* Vessel Name */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.vesselName ? "is-invalid" : ""}`}
                  placeholder="Vessel Name"
                  {...register("vesselName", { required: "Vessel Name is required" })}
                />
                <label>
                  Vessel Name <span className="text-danger">*</span>
                </label>
                {errors.vesselName && (
                  <span className="error text-danger">{errors.vesselName.message}</span>
                )}
              </div>
            </div>

            {/* IMO Number */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.imoNumber ? "is-invalid" : ""}`}
                  placeholder="IMO Number"
                  {...register("imoNumber", { required: "IMO Number is required" })}
                />
                <label>
                  IMO Number <span className="text-danger">*</span>
                </label>
                {errors.imoNumber && (
                  <span className="error text-danger">{errors.imoNumber.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 3 — Flag State + Gross Tonnage */}
          <div className="permInputs row mb-lg-3">
            {/* Flag State */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.flagState ? "is-invalid" : ""}`}
                  placeholder="Flag State"
                  {...register("flagState", { required: "Flag State is required" })}
                />
                <label>
                  Flag State <span className="text-danger">*</span>
                </label>
                {errors.flagState && (
                  <span className="error text-danger">{errors.flagState.message}</span>
                )}
              </div>
            </div>

            {/* Gross Tonnage */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.grossTonnage ? "is-invalid" : ""}`}
                  placeholder="Gross Tonnage"
                  {...register("grossTonnage", { required: "Gross Tonnage is required" })}
                />
                <label>
                  Gross Tonnage <span className="text-danger">*</span>
                </label>
                {errors.grossTonnage && (
                  <span className="error text-danger">{errors.grossTonnage.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 4 — Call Sign + Year Built */}
          <div className="permInputs row mb-lg-3">
            {/* Call Sign */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.callSign ? "is-invalid" : ""}`}
                  placeholder="Call Sign"
                  {...register("callSign", { required: "Call Sign is required" })}
                />
                <label>
                  Call Sign <span className="text-danger">*</span>
                </label>
                {errors.callSign && (
                  <span className="error text-danger">{errors.callSign.message}</span>
                )}
              </div>
            </div>

            {/* Year Built */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.yearBuilt ? "is-invalid" : ""}`}
                  placeholder="Year Built"
                  {...register("yearBuilt", { required: "Year Built is required" })}
                />
                <label>
                  Year Built <span className="text-danger">*</span>
                </label>
                {errors.yearBuilt && (
                  <span className="error text-danger">{errors.yearBuilt.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 5 — Class Society + P&I Club */}
          <div className="permInputs row mb-lg-3">
            {/* Class Society */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.classSociety ? "is-invalid" : ""}`}
                  placeholder="Class Society"
                  {...register("classSociety")}
                />
                <label>
                  Class Society
                </label>
              </div>
            </div>

            {/* P&I Club */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control`}
                  placeholder="P&I Club"
                  {...register("pnIClub")}
                />
                <label>
                  P&I Club
                </label>
              </div>
            </div>
          </div>

          {/* ROW 6 — Length Overall + Beam */}
          <div className="permInputs row mb-lg-3">
            {/* Length Overall */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control`}
                  placeholder="Length Overall"
                  {...register("lengthOverall")}
                />
                <label>
                  Length Overall
                </label>
              </div>
            </div>

            {/* Beam */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control`}
                  placeholder="Beam"
                  {...register("beam")}
                />
                <label>
                  Beam
                </label>
              </div>
            </div>
          </div>

          {/* ROW 7 — Draft + (Empty) */}
          <div className="permInputs row mb-lg-3">
            {/* Draft */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control`}
                  placeholder="Draft"
                  {...register("draft")}
                />
                <label>
                  Draft
                </label>
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
      <button
        type="submit"
        form="vesselForm"
        className="btn btn-primary"
        disabled={isBeingUpdated}
      >
        {isBeingUpdated ? "Saving..." : "Save"}
      </button>
    </div>
  );

  return (
    <CustomModal
      dialgName="modal-dialog modal-dialog-centered modal-lg"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
