import { useForm, Controller } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import { PORT_OPTIONS } from "../../../constants/ports";
import { CALL_TYPE_OPTIONS } from "../../../constants/callTypes";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export function PreArrivalInformationModal({ showModal, closeModal }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: showModal?._id
      ? {
        port: showModal?.port,
        callType: showModal?.callType,
        subject: showModal?.subject || "",
        body: showModal?.body || ""
      }
      : {
        port: "",
        callType: "",
        subject: "",
        body: ""
      }
  });

  const onSubmit = (data) => {
    console.log("PRE-ARRIVAL INFORMATION FORM SUBMITTED:", data);
    closeModal();
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
        {showModal?._id ? "Edit Pre-Arrival Information" : "Add Pre-Arrival Information"}
      </h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="preArrivalInformationForm" onSubmit={handleSubmit(onSubmit)}>

          {/* ROW 1 — Port + Call Type */}
          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              {/* PORT */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.port ? "is-invalid" : ""}`}
                    {...register("port", { required: "Port is required" })}
                  >
                    <option value="">Select Port</option>
                    {PORT_OPTIONS.map((port) => (
                      <option key={port} value={port}>
                        {port}
                      </option>
                    ))}
                  </select>
                  <label>
                    Port <span className="text-danger">*</span>
                  </label>
                  {errors.port && (
                    <span className="error text-danger">{errors.port.message}</span>
                  )}
                </div>
              </div>

              {/* CALL TYPE */}
              <div className="col-lg-6 col-sm-12">
                <div className="form-floating desig-inp">
                  <select
                    className={`form-control ${errors.callType ? "is-invalid" : ""}`}
                    {...register("callType", { required: "Call Type is required" })}
                  >
                    <option value="">Select Call Type</option>
                    {CALL_TYPE_OPTIONS.map((callType) => (
                      <option key={callType} value={callType}>
                        {callType}
                      </option>
                    ))}
                  </select>
                  <label>
                    Call Type <span className="text-danger">*</span>
                  </label>
                  {errors.callType && (
                    <span className="error text-danger">{errors.callType.message}</span>
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
      <button type="button" className="btn btn-outline" onClick={closeModal}>
        Close
      </button>
      <button type="submit" form="preArrivalInformationForm" className="btn btn-primary">
        Save
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

