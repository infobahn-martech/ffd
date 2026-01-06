import { useForm, useFieldArray } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function GroupEmailBEModal({ showModal, closeModal }) {
    const {
        control,
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: showModal?._id
            ? {
                groupEmailName: showModal?.name || "",
                groupEmailCode: showModal?.code || "",
                description: showModal?.description || "",
                emails:
                    showModal?.emails?.length > 0
                        ? showModal.emails.map((e) => ({ value: e }))
                        : [{ value: "" }],
                isActive: showModal?.isActive ?? true
            }
            : {
                groupEmailName: "",
                groupEmailCode: "",
                description: "",
                emails: [{ value: "" }],
                isActive: true
            }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "emails"
    });

    const onSubmit = (data) => {
        const payload = {
            ...data,
            emails: data.emails.map((e) => e.value?.trim()).filter(Boolean)
        };
        console.log("GROUP EMAIL FORM SUBMITTED:", payload);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Group Email" : "Add Group Email"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="groupEmailForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* GROUP NAME + GROUP CODE */}
                    <div className="row">
                        {/* GROUP NAME */}
                        <div className="col-lg-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.groupEmailName ? "is-invalid" : ""
                                        }`}
                                    placeholder="Group Name"
                                    {...register("groupEmailName", {
                                        required: "Group name is required"
                                    })}
                                />
                                <label>
                                    Group Name <span className="text-danger">*</span>
                                </label>
                                {errors.groupEmailName && (
                                    <span className="error text-danger">
                                        {errors.groupEmailName.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* GROUP CODE */}
                        <div className="col-lg-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.groupEmailCode ? "is-invalid" : ""
                                        }`}
                                    placeholder="Group Code"
                                    {...register("groupEmailCode", {
                                        required: "Group code is required"
                                    })}
                                />
                                <label>
                                    Group Code <span className="text-danger">*</span>
                                </label>
                                {errors.groupEmailCode && (
                                    <span className="error text-danger">
                                        {errors.groupEmailCode.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* EMAIL LIST */}
                    <div className="mt-3">
                        <div className="modal-section-title mb-2">Emails</div>

                        {fields.map((field, index) => (
                            <div className="row align-items-center mb-2" key={field.id}>
                                <div className="col-10">
                                    <div className="form-floating desig-inp">
                                        <input
                                            className={`form-control ${errors.emails?.[index]?.value ? "is-invalid" : ""
                                                }`}
                                            placeholder="email@company.com"
                                            {...register(`emails.${index}.value`, {
                                                required: "Email is required",
                                                pattern: {
                                                    value:
                                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: "Invalid email format"
                                                }
                                            })}
                                        />
                                        <label>Email</label>
                                        {errors.emails?.[index]?.value && (
                                            <span className="error text-danger">
                                                {errors.emails[index].value.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="col-2 d-flex justify-content-end">
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-link text-danger p-0"
                                            onClick={() => remove(index)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            className="btn btn-link p-0 mt-1"
                            onClick={() => append({ value: "" })}
                        >
                            + Add Email
                        </button>
                    </div>

                    {/* ACTIVE FLAG */}
                    <div className="row mb-lg-3 mb-sm-0 mt-3">
                        <div className="col-lg-6 d-flex align-items-center">
                            <div className="form-check mt-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="isActive"
                                    {...register("isActive")}
                                />
                                <label className="form-check-label" htmlFor="isActive">
                                    Active
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* DESCRIPTION — FULL ROW TEXTAREA */}
                    <div className="mb-lg-3 mb-sm-0 mt-2">
                        <label className="form-label mb-2">Description</label>
                        <textarea
                            className="form-control"
                            placeholder="Description"
                            rows={4}
                            {...register("description")}
                        ></textarea>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="modal-footer">
            <button
                type="button"
                className="btn btn-outline"
                onClick={() => closeModal(null)}
            >
                Close
            </button>
            <button
                type="submit"
                form="groupEmailForm"
                className="btn btn-primary"
            >
                Save
            </button>
        </div>
    );

    return (
        <CustomModal
            className="role-modal-sm"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
