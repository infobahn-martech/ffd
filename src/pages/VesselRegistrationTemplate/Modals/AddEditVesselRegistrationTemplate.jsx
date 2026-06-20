import { useForm, Controller } from 'react-hook-form';
import { useEffect, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomModal from '../../../components/CustomModal';
import PremiumSelect from '../../../components/form/PremiumSelect';
import useVesselRegistrationTemplateReducer from '../../../store/VesselRegistrationTemplateReducer';
import usePortReducer from '../../../store/PortReducer';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';

const isHtmlEmpty = (value) => {
  if (!value) return true;
  return value.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
};

export function AddEditVesselRegistrationTemplateModal({ showModal, closeModal, onSuccess }) {
  const templateId = showModal?.template_id;
  const isEdit = !!templateId;

  const { createTemplate, updateTemplate, isBeingUpdated } = useVesselRegistrationTemplateReducer((s) => s);
  const { ports, getPorts } = usePortReducer((s) => s);

  const quillRef = useRef(null);

  const defaultValues = useMemo(
    () =>
      isEdit && showModal
        ? {
            port_id: String(showModal?.port_id ?? ''),
            template_name: showModal?.template_name ?? '',
            description: showModal?.description ?? '',
            content: showModal?.more_description ?? '',
          }
        : { port_id: '', template_name: '', description: '', content: '' },
    [isEdit, showModal]
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    getPorts({ params: { limit: 1000 } });
  }, []);

  useEffect(() => {
    reset(defaultValues);
  }, [showModal, reset]);

  const handleInsertTable = () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection(true);
    const pos = range ? range.index : quill.getLength();
    const html = `<table border="1" cellpadding="6" style="border-collapse:collapse;width:100%"><thead><tr><th style="border:1px solid #ccc">Header 1</th><th style="border:1px solid #ccc">Header 2</th><th style="border:1px solid #ccc">Header 3</th></tr></thead><tbody><tr><td style="border:1px solid #ccc">&nbsp;</td><td style="border:1px solid #ccc">&nbsp;</td><td style="border:1px solid #ccc">&nbsp;</td></tr><tr><td style="border:1px solid #ccc">&nbsp;</td><td style="border:1px solid #ccc">&nbsp;</td><td style="border:1px solid #ccc">&nbsp;</td></tr></tbody></table>`;
    if (typeof quill.clipboard?.dangerouslyPasteHTML === 'function') {
      quill.clipboard.dangerouslyPasteHTML(pos, html);
    } else {
      const delta = quill.clipboard.convert({ html });
      quill.updateContents(delta, 'user');
    }
  };

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ direction: 'rtl' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'align', 'direction', 'link',
  ];

  const onSubmit = (data) => {
    const payload = {
      port_id: data.port_id ? Number(data.port_id) : null,
      template_name: data.template_name?.trim() ?? '',
      template_type: 'Vessel Registration',
      description: data.description ?? '',
      more_description: data.content ?? '',
    };

    const cb = () => {
      onSuccess?.();
      closeModal();
    };

    if (isEdit) {
      updateTemplate({ formData: { ...payload, template_id: Number(templateId) }, cb });
    } else {
      createTemplate({ formData: payload, cb });
    }
  };

  const renderHeader = () => (
    <h1 className="modal-title">
      {isEdit ? 'Edit Vessel Registration Template' : 'Add Vessel Registration Template'}
    </h1>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="vesselRegistrationTemplateForm" onSubmit={handleSubmit(onSubmit)}>

          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row g-3">
              <div className="col-lg-6 col-md-6 col-sm-12">
                <div className="phone-wrapper">
                  <label className="phone-label">
                    Port <span className="text-danger">*</span>
                  </label>
                  <Controller
                    name="port_id"
                    control={control}
                    rules={{ required: 'Port is required' }}
                    render={({ field }) => (
                      <PremiumSelect
                        value={field.value != null ? String(field.value) : ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={(ports ?? []).map((p) => {
                          const id = p?.port_id ?? p?._id ?? p?.id;
                          return {
                            value: String(id ?? ''),
                            label: String(p?.port ?? p?.name ?? p?.port_name ?? id ?? ''),
                          };
                        })}
                        placeholder="Select Port"
                        searchPlaceholder="Search port..."
                        hasError={Boolean(errors.port_id)}
                      />
                    )}
                  />
                  {errors.port_id && (
                    <span className="error text-danger">{errors.port_id.message}</span>
                  )}
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-sm-12">
                <div className="phone-wrapper">
                  <label className="phone-label">
                    Template Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.template_name ? 'is-invalid' : ''}`}
                    placeholder="Enter template name"
                    dir="auto"
                    {...register('template_name', { required: 'Template name is required' })}
                  />
                  {errors.template_name && (
                    <span className="error text-danger">{errors.template_name.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <label className="report-template-label">
                Description
              </label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter description..."
                dir="auto"
                {...register('description')}
              />
            </div>
          </div>

          <div className="mb-lg-3 mb-sm-0">
            <div className="desig-inp">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="report-template-label mb-0">
                  Content <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleInsertTable}
                >
                  Insert Table
                </button>
              </div>
              <Controller
                name="content"
                control={control}
                rules={{
                  required: 'Content is required',
                  validate: (v) => !isHtmlEmpty(v) || 'Content is required',
                }}
                render={({ field }) => (
                  <div className="react-quill-wrapper">
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={field.value || ''}
                      onChange={field.onChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Enter content..."
                    />
                  </div>
                )}
              />
              {errors.content && (
                <span className="error text-danger d-block mt-1 small">
                  {errors.content.message}
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
      <button
        type="button"
        className="btn btn-outline"
        onClick={closeModal}
        disabled={isBeingUpdated}
      >
        Close
      </button>
      <button
        type="submit"
        form="vesselRegistrationTemplateForm"
        className="btn btn-primary"
        disabled={isBeingUpdated}
      >
        {isBeingUpdated ? 'Saving...' : 'Save'}
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
