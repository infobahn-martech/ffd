import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import PremiumSelect from "../../../components/form/PremiumSelect";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/pages/crew-template/AddEditCrewTemplate.scss";
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

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
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

  const selectedFiles = watch("template_file") ?? [];

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList ?? []);
    if (!newFiles.length) return;
    const existing = watch("template_file") ?? [];
    const merged = [...existing];
    newFiles.forEach((file) => {
      const isDuplicate = merged.some((f) => f.name === file.name && f.size === file.size);
      if (!isDuplicate) merged.push(file);
    });
    setValue("template_file", merged, { shouldValidate: true });
  };

  const handleFileChange = (e) => {
    addFiles(e.target?.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer?.files);
  };

  const removeFile = (e, index) => {
    e.stopPropagation();
    const existing = watch("template_file") ?? [];
    const updated = existing.filter((_, i) => i !== index);
    setValue("template_file", updated.length ? updated : null, { shouldValidate: true });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const templateFileRegister = register("template_file", {
    onChange: handleFileChange,
  });
  const { ref: templateFileRef, ...templateFileRest } = templateFileRegister;

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("template_name", data.template_name?.trim() ?? "");
    formData.append("port_id", data.port_id ? Number(data.port_id) : "");
    formData.append("call_type_id", data.call_type_id ? Number(data.call_type_id) : "");

    const files = data.template_file ?? [];
    files.forEach((file) => {
      formData.append("template_file", file);
    });

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

          <div className="form-field form-row-3">
            <div>
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
            <div>
              <label className="form-field-label">Port <span className="text-danger">*</span></label>
              <Controller
                name="port_id"
                control={control}
                rules={{ required: "Port is required" }}
                render={({ field }) => (
                  <PremiumSelect
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    options={(ports ?? []).map((p) => {
                      const id = p?.port_id ?? p?._id ?? p?.id;
                      return {
                        value: String(id ?? ""),
                        label: String(p?.port ?? p?.name ?? p?.port_name ?? id ?? ""),
                      };
                    })}
                    placeholder="Select Port"
                    searchPlaceholder="Search port..."
                    hasError={Boolean(errors.port_id)}
                  />
                )}
              />
              {errors.port_id && (
                <span className="field-error">{errors.port_id.message}</span>
              )}
            </div>
            <div>
              <label className="form-field-label">Call Type <span className="text-danger">*</span></label>
              <Controller
                name="call_type_id"
                control={control}
                rules={{ required: "Call Type is required" }}
                render={({ field }) => (
                  <PremiumSelect
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    options={(callTypes ?? []).map((ct) => ({
                      value: String(ct?.call_type_id ?? ""),
                      label: String(ct?.call_type ?? ct?.callType ?? ""),
                    }))}
                    placeholder="Select Call Type"
                    searchPlaceholder="Search call type..."
                    hasError={Boolean(errors.call_type_id)}
                  />
                )}
              />
              {errors.call_type_id && (
                <span className="field-error">{errors.call_type_id.message}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-field-label">Template File</label>
            <div
              className={`crew-template-upload-zone ${isDragging ? "dragging" : ""} ${errors.template_file ? "is-invalid" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload template files - click or drag and drop"
            >
              <input
                type="file"
                className="file-input-hidden"
                accept=".xlsx,.xls,.doc,.docx,.pdf"
                aria-label="Upload template files"
                multiple
                {...templateFileRest}
                ref={(el) => {
                  fileInputRef.current = el;
                  templateFileRef(el);
                }}
              />
              <div className="upload-zone-placeholder">
                <div className="upload-icon">
                  <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <rect x="4" y="4" width="40" height="40" rx="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                    <path d="M24 16V32M24 16L18 22M24 16L30 22M12 36H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="upload-main-text">Drag and drop your files here, or <span className="upload-link">browse</span></p>
                <p className="upload-sub-text">Supports: PDF, DOC, DOCX, XLS, XLSX (Max 10MB)</p>
              </div>
            </div>
            {selectedFiles.length > 0 && (
              <div className="upload-file-list">
                {selectedFiles.map((file, index) => (
                  <div className="upload-file-item" key={`${file.name}-${file.size}-${index}`}>
                    <span className="file-name">{file.name}</span>
                    <button type="button" className="remove-file-btn" onClick={(e) => removeFile(e, index)} aria-label={`Remove ${file.name}`}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {isEdit && showModal?.file_name && selectedFiles.length === 0 && (
              <span className="form-text text-muted">Current: {showModal.file_name}</span>
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
        aria-busy={addEditLoader}
      >
        {addEditLoader ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            Saving...
          </>
        ) : (
          "Save"
        )}
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
