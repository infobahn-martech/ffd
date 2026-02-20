import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";
import CustomModal from "../../../components/CustomModal";
import useAppointmentAcceptanceReducer from "../../../store/AppointmentAcceptanceReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export function AppointmentAcceptanceModal({
  showModal,
  closeModal,
  onSuccess,
  callTypesOptions = [],
  portOptions = [],
}) {
  const templateId = showModal?.template_id
  const isEdit = !!templateId;

  const {
    getTemplateByTemplateId,
    addAppointmentAcceptance,
    updateAppointmentAcceptance,
    isBeingUpdated,
    templateById,
  } = useAppointmentAcceptanceReducer((state) => state);

  // API returns array; use first element for form values
  const template = Array.isArray(templateById) ? templateById?.[0] : templateById;

  const defaultValues = useMemo(
    () =>
      isEdit && template
        ? {
          port_id: String(template?.port_id ?? ""),
          call_type_id: String(template?.call_type_id ?? ""),
          subject: template?.subject ?? "",
          body: template?.body ?? "",
        }
        : {
          port_id: "",
          call_type_id: "",
          subject: "",
          body: "",
        },
    [isEdit, template]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (showModal?.template_id) {
      getTemplateByTemplateId({ template_id: showModal?.template_id });
    }
  }, [showModal?.template_id]);

  useEffect(() => {
    if (isEdit && template) {
      reset({
        port_id: String(template?.port_id ?? ""),
        call_type_id: String(template?.call_type_id ?? ""),
        subject: template?.subject ?? "",
        body: template?.body ?? "",
      });
    }
  }, [isEdit, template, reset]);

  const onSubmit = (data) => {
    const num = (v) => (v !== "" && v != null && !isNaN(Number(v)) ? Number(v) : null);
    const port_id = num(data.port_id);
    const call_type_id = num(data.call_type_id);

    const payload = {
      port_id,
      call_type_id,
      subject: data.subject ?? "",
      body: data.body ?? "",
    };

    const cb = () => {
      closeModal();
      onSuccess?.();
    };

    if (isEdit) {
      payload.template_id = Number(template?.template_id ?? templateId ?? "");
      updateAppointmentAcceptance({ formData: payload, cb });
    } else {
      addAppointmentAcceptance({ formData: payload, cb });
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
    <>
      <h1 className="modal-title">
        {isEdit ? "Edit Appointment Acceptance" : "Add Appointment Acceptance"}
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="appointmentAcceptanceForm" onSubmit={handleSubmit(onSubmit)}>

          {/* ROW 1 — Port + Call Type */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              {/* PORT */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.port_id ? "is-invalid" : ""}`}
                    {...register("port_id", { required: "Port is required" })}
                  >
                    <option value="">Select Port</option>
                    {(portOptions ?? []).map((p) => {
                      const id = p?.port_id ?? p?._id ?? p?.id;
                      const label = p?.port ?? p?.name ?? p?.port_name ?? String(id);
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  <label>
                    Port <span className="text-danger">*</span>
                  </label>
                  {errors.port_id && (
                    <span className="error text-danger">{errors.port_id.message}</span>
                  )}
                </div>
              </div>

              {/* CALL TYPE */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.call_type_id ? "is-invalid" : ""}`}
                    {...register("call_type_id", { required: "Call Type is required" })}
                  >
                    <option value="">Select Call Type</option>
                    {(callTypesOptions ?? []).map((ct) => (
                      <option key={ct?.call_type_id} value={String(ct?.call_type_id)}>
                        {ct?.call_type ?? ct?.callType ?? ""}
                      </option>
                    ))}
                  </select>
                  <label>
                    Call Type <span className="text-danger">*</span>
                  </label>
                  {errors.call_type_id && (
                    <span className="error text-danger">{errors.call_type_id.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2 — Subject (ReactQuill) */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label style={{ marginBottom: "8px", display: "block" }}>
                Subject <span className="text-danger">*</span>
              </label>
              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <div className="react-quill-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={field.value || ""}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter subject..."
                    />
                  </div>
                )}
              />
              {errors.subject && (
                <span className="error text-danger" style={{ display: "block", marginTop: "5px" }}>
                  {errors.subject.message}
                </span>
              )}
            </div>
          </div>

          {/* ROW 3 — Body (ReactQuill) */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label style={{ marginBottom: "8px", display: "block" }}>
                Body <span className="text-danger">*</span>
              </label>
              <Controller
                name="body"
                control={control}
                render={({ field }) => (
                  <div className="react-quill-wrapper">
                    <ReactQuill
                      theme="snow"
                      value={field.value || ""}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter body..."
                    />
                  </div>
                )}
              />
              {errors.body && (
                <span className="error text-danger" style={{ display: "block", marginTop: "5px" }}>
                  {errors.body.message}
                </span>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" onClick={closeModal} disabled={isBeingUpdated}>
        Close
      </button>
      <button
        type="submit"
        form="appointmentAcceptanceForm"
        className="btn btn-primary"
        disabled={isBeingUpdated}
      >
        {isBeingUpdated ? "Saving..." : "Save"}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="appointment-acceptance-modal-lg"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}

