import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../AddEditCrewTemplate.scss";
import useCrewTemplateReducer from "../../../store/CrewTemplateReducer";
import usePortReducer from "../../../store/PortReducer";
import useCommonReducer from "../../../store/CommonReducer";

export function AddEditCrewTemplateModal({ showModal, closeModal, onSuccess }) {
  const isEdit = !!(showModal?.template_id ?? showModal?._id);
  const templateId = showModal?.template_id ?? showModal?._id;

  const { addTemplate, updateTemplate, addEditLoader } =
    useCrewTemplateReducer((state) => state);
  const { ports, getPorts } = usePortReducer((state) => state);
  const { callTypes, getCallTypes } = useCommonReducer((state) => state);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      template_name: "",
      port_id: "",
      call_type_id: "",
      template_file: null,
    },
  });

  useEffect(() => {
    getPorts({ params: { limit: 1000 } });
    getCallTypes();
  }, []);

  useEffect(() => {
    if (showModal && isEdit) {
      reset({
        template_name: showModal?.template_name ?? "",
        port_id: String(showModal?.port_id ?? ""),
        call_type_id: String(showModal?.call_type_id ?? ""),
        template_file: null,
      });
    } else if (showModal && !isEdit) {
      reset({
        template_name: "",
        port_id: "",
        call_type_id: "",
        template_file: null,
      });
    }
  }, [showModal, isEdit, reset]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("template_name", data.template_name?.trim() ?? "");
    formData.append("port_id", data.port_id ? Number(data.port_id) : "");
    formData.append("call_type_id", data.call_type_id ? Number(data.call_type_id) : "");

    const file = data.template_file?.[0];
    if (file) {
      formData.append("template_file", file);
    }

    const cb = () => {
      onSuccess?.();
      closeModal();
    };

    if (isEdit && templateId) {
      formData.append("template_id", templateId);
      updateTemplate({ templateId, formData, cb });
    } else {
      addTemplate({ formData, cb });
    }
  };

  const renderHeader = () => (
    <h1 className="modal-title">
      {isEdit ? "Edit Crew Template" : "Add Crew Template"}
    </h1>
  );

  const renderBody = () => (
    <div className="modal-body">
      <form id="crewTemplateForm" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <div className="form-section-title">Basic Details</div>

          <div className="form-field">
            <label className="form-field-label">Name <span className="text-danger">*</span></label>
            <input
              type="text"
              className={`form-control ${errors.template_name ? "is-invalid" : ""}`}
              placeholder="Template name"
              {...register("template_name", { required: "Name is required" })}
            />
            {errors.template_name && (
              <span className="field-error">{errors.template_name.message}</span>
            )}
          </div>

          <div className="form-field form-row-3">
            <div>
              <label className="form-field-label">Port <span className="text-danger">*</span></label>
              <select
                className={`form-control form-select ${errors.port_id ? "is-invalid" : ""}`}
                {...register("port_id", { required: "Port is required" })}
              >
                <option value="">Select Port</option>
                {(ports ?? []).map((p) => {
                  const id = p?.port_id ?? p?._id ?? p?.id;
                  const label = p?.port ?? p?.name ?? p?.port_name ?? String(id);
                  return (
                    <option key={id} value={String(id)}>
                      {label}
                    </option>
                  );
                })}
              </select>
              {errors.port_id && (
                <span className="field-error">{errors.port_id.message}</span>
              )}
            </div>
            <div>
              <label className="form-field-label">Call Type <span className="text-danger">*</span></label>
              <select
                className={`form-control form-select ${errors.call_type_id ? "is-invalid" : ""}`}
                {...register("call_type_id", { required: "Call Type is required" })}
              >
                <option value="">Select Call Type</option>
                {(callTypes ?? []).map((ct) => (
                  <option key={ct?.call_type_id} value={String(ct?.call_type_id)}>
                    {ct?.call_type ?? ct?.callType ?? ""}
                  </option>
                ))}
              </select>
              {errors.call_type_id && (
                <span className="field-error">{errors.call_type_id.message}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-field-label">
              Template File {!isEdit && <span className="text-danger">*</span>}
            </label>
            <input
              type="file"
              className={`form-control ${errors.template_file ? "is-invalid" : ""}`}
              accept=".xlsx,.xls,.doc,.docx,.pdf"
              {...register("template_file", {
                required: !isEdit ? "Template file is required" : false,
              })}
            />
            {isEdit && showModal?.file_name && (
              <span className="form-text text-muted">
                Current: {showModal.file_name}
              </span>
            )}
            {errors.template_file && (
              <span className="field-error">{errors.template_file.message}</span>
            )}
          </div>
        </div>
      </form>
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
        form="crewTemplateForm"
        className="btn btn-primary"
        disabled={addEditLoader}
      >
        {addEditLoader ? "Saving..." : "Save"}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="crew-template-modal crew-template-modal-lg"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
