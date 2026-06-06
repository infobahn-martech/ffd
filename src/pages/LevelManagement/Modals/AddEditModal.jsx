import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FiUpload } from 'react-icons/fi';
import CustomModal from '../../../components/CustomModal';
import useLevelManagementReducer from '../../../store/LevelManagementReducer';
import '../../../design/scss/pages/kpi-dashboard/components/LevelManagement.scss';

export function LevelManagementModal({ showModal, closeModal, onSuccess }) {
  const isEdit = showModal && typeof showModal === 'object' && showModal.level_id;
  const levelId = isEdit ? showModal.level_id : null;

  const { addLevel, updateLevel, isBeingUpdated } = useLevelManagementReducer((state) => state);

  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    control,
  } = useForm({
    defaultValues: {
      level_name: '',
      min_points: '',
      max_points: '',
      badge_icon: null,
    },
  });

  const badgeIcon = useWatch({ control, name: 'badge_icon' });

  useEffect(() => {
    if (isEdit) {
      reset({
        level_name: showModal?.level_name ?? '',
        min_points: showModal?.min_points ?? '',
        max_points: showModal?.max_points ?? '',
        badge_icon: null,
      });
      setPreviewUrl(showModal?.badge_icon_url ?? null);
    } else {
      reset({
        level_name: '',
        min_points: '',
        max_points: '',
        badge_icon: null,
      });
      setPreviewUrl(null);
    }
  }, [showModal, isEdit, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (file) => {
    if (!file) return;
    setValue('badge_icon', file, { shouldValidate: true });
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target?.files?.[0];
    handleFileSelect(file);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setValue('badge_icon', null, { shouldValidate: true });
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(isEdit ? showModal?.badge_icon_url ?? null : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data) => {
    if (!isEdit && !data.badge_icon) {
      setError('badge_icon', { type: 'manual', message: 'Badge icon is required' });
      return;
    }

    const formData = new FormData();
    formData.append('level_name', data.level_name?.trim() ?? '');
    formData.append('min_points', Number(data.min_points));
    formData.append('max_points', Number(data.max_points));

    if (data.badge_icon) {
      formData.append('badge_icon', data.badge_icon);
    }

    const cb = () => {
      closeModal();
      onSuccess?.();
    };

    if (isEdit) {
      formData.append('level_id', levelId);
      await updateLevel({ formData, cb });
    } else {
      await addLevel({ formData, cb });
    }
  };

  const renderHeader = () => (
    <h1 className="modal-title">
      {isEdit ? 'Edit KPI Level' : 'Add KPI Level'}
    </h1>
  );

  const renderBody = () => (
    <div className="modal-body">
      <form id="levelManagementForm" onSubmit={handleSubmit(onSubmit)}>
        <div className="level-mgmt-modal__field">
          <label className="level-mgmt-modal__label">
            Level Name <span className="required">*</span>
          </label>
          <input
            className={`level-mgmt-modal__input ${errors.level_name ? 'is-invalid' : ''}`}
            placeholder="Enter level name"
            {...register('level_name', { required: 'Level name is required' })}
          />
          {errors.level_name && (
            <span className="level-mgmt-modal__error">{errors.level_name.message}</span>
          )}
        </div>

        <div className="level-mgmt-modal__field">
          <label className="level-mgmt-modal__label">
            Min Points <span className="required">*</span>
          </label>
          <input
            type="number"
            min={0}
            className={`level-mgmt-modal__input ${errors.min_points ? 'is-invalid' : ''}`}
            placeholder="Enter minimum points"
            {...register('min_points', {
              required: 'Min points is required',
              valueAsNumber: true,
              validate: (val) => !Number.isNaN(val) || 'Min points must be a number',
            })}
          />
          {errors.min_points && (
            <span className="level-mgmt-modal__error">{errors.min_points.message}</span>
          )}
        </div>

        <div className="level-mgmt-modal__field">
          <label className="level-mgmt-modal__label">
            Max Points <span className="required">*</span>
          </label>
          <input
            type="number"
            min={0}
            className={`level-mgmt-modal__input ${errors.max_points ? 'is-invalid' : ''}`}
            placeholder="Enter maximum points"
            {...register('max_points', {
              required: 'Max points is required',
              valueAsNumber: true,
              validate: (val, formValues) => {
                if (Number.isNaN(val)) return 'Max points must be a number';
                if (val <= formValues.min_points) {
                  return 'Max points must be greater than min points';
                }
                return true;
              },
            })}
          />
          {errors.max_points && (
            <span className="level-mgmt-modal__error">{errors.max_points.message}</span>
          )}
        </div>

        <div className="level-mgmt-modal__field">
          <label className="level-mgmt-modal__label">
            Badge Icon {!isEdit && <span className="required">*</span>}
            {isEdit && <span style={{ fontWeight: 400, opacity: 0.6 }}> (optional)</span>}
          </label>
          <div
            className={`level-mgmt-modal__file-upload ${isDragging ? 'level-mgmt-modal__file-upload--dragging' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
          >
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {previewUrl ? (
              <div className="level-mgmt-modal__file-preview">
                <img src={previewUrl} alt="Badge preview" className="level-mgmt-modal__file-icon" />
                {badgeIcon && (
                  <span className="level-mgmt-modal__file-name">{badgeIcon.name}</span>
                )}
                <button type="button" className="level-mgmt-modal__file-clear" onClick={clearFile}>
                  Remove
                </button>
              </div>
            ) : (
              <div className="level-mgmt-modal__file-preview">
                <FiUpload size={28} color="rgba(255,255,255,0.5)" />
                <span className="level-mgmt-modal__file-text">
                  Click or drag & drop badge icon image
                </span>
              </div>
            )}
          </div>
          {errors.badge_icon && (
            <span className="level-mgmt-modal__error">{errors.badge_icon.message}</span>
          )}
        </div>
      </form>
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button
        type="button"
        className="level-mgmt-modal__btn level-mgmt-modal__btn--cancel"
        onClick={closeModal}
        disabled={isBeingUpdated}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="levelManagementForm"
        className="level-mgmt-modal__btn level-mgmt-modal__btn--save"
        disabled={isBeingUpdated}
      >
        {isBeingUpdated ? 'Saving...' : isEdit ? 'Update' : 'Add Level'}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="level-mgmt-modal"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
