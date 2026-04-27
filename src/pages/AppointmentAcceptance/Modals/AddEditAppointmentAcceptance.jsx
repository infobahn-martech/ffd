import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo } from "react";
import CustomModal from "../../../components/CustomModal";
import useAppointmentAcceptanceReducer from "../../../store/AppointmentAcceptanceReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export function ReportTemplatesModal({
  showModal,
  closeModal,
  onSuccess,
  callTypesOptions = [],
  portOptions = [],
  reportTypesOptions = [],
}) {
  const templateId = showModal?.template_id
  const isEdit = !!templateId;

  const {
    getTemplateByTemplateId,
    createReportTemplate,
    updateReportTemplate,
    isBeingUpdated,
    templateById,
  } = useAppointmentAcceptanceReducer((state) => state);

  // API returns array; use first element for form values
  const template = Array.isArray(templateById) ? templateById?.[0] : templateById;

  const defaultValues = useMemo(
    () =>
      isEdit && template
        ? {
          report_type_id: String(template?.report_type_id ?? ""),
          port_id: String(template?.port_id ?? ""),
          call_type_id: String(template?.call_type_id ?? ""),
          subject: template?.subject ?? "",
          body: template?.body ?? "",
        }
        : {
          report_type_id: "",
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
        report_type_id: String(template?.report_type_id ?? ""),
        port_id: String(template?.port_id ?? ""),
        call_type_id: String(template?.call_type_id ?? ""),
        subject: template?.subject ?? "",
        body: template?.body ?? "",
      });
    }
  }, [isEdit, template, reset]);

  const onSubmit = (data) => {
    const num = (v) => (v !== "" && v != null && !isNaN(Number(v)) ? Number(v) : null);
    const report_type_id = num(data.report_type_id);
    const port_id = num(data.port_id);
    const call_type_id = num(data.call_type_id);

    const payload = {
      report_type_id,
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
      updateReportTemplate({ formData: payload, cb });
    } else {
      createReportTemplate({ formData: payload, cb });
    }
  };

  const isHtmlEmpty = (value) => {
    if (!value) return true;
    const stripped = value.replace(/<(.|\n)*?>/g, "").replace(/&nbsp;/g, " ").trim();
    return stripped.length === 0;
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
        {isEdit ? "Edit Report Template" : "Add Report Template"}
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="reportTemplatesForm" onSubmit={handleSubmit(onSubmit)}>

          {/* ROW 1 — Report Type + Port */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              {/* REPORT TYPE */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.report_type_id ? "is-invalid" : ""}`}
                    {...register("report_type_id", { required: "Report Type is required" })}
                  >
                    <option value="">Select Report Type</option>
                    {(reportTypesOptions ?? []).map((rt) => (
                      <option key={rt?.report_type_id} value={String(rt?.report_type_id)}>
                        {rt?.report_type ?? ""}
                      </option>
                    ))}
                  </select>
                  <label>
                    Report Type <span className="text-danger">*</span>
                  </label>
                  {errors.report_type_id && (
                    <span className="error text-danger">{errors.report_type_id.message}</span>
                  )}
                </div>
              </div>

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

            </div>
          </div>

          {/* ROW 2 — Call Type */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              <div className="col-lg-12 col-sm-12">
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

          {/* ROW 3 — Subject (ReactQuill) */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label style={{ marginBottom: "8px", display: "block" }}>
                Subject <span className="text-danger">*</span>
              </label>
              <Controller
                name="subject"
                control={control}
                rules={{
                  required: "Subject is required",
                  validate: (value) => !isHtmlEmpty(value) || "Subject is required",
                }}
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
                <span
                  className="error text-danger d-block"
                  style={{ marginTop: "6px", position: "static", fontSize: "12px", lineHeight: "1.2" }}
                >
                  {errors.subject.message}
                </span>
              )}
            </div>
          </div>

          {/* ROW 4 — Body (ReactQuill) */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label style={{ marginBottom: "8px", display: "block" }}>
                Body <span className="text-danger">*</span>
              </label>
              <Controller
                name="body"
                control={control}
                rules={{
                  required: "Body is required",
                  validate: (value) => !isHtmlEmpty(value) || "Body is required",
                }}
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
                <span
                  className="error text-danger d-block"
                  style={{ marginTop: "6px", position: "static", fontSize: "12px", lineHeight: "1.2" }}
                >
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
        form="reportTemplatesForm"
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

