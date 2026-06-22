import { useForm, Controller } from "react-hook-form";
import PremiumSelect from "../../../components/form/PremiumSelect";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import CustomModal from "../../../components/CustomModal";
import useVesselReducer from "../../../store/VesselReducer";
import useBillingEntityReducer from "../../../store/BillingEntityReducer";
import useVesselTypeReducer from "../../../store/VesselTypeReducer";
import useTugTypeReducer from "../../../store/TugTypeReducer";
import useBargeTypeReducer from "../../../store/BargeTypeReducer";
import vesselService from "../../../services/vesselService";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/pages/vessel/modals/AddEditVessel.scss";

const VESSEL_CATEGORIES = [
  { value: "vessel", label: "Vessel" },
  { value: "tug", label: "Tug" },
  { value: "barge", label: "Barge" },
];

const currentYear = new Date().getFullYear();

/**
 * API may return { data: { ... } }, { data: [ {...} ] }, or the vessel object at top level.
 */
function unwrapVesselDetail(payload) {
  if (payload == null) return null;
  let node = payload.data !== undefined ? payload.data : payload;
  if (Array.isArray(node)) {
    return node[0] ?? null;
  }
  if (node && typeof node === "object" && Array.isArray(node.data)) {
    return node.data[0] ?? null;
  }
  return node;
}

function resolveBillingEntityId(d, billingEntities) {
  const direct = d?.entity_id;
  if (direct != null && direct !== "") return String(direct);
  const name = d?.billing_entity;
  if (!name || !billingEntities?.length) return "";
  const match = billingEntities.find(
    (e) =>
      String(e.billing_entity ?? "").trim() === String(name).trim()
  );
  return match != null ? String(match.entity_id) : "";
}

function resolveTypeId(d) {
  const category = d?.vessel_category ?? "";
  let id;
  if (category === "tug") id = d?.tug_type_id;
  else if (category === "barge") id = d?.barge_type_id;
  else if (category === "vessel") id = d?.vessel_type_id;
  if (id == null || id === "") {
    id = d?.vessel_type_id ?? d?.tug_type_id ?? d?.barge_type_id;
  }
  return id != null && id !== "" ? String(id) : "";
}

function mapDetailToForm(d, billingEntities) {
  if (!d) return {};
  return {
    billingEntity: resolveBillingEntityId(d, billingEntities),
    vesselCategory: d.vessel_category ?? "",
    vesselTypeId: resolveTypeId(d),
    vesselName: d.vessel_name ?? "",
    vesselOwner: d.vessel_owner ?? "",
    vesselPrincipal: d.vessel_principal ?? "",
    imoNumber: String(d.imo_number ?? ""),
    flagState: d.flag_state ?? "",
    grossTonnage: d.gross_tonnage != null ? String(d.gross_tonnage) : "",
    callSign: d.call_sign ?? "",
    yearBuilt: d.year_built != null ? String(d.year_built) : "",
    classSociety: d.class_society ?? "",
    pnIClub: d.p_i_club ?? "",
    lengthOverall: d.loa != null ? String(d.loa) : "",
    beam: d.beam != null ? String(d.beam) : "",
    draft: d.draft != null ? String(d.draft) : "",
  };
}

