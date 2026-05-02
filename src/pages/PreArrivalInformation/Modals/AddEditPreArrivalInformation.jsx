import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../AddEditPreArrivalInformation.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import usePreArrivalInfoReducer from "../../../store/PreArrivalInfoReducer";
import usePortReducer from "../../../store/PortReducer";
import useCommonReducer from "../../../store/CommonReducer";
import PremiumSelect from "../../../components/form/PremiumSelect";

export function PreArrivalInformationModal({ showModal, closeModal, onSuccess }) {
  const isEdit = !!(showModal?.template_id ?? showModal?._id);
  const templateId = showModal?.template_id ?? showModal?._id;

  const { templateUserTypes, getTemplateUserTypes, addTemplate, updateTemplate, addEditLoader } =
    usePreArrivalInfoReducer((state) => state);
  const { ports, getPorts } = usePortReducer((state) => state);
  const { callTypes, getCallTypes } = useCommonReducer((state) => state);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      template_name: "",
      port_id: "",
      call_type_id: "",
      template_usertype_id: "",
      subject_line: "",
      description_content: "",
      agent_full_details: "",
      important_contacts: "",
    },
  });

  useEffect(() => {
    getPorts({ params: { limit: 1000 } });
    getCallTypes();
    getTemplateUserTypes();
  }, []);

  useEffect(() => {
    if (showModal && isEdit) {
      reset({
        template_name: showModal?.template_name ?? "",
        port_id: String(showModal?.port_id ?? ""),
        call_type_id: String(showModal?.call_type_id ?? ""),
        template_usertype_id: String(showModal?.template_usertype_id ?? ""),
        subject_line: showModal?.subject_line ?? "",
        description_content: showModal?.description_content ?? "",
        agent_full_details: showModal?.agent_full_details ?? "",
        important_contacts: showModal?.important_contacts ?? "",
      });
    } else if (showModal && !isEdit) {
      reset({
        template_name: "",
        port_id: "",
        call_type_id: "",
        template_usertype_id: "",
        subject_line: "",
        description_content: "",
        agent_full_details: "",
        important_contacts: "",
      });
    }
  }, [showModal, isEdit, reset]);

  const onSubmit = (data) => {
    const payload = {
      template_name: data.template_name?.trim() ?? "",
      port_id: data.port_id ? Number(data.port_id) : undefined,
      call_type_id: data.call_type_id ? Number(data.call_type_id) : undefined,
      template_usertype_id: data.template_usertype_id ? Number(data.template_usertype_id) : undefined,
      subject_line: data.subject_line ?? "",
      description_content: data.description_content ?? "",
      agent_full_details: data.agent_full_details ?? "",
      important_contacts: data.important_contacts ?? "",
    };

    const cb = () => {
      onSuccess?.();
      closeModal();
    };

    if (isEdit && templateId) {
      updateTemplate({ templateId, payload, cb });
    } else {
      addTemplate({ payload, cb });
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "link",
    "image",
  ];

  const renderHeader = () => (
    <h1 className="modal-title">
      {isEdit ? "Edit Pre-Arrival Information" : "Add Pre-Arrival Information"}
    </h1>
  );

  const renderBody = () => (
    <div className="modal-body">
      <form id="preArrivalInformationForm" onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Details */}
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
              <label className="form-field-label">Port Type <span className="text-danger">*</span></label>
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
            <div>
              <label className="form-field-label">User Type <span className="text-danger">*</span></label>
              <Controller
                name="template_usertype_id"
                control={control}
                rules={{ required: "User Type is required" }}
                render={({ field }) => (
                  <PremiumSelect
                    value={field.value != null ? String(field.value) : ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    options={(templateUserTypes ?? []).map((ut) => ({
                      value: String(ut?.template_usertype_id ?? ""),
                      label: String(ut?.usertype_name ?? ""),
                    }))}
                    placeholder="Select User Type"
                    searchPlaceholder="Search user type..."
                    hasError={Boolean(errors.template_usertype_id)}
                  />
                )}
              />
              {errors.template_usertype_id && (
                <span className="field-error">{errors.template_usertype_id.message}</span>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-field-label">Subject <span className="text-danger">*</span></label>
            <textarea
              className={`form-control ${errors.subject_line ? "is-invalid" : ""}`}
              rows={3}
              placeholder="Subject line"
              {...register("subject_line", { required: "Subject is required" })}
            />
            {errors.subject_line && (
              <span className="field-error">{errors.subject_line.message}</span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="form-section">
          <div className="form-section-title">Content Details</div>

          <div className="form-field">
            <label className="form-field-label">Description</label>
            <Controller
              name="description_content"
              control={control}
              render={({ field }) => (
                <div className="react-quill-wrapper pre-arrival-quill">
                  <ReactQuill
                    theme="snow"
                    value={field.value || ""}
                    onChange={field.onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Description..."
                  />
                </div>
              )}
            />
          </div>

          <div className="form-field">
            <label className="form-field-label">Agent Full Details</label>
            <Controller
              name="agent_full_details"
              control={control}
              render={({ field }) => (
                <div className="react-quill-wrapper pre-arrival-quill">
                  <ReactQuill
                    theme="snow"
                    value={field.value || ""}
                    onChange={field.onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Agent full details..."
                  />
                </div>
              )}
            />
          </div>

          <div className="form-field">
            <label className="form-field-label">Important Contacts</label>
            <Controller
              name="important_contacts"
              control={control}
              render={({ field }) => (
                <div className="react-quill-wrapper pre-arrival-quill">
                  <ReactQuill
                    theme="snow"
                    value={field.value || ""}
                    onChange={field.onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Important contacts..."
                  />
                </div>
              )}
            />
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
        form="preArrivalInformationForm"
        className="btn btn-primary"
        disabled={addEditLoader}
      >
        {addEditLoader ? "Saving..." : "Save"}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="pre-arrival-information-modal pre-arrival-information-modal-lg"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
