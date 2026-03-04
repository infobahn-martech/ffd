import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import usePreArrivalInfoReducer from "../../../store/PreArrivalInfoReducer";
import usePortReducer from "../../../store/PortReducer";
import useCommonReducer from "../../../store/CommonReducer";

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
      <div className="lead-form">
        <form id="preArrivalInformationForm" onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label>Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.template_name ? "is-invalid" : ""}`}
                placeholder="Template name"
                {...register("template_name", { required: "Name is required" })}
              />
              {errors.template_name && (
                <span className="error text-danger">{errors.template_name.message}</span>
              )}
            </div>
          </div>

          {/* Port Type, Call Type, User Type */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              <div className="col-lg-4 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.port_id ? "is-invalid" : ""}`}
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
                  <label>Port Type <span className="text-danger">*</span></label>
                  {errors.port_id && (
                    <span className="error text-danger">{errors.port_id.message}</span>
                  )}
                </div>
              </div>
              <div className="col-lg-4 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.call_type_id ? "is-invalid" : ""}`}
                    {...register("call_type_id", { required: "Call Type is required" })}
                  >
                    <option value="">Select Call Type</option>
                    {(callTypes ?? []).map((ct) => (
                      <option key={ct?.call_type_id} value={String(ct?.call_type_id)}>
                        {ct?.call_type ?? ct?.callType ?? ""}
                      </option>
                    ))}
                  </select>
                  <label>Call Type <span className="text-danger">*</span></label>
                  {errors.call_type_id && (
                    <span className="error text-danger">{errors.call_type_id.message}</span>
                  )}
                </div>
              </div>
              <div className="col-lg-4 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.template_usertype_id ? "is-invalid" : ""}`}
                    {...register("template_usertype_id", { required: "User Type is required" })}
                  >
                    <option value="">Select User Type</option>
                    {(templateUserTypes ?? []).map((ut) => (
                      <option key={ut?.template_usertype_id} value={String(ut?.template_usertype_id)}>
                        {ut?.usertype_name ?? ""}
                      </option>
                    ))}
                  </select>
                  <label>User Type <span className="text-danger">*</span></label>
                  {errors.template_usertype_id && (
                    <span className="error text-danger">{errors.template_usertype_id.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subject - TextArea */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label>Subject <span className="text-danger">*</span></label>
              <textarea
                className={`form-control ${errors.subject_line ? "is-invalid" : ""}`}
                rows={3}
                placeholder="Subject line"
                {...register("subject_line", { required: "Subject is required" })}
              />
              {errors.subject_line && (
                <span className="error text-danger">{errors.subject_line.message}</span>
              )}
            </div>
          </div>

          {/* Description - React Quill */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label style={{ marginBottom: "8px", display: "block" }}>Description</label>
              <Controller
                name="description_content"
                control={control}
                render={({ field }) => (
                  <div className="react-quill-wrapper">
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
          </div>

          {/* Agent Full Details - React Quill */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label style={{ marginBottom: "8px", display: "block" }}>Agent Full Details</label>
              <Controller
                name="agent_full_details"
                control={control}
                render={({ field }) => (
                  <div className="react-quill-wrapper">
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
          </div>

          {/* Important Contacts - React Quill */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label style={{ marginBottom: "8px", display: "block" }}>Important Contacts</label>
              <Controller
                name="important_contacts"
                control={control}
                render={({ field }) => (
                  <div className="react-quill-wrapper">
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
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" onClick={closeModal} disabled={addEditLoader}>
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
      className="pre-arrival-information-modal-lg"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