export function VesselModal({ showModal, closeModal, callBack }) {
  const { addVessel, updateVessel, isBeingUpdated } = useVesselReducer();
  const {
    billingEntities: billingEntitiesData,
    getBillingEntities,
    isLoading: isLoadingBillingEntities,
  } = useBillingEntityReducer((state) => state);
  const { vesselTypes, getVesselTypes } = useVesselTypeReducer((state) => state);
  const { tugTypes, getTugTypes } = useTugTypeReducer((state) => state);
  const { bargeTypes, getBargeTypes } = useBargeTypeReducer((state) => state);

  const isEditRow =
    showModal &&
    typeof showModal === "object" &&
    (showModal.vessel_id ?? showModal._id);
  const vesselId = isEditRow ? (showModal.vessel_id ?? showModal._id) : null;

  const [loadingDetail, setLoadingDetail] = useState(false);
  /** Normalized vessel row from GET vessel_by_vessel_id (not the raw axios envelope). */
  const [vesselDetailForEdit, setVesselDetailForEdit] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const vesselCategory = watch("vesselCategory");

  const typeFieldConfig = useMemo(() => {
    switch (vesselCategory) {
      case "tug":
        return {
          label: "Tug Type",
          placeholder: "Select Tug Type",
          searchPlaceholder: "Search tug type...",
          options: (tugTypes ?? []).map((t) => ({
            value: String(t.tug_type_id ?? t._id ?? ""),
            label: String(t.tug_type ?? t.name ?? ""),
          })),
        };
      case "barge":
        return {
          label: "Barge Type",
          placeholder: "Select Barge Type",
          searchPlaceholder: "Search barge type...",
          options: (bargeTypes ?? []).map((t) => ({
            value: String(t.barge_type_id ?? t._id ?? ""),
            label: String(t.barge_type ?? t.name ?? ""),
          })),
        };
      case "vessel":
        return {
          label: "Vessel Type",
          placeholder: "Select Vessel Type",
          searchPlaceholder: "Search vessel type...",
          options: (vesselTypes ?? []).map((t) => ({
            value: String(t.vessel_type_id ?? t._id ?? ""),
            label: String(t.vessel_type ?? t.name ?? ""),
          })),
        };
      default:
        return {
          label: "Type",
          placeholder: "Select category first",
          searchPlaceholder: "Search...",
          options: [],
        };
    }
  }, [vesselCategory, vesselTypes, tugTypes, bargeTypes]);

  useEffect(() => {
    if (showModal) {
      getBillingEntities({ params: { limit: 1000 } });
      getVesselTypes({ params: { limit: 1000 } });
      getTugTypes({ params: { limit: 1000 } });
      getBargeTypes({ params: { limit: 1000 } });
    }
  }, [
    showModal,
    getBillingEntities,
    getVesselTypes,
    getTugTypes,
    getBargeTypes,
  ]);

  useEffect(() => {
    if (!showModal) {
      reset({});
      setLoadingDetail(false);
      setVesselDetailForEdit(null);
      return;
    }
    if (showModal === true) {
      reset({});
      setLoadingDetail(false);
      setVesselDetailForEdit(null);
      return;
    }
    const id = showModal?.vessel_id ?? showModal?._id;
    if (!id) return;
    setLoadingDetail(true);
    setVesselDetailForEdit(null);
    vesselService
      .getVesselByVesselId(id)
      .then(({ data }) => {
        const d = unwrapVesselDetail(data);
        if (d) {
          setVesselDetailForEdit(d);
        } else {
          const fallback = unwrapVesselDetail(showModal) || showModal;
          setVesselDetailForEdit(fallback);
        }
      })
      .catch(() => {
        const fallback = unwrapVesselDetail(showModal) || showModal;
        setVesselDetailForEdit(fallback);
      })
      .finally(() => setLoadingDetail(false));
  }, [showModal, reset]);

  useLayoutEffect(() => {
    if (!showModal || showModal === true) return;
    if (!vesselDetailForEdit) return;
    reset(mapDetailToForm(vesselDetailForEdit, billingEntitiesData));
  }, [
    vesselDetailForEdit,
    billingEntitiesData,
    reset,
    showModal,
  ]);

  const trimPayload = (apiPayload) => {
    Object.keys(apiPayload).forEach((k) => {
      if (apiPayload[k] === undefined || apiPayload[k] === "") {
        delete apiPayload[k];
      }
    });
  };

  const onSubmit = (data) => {
    const apiPayload = {
      entity_id: data.billingEntity,
      vessel_name: data.vesselName.trim(),
      vessel_owner: data.vesselOwner?.trim(),
      vessel_principal: data.vesselPrincipal?.trim(),
      imo_number: data.imoNumber.trim(),
      flag_state: data.flagState.trim(),
      gross_tonnage: String(data.grossTonnage).trim(),
      call_sign: data.callSign.trim(),
      year_built: String(data.yearBuilt).trim(),
      class_society: data.classSociety?.trim() || undefined,
      p_i_club: data.pnIClub?.trim() || undefined,
      loa: data.lengthOverall?.toString().trim() || undefined,
      beam: data.beam?.toString().trim() || undefined,
      draft: data.draft?.toString().trim() || undefined,
    };

    trimPayload(apiPayload);

    const category = data.vesselCategory;
    const typeId = data.vesselTypeId;
    apiPayload.vessel_category = category;
    apiPayload.vessel_type_id = category === "vessel" ? typeId : "";
    apiPayload.barge_type_id = category === "barge" ? typeId : "";
    apiPayload.tug_type_id = category === "tug" ? typeId : "";

    const payload = apiPayload;

    if (vesselId) {
      updateVessel({
        id: vesselId,
        formData: payload,
        cb: () => {
          closeModal();
          callBack();
        },
      });
    } else {
      const billingLabel =
        billingEntitiesData?.find(
          (e) => String(e.entity_id) === String(data.billingEntity)
        )?.billing_entity ?? "";

      addVessel({
        formData: payload,
        successMessage: (created) => {
          const c = created && typeof created === "object" ? created : {};
          const name = c.vessel_name ?? data.vesselName.trim();
          const billing = c.billing_entity ?? billingLabel ?? "—";
          const vesselUid =
            c.vessel_unique_id ?? c.vessel_id ?? "—";
          const imo = c.imo_number ?? data.imoNumber.trim();
          return [
            "Vessel created successfully.",
            `Vessel name: ${name}`,
            `Billing entity: ${billing}`,
            `Vessel unique ID: ${vesselUid}`,
            `IMO number: ${imo}`,
          ].join("\n");
        },
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
        {vesselId ? "Edit Vessel" : "Add Vessel"}
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
      {loadingDetail ? (
        <div className="p-4 text-center">Loading vessel…</div>
      ) : (
        <div className="lead-form">
          <form id="vesselForm" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1: Billing Entity | Vessel Category */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="phone-wrapper">
                  <label className="phone-label">
                    Billing Entity <span className="text-danger">*</span>
                  </label>
                  <Controller
                    name="billingEntity"
                    control={control}
                    rules={{ required: "Billing entity is required" }}
                    render={({ field }) => (
                      <PremiumSelect
                        value={field.value != null ? String(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={(billingEntitiesData ?? []).map((entity) => ({
                          value: String(entity.entity_id ?? ""),
                          label: String(entity.billing_entity ?? ""),
                        }))}
                        placeholder="Select Billing Entity"
                        searchPlaceholder="Search billing entity..."
                        disabled={isLoadingBillingEntities}
                        hasError={Boolean(errors.billingEntity)}
                      />
                    )}
                  />
                  {errors.billingEntity && (
                    <span className="error text-danger">
                      {errors.billingEntity.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="phone-wrapper">
                  <label className="phone-label">
                    Vessel Category <span className="text-danger">*</span>
                  </label>
                  <Controller
                    name="vesselCategory"
                    control={control}
                    rules={{ required: "Vessel category is required" }}
                    render={({ field }) => (
                      <PremiumSelect
                        value={field.value != null ? String(field.value) : ""}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setValue("vesselTypeId", "");
                        }}
                        options={VESSEL_CATEGORIES}
                        placeholder="Select Vessel Category"
                        searchPlaceholder="Search vessel category..."
                        hasError={Boolean(errors.vesselCategory)}
                      />
                    )}
                  />
                  {errors.vesselCategory && (
                    <span className="error text-danger">
                      {errors.vesselCategory.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Vessel Type (dynamic) | Vessel Name */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="phone-wrapper">
                  <label className="phone-label">
                    {typeFieldConfig.label}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <Controller
                    name="vesselTypeId"
                    control={control}
                    rules={{ required: `${typeFieldConfig.label} is required` }}
                    render={({ field }) => (
                      <PremiumSelect
                        value={field.value != null ? String(field.value) : ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={typeFieldConfig.options}
                        placeholder={typeFieldConfig.placeholder}
                        searchPlaceholder={typeFieldConfig.searchPlaceholder}
                        disabled={!vesselCategory}
                        hasError={Boolean(errors.vesselTypeId)}
                      />
                    )}
                  />
                  {errors.vesselTypeId && (
                    <span className="error text-danger">
                      {errors.vesselTypeId.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.vesselName ? "is-invalid" : ""}`}
                    placeholder="Vessel Name"
                    {...register("vesselName", {
                      required: "Vessel name is required",
                      validate: (v) =>
                        v.trim().length > 0 || "Vessel name is required",
                    })}
                  />
                  <label>
                    Vessel Name <span className="text-danger">*</span>
                  </label>
                  {errors.vesselName && (
                    <span className="error text-danger">
                      {errors.vesselName.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 3: Vessel Owner | Vessel Principal */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.vesselOwner ? "is-invalid" : ""}`}
                    placeholder="Vessel Owner"
                    {...register("vesselOwner", {
                      required: "Vessel owner is required",
                      validate: (v) =>
                        v.trim().length > 0 || "Vessel owner is required",
                    })}
                  />
                  <label>
                    Vessel Owner <span className="text-danger">*</span>
                  </label>
                  {errors.vesselOwner && (
                    <span className="error text-danger">
                      {errors.vesselOwner.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.vesselPrincipal ? "is-invalid" : ""}`}
                    placeholder="Vessel Charter"
                    {...register("vesselPrincipal", {
                      required: "Vessel charter is required",
                      validate: (v) =>
                        v.trim().length > 0 || "Vessel charter is required",
                    })}
                  />
                  <label>
                    Vessel Charter <span className="text-danger">*</span>
                  </label>
                  {errors.vesselPrincipal && (
                    <span className="error text-danger">
                      {errors.vesselPrincipal.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 4: IMO Number | Flag State */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.imoNumber ? "is-invalid" : ""}`}
                    placeholder="IMO Number (7 digits)"
                    type="text"
                    inputMode="numeric"
                    onInput={(e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 7);
                    }}
                    {...register("imoNumber", {
                      required: "IMO number is required",
                      pattern: {
                        value: /^\d{7}$/,
                        message: "IMO number must be exactly 7 digits",
                      },
                    })}
                  />
                  <label>
                    IMO Number <span className="text-danger">*</span>
                  </label>
                  {errors.imoNumber && (
                    <span className="error text-danger">
                      {errors.imoNumber.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.flagState ? "is-invalid" : ""}`}
                    placeholder="Flag State"
                    {...register("flagState", {
                      required: "Flag state is required",
                      validate: (v) =>
                        v.trim().length > 0 || "Flag state is required",
                    })}
                  />
                  <label>
                    Flag State <span className="text-danger">*</span>
                  </label>
                  {errors.flagState && (
                    <span className="error text-danger">
                      {errors.flagState.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 5: Gross Tonnage | Call Sign */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.grossTonnage ? "is-invalid" : ""}`}
                    placeholder="Gross Tonnage"
                    inputMode="decimal"
                    {...register("grossTonnage", {
                      required: "Gross tonnage is required",
                      validate: (v) => {
                        const n = Number(String(v).replace(/,/g, ""));
                        if (Number.isNaN(n) || n < 0) {
                          return "Enter a valid gross tonnage";
                        }
                        return true;
                      },
                    })}
                  />
                  <label>
                    Gross Tonnage <span className="text-danger">*</span>
                  </label>
                  {errors.grossTonnage && (
                    <span className="error text-danger">
                      {errors.grossTonnage.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.callSign ? "is-invalid" : ""}`}
                    placeholder="Call Sign"
                    {...register("callSign", {
                      required: "Call sign is required",
                      validate: (v) =>
                        v.trim().length > 0 || "Call sign is required",
                    })}
                  />
                  <label>
                    Call Sign <span className="text-danger">*</span>
                  </label>
                  {errors.callSign && (
                    <span className="error text-danger">
                      {errors.callSign.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Row 6: Year Built | Class Society */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.yearBuilt ? "is-invalid" : ""}`}
                    placeholder="Year Built"
                    type="text"
                    inputMode="numeric"
                    onInput={(e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                    }}
                    {...register("yearBuilt", {
                      required: "Year built is required",
                      validate: (v) => {
                        const y = Number(String(v).trim());
                        if (Number.isNaN(y) || y < 1900 || y > currentYear + 1) {
                          return `Enter a year between 1900 and ${currentYear + 1}`;
                        }
                        return true;
                      },
                    })}
                  />
                  <label>
                    Year Built <span className="text-danger">*</span>
                  </label>
                  {errors.yearBuilt && (
                    <span className="error text-danger">
                      {errors.yearBuilt.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className={`form-control ${errors.classSociety ? "is-invalid" : ""}`}
                    placeholder="Class Society"
                    {...register("classSociety")}
                  />
                  <label>Class Society</label>
                </div>
              </div>
            </div>

            {/* Row 7: P&I Club | Length Overall (LOA) */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className="form-control"
                    placeholder="P&I Club"
                    {...register("pnIClub")}
                  />
                  <label>P&I Club</label>
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className="form-control"
                    placeholder="Length Overall (LOA)"
                    {...register("lengthOverall")}
                  />
                  <label>Length Overall (LOA)</label>
                </div>
              </div>
            </div>

            {/* Row 8: Beam | Draft */}
            <div className="permInputs row mb-lg-3">
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className="form-control"
                    placeholder="Beam"
                    {...register("beam")}
                  />
                  <label>Beam</label>
                </div>
              </div>
              <div className="col-lg-6 col-sm-12 mb-3">
                <div className="form-floating desig-inp">
                  <input
                    className="form-control"
                    placeholder="Draft"
                    {...register("draft")}
                  />
                  <label>Draft</label>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
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
        disabled={isBeingUpdated || loadingDetail}
      >
        {isBeingUpdated ? "Saving..." : "Save"}
      </button>
    </div>
  );

  return (
    <CustomModal
      dialgName="modal-dialog modal-dialog-centered vessel-modal-dialog"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
