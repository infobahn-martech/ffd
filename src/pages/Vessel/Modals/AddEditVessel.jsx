import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

// Vessel Type Options
const VESSEL_TYPE_OPTIONS = [
  "Vessel one",
  "Vessel two",
  "Vessel three",
  "Vessel four",
  "Vessel five",
];

// Billing Entity Options (will be populated from API or constants)
const BILLING_ENTITY_OPTIONS = [
  "Billing Entity 1",
  "Billing Entity 2",
  "Billing Entity 3",
];

export function VesselModal({ showModal, closeModal }) {
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
    console.log("VESSEL FORM SUBMITTED:", data);
    closeModal();
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
                >
                  <option value="">Select Vessel Type</option>
                  {VESSEL_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <label>
                  Vessel Type <span className="text-danger">*</span>
                </label>
                {errors.vesselType && (
                  <span className="error text-danger">{errors.vesselType.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2 — Vessel Name + Flag State */}
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
          </div>

          {/* ROW 3 — Gross Tonnage + Call Sign */}
          <div className="permInputs row mb-lg-3">
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
          </div>

          {/* ROW 4 — Year Built + Class Society */}
          <div className="permInputs row mb-lg-3">
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

            {/* Class Society */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.classSociety ? "is-invalid" : ""}`}
                  placeholder="Class Society"
                  {...register("classSociety", { required: "Class Society is required" })}
                />
                <label>
                  Class Society <span className="text-danger">*</span>
                </label>
                {errors.classSociety && (
                  <span className="error text-danger">{errors.classSociety.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 5 — P&I Club + Length Overall */}
          <div className="permInputs row mb-lg-3">
            {/* P&I Club */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.pnIClub ? "is-invalid" : ""}`}
                  placeholder="P&I Club"
                  {...register("pnIClub", { required: "P&I Club is required" })}
                />
                <label>
                  P&I Club <span className="text-danger">*</span>
                </label>
                {errors.pnIClub && (
                  <span className="error text-danger">{errors.pnIClub.message}</span>
                )}
              </div>
            </div>

            {/* Length Overall */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.lengthOverall ? "is-invalid" : ""}`}
                  placeholder="Length Overall"
                  {...register("lengthOverall", { required: "Length Overall is required" })}
                />
                <label>
                  Length Overall <span className="text-danger">*</span>
                </label>
                {errors.lengthOverall && (
                  <span className="error text-danger">{errors.lengthOverall.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* ROW 6 — Beam + Draft */}
          <div className="permInputs row mb-lg-3">
            {/* Beam */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.beam ? "is-invalid" : ""}`}
                  placeholder="Beam"
                  {...register("beam", { required: "Beam is required" })}
                />
                <label>
                  Beam <span className="text-danger">*</span>
                </label>
                {errors.beam && (
                  <span className="error text-danger">{errors.beam.message}</span>
                )}
              </div>
            </div>

            {/* Draft */}
            <div className="col-lg-6 col-sm-12 mb-3">
              <div className="form-floating desig-inp">
                <input
                  className={`form-control ${errors.draft ? "is-invalid" : ""}`}
                  placeholder="Draft"
                  {...register("draft", { required: "Draft is required" })}
                />
                <label>
                  Draft <span className="text-danger">*</span>
                </label>
                {errors.draft && (
                  <span className="error text-danger">{errors.draft.message}</span>
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
      <button type="submit" form="vesselForm" className="btn btn-primary">
        Save
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
