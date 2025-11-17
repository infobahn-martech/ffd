/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import Select from 'react-select';
import CustomModal from './CustomModal';
import '../design/scss/prospect-modal.scss';
import '../design/scss/modal-designs.scss';
import '../design/scss/form-designs.scss';

const RenderModalHeader = ({ ModalHeading }) => {
  return (
    <h5 className="modal-title" id="createLeadModalLabel">
      {ModalHeading}
    </h5>
  );
};

const RenderModalFooter = ({
  closeModal,
  handleSubmit,
  isLoading,
  profileClassName,
  editData,
}) => {
  return (
    <div className={`${profileClassName ? 'profile-btn' : ''} two-btn `}>
      <button
        type="button"
        onClick={closeModal}
        className="btn-common close"
        data-bs-dismiss="modal"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="save btn-common green-btn"
        data-bs-dismiss="modal"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : editData ? (
          'Update'
        ) : (
          'Save'
        )}
      </button>
    </div>
  );
};

const RenderModalBody = ({
  editData,
  closeModal,
  formConfig,
  handlePatch,
  isLoading,
  handlePost,
  groupInputBy,
  profileClassName,
  workerClassName,
}) => {
  const Fields = {};
  formConfig.forEach(({ key }) => {
    Fields[key] = { value: editData?.[key] || '', error: '' };
  });

  const [Data, setData] = useState(Fields);

  useEffect(() => {
    setData(Fields);
  }, [editData]);

  const validate = ({ field, handleValidation, label }) => {
    let isErrorOccurred = false;
    const currentDetails = { ...Data };
    const valueValidation =
      handleValidation && handleValidation(currentDetails[field]?.value, label);
    if (valueValidation) {
      currentDetails[field].error = valueValidation;
      isErrorOccurred = true;
    } else {
      currentDetails[field].error = '';
    }
    setData(currentDetails);
    return isErrorOccurred;
  };

  const handleClick = () => {
    let isErrorOccurred;
    formConfig?.forEach(({ key, handleValidation, label }) => {
      if (
        handleValidation &&
        validate({ field: key, handleValidation, label })
      ) {
        isErrorOccurred = validate({ field: key, handleValidation, label });
      }
    });
    if (isErrorOccurred) return;
    let newData = {};
    Object.keys(Data)?.map((Key) => {
      newData = { ...newData, [Key]: Data[Key]?.value };
      return newData;
    });
    if (editData) {
      handlePatch({ id: editData?._id, value: newData });
    } else {
      handlePost({ value: newData });
    }
  };

  const handleChange = ({ value, key, handleValidation, label }) => {
    const currentData = { ...Data };
    currentData[key].value = value;
    currentData[key].error = '';
    const isErrorOccurred = validate({ field: key, handleValidation, label });
    if (isErrorOccurred) return;
    setData(currentData);
  };

  const arrayOfArrays = [];

  for (let i = 0; i < formConfig.length; i += groupInputBy) {
    arrayOfArrays.push(formConfig.slice(i, i + groupInputBy));
  }
  return (
    <div className="modal-body">
      <div className="lead-form">
        <form>
          {arrayOfArrays?.map((fieldArray) => (
            <div className="mb-lg-3 mb-sm-0">
              <div className="permInputs row ">
                {fieldArray?.map(
                  ({
                    key,
                    label,
                    options,
                    handleValidation,
                    isDisabledOnEdit,
                    hideRequireSymbol,
                    type,
                    ...rest
                  }) => (
                    <>
                      <div
                        className={
                          profileClassName || workerClassName
                            ? 'col'
                            : 'col-lg-6 col-sm-12'
                        }
                      >
                        <div
                          className={`${options ? 'form-control form-select react-select-container' : 'form-floating desig-inp'} ${isDisabledOnEdit ? 'field-disabled' : ''}`}
                        >
                          {options && (
                            <Select
                              value={
                                Data[key]?.value && {
                                  ...Data[key],
                                  label: options?.find(
                                    (e) => e?.value === Data[key]?.value,
                                  )?.label,
                                }
                              }
                              placeholder={`Select ${label}`}
                              classNamePrefix="react-select"
                              onChange={({ value }) =>
                                handleChange({
                                  value,
                                  key,
                                  handleValidation,
                                  label,
                                })
                              }
                              disabled={editData && isDisabledOnEdit}
                              options={options}
                              {...rest}
                            />
                          )}
                          {!options && (
                            <input
                              type={type || 'text'}
                              className="form-control"
                              id="floatingName"
                              placeholder="Ronald"
                              onChange={({ target: { value } }) =>
                                handleChange({
                                  value,
                                  key,
                                  handleValidation,
                                  label,
                                })
                              }
                              value={
                                type === 'number'
                                  ? parseInt(Data[key]?.value, 10)
                                  : Data[key]?.value
                              }
                              disabled={editData && isDisabledOnEdit}
                              {...rest}
                            />
                          )}
                          <label
                            htmlFor="floatingInput"
                            className={`${options && 'text-capitalize select-label'}`}
                          >
                            {label}
                            {!hideRequireSymbol && (
                              <span className="text-danger">*</span>
                            )}
                          </label>

                          {Data?.[key]?.error && (
                            <span className="error-txt form-error">
                              {Data?.[key]?.error}
                            </span>
                          )}
                        </div>
                      </div>
                      {fieldArray?.length < groupInputBy &&
                        Array.from({
                          length: groupInputBy - fieldArray.length,
                        }).map(() => <div className="col" />)}
                    </>
                  ),
                )}
              </div>
            </div>
          ))}
        </form>
        <RenderModalFooter
          closeModal={closeModal}
          handleSubmit={handleClick}
          isLoading={isLoading}
          profileClassName={profileClassName}
          editData={editData}
        />
      </div>
    </div>
  );
};

const AddEditModal = ({
  closeModal,
  show,
  formConfig,
  editData,
  handlePatch,
  handlePost,
  ModalHeading,
  isLoading,
  needModal = true,
  groupInputBy = 2,
  profileClassName,
  className,
  workerClassName,
}) => {
  return needModal ? (
    <CustomModal
      className={className}
      show={show}
      closeModal={closeModal}
      header={<RenderModalHeader ModalHeading={ModalHeading} />}
      body={
        <RenderModalBody
          workerClassName={workerClassName}
          formConfig={formConfig}
          editData={editData}
          handlePost={handlePost}
          handlePatch={handlePatch}
          closeModal={closeModal}
          isLoading={isLoading}
          groupInputBy={groupInputBy}
          profileClassName={profileClassName}
        />
      }
    />
  ) : (
    <>
      <RenderModalHeader ModalHeading={ModalHeading} />
      <RenderModalBody
        formConfig={formConfig}
        editData={editData}
        handlePost={handlePost}
        handlePatch={handlePatch}
        closeModal={closeModal}
        isLoading={isLoading}
        groupInputBy={groupInputBy}
        profileClassName={profileClassName}
      />
    </>
  );
};

export default AddEditModal;
