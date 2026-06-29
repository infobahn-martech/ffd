import { useForm, Controller } from 'react-hook-form';
import { useEffect, useMemo, useRef } from 'react';
import Quill from 'quill';
import QuillTableBetter from 'quill-table-better';
import 'quill/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';
import CustomModal from '../../../components/CustomModal';
import PremiumSelect from '../../../components/form/PremiumSelect';
import useCGPassTemplateReducer from '../../../store/CGPassTemplateReducer';
import usePortReducer from '../../../store/PortReducer';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';
import '../../../design/scss/pages/cg-pass-template/modals/AddEditCGPassTemplate.scss';

// Register once at module level using the same Quill instance that quill-table-better uses
if (!Quill.__tableBetterRegistered) {
  Quill.register({ 'modules/table-better': QuillTableBetter }, true);
  QuillTableBetter.register();
  Quill.__tableBetterRegistered = true;
}

const isHtmlEmpty = (value) => {
  if (!value) return true;
  return value.replace(/<(.|\\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
};

// ---------------------------------------------------------------------------
// QuillEditor — mounts a real Quill v2 instance onto a bare div ref.
// Accepts value (HTML string) and calls onChange(html) on every text-change.
// ---------------------------------------------------------------------------
function QuillEditor({ value, onChange, placeholder }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  // Track the last value we pushed into the editor so we don't loop
  const lastHtmlRef = useRef('');

  // Mount Quill once
  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      placeholder: placeholder || '',
      modules: {
        table: false,
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ direction: 'rtl' }],
          ['link', 'table-better'],
          ['clean'],
        ],
        'table-better': {
          language: 'en_US',
          menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'delete'],
          toolbarTable: true,
        },
        keyboard: {
          bindings: QuillTableBetter.keyboardBindings,
        },
      },
    });

    quillRef.current = quill;

    // Default direction / align for RTL content
    quill.format('direction', 'rtl');
    quill.format('align', 'right');

    // Patch getSelection so it never returns null when called with force=true.
    // This prevents insertTable from silently aborting inside a Bootstrap modal
    // where root.focus() can briefly reset savedRange to null.
    const origGetSel = quill.getSelection.bind(quill);
    quill.getSelection = function (force) {
      const range = origGetSel(force);
      return range !== null ? range : (force ? { index: 0, length: 0 } : null);
    };

    // Listen for text changes and bubble HTML up to react-hook-form
    quill.on(Quill.events.TEXT_CHANGE, () => {
      const html = quill.root.innerHTML;
      lastHtmlRef.current = html;
      onChange(html);
    });

    return () => {
      // Destroy the Quill instance on unmount
      quill.off(Quill.events.TEXT_CHANGE);
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes into the editor (e.g. form reset)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;
    const incoming = value || '';
    if (incoming === lastHtmlRef.current) return;
    lastHtmlRef.current = incoming;
    const delta = quill.clipboard.convert({ html: incoming });
    quill.setContents(delta, Quill.sources.SILENT);
  }, [value]);

  return (
    <div className="react-quill-wrapper" dir="rtl">
      <div ref={containerRef} />
    </div>
  );
}

export function AddEditCGPassTemplateModal({ showModal, closeModal, onSuccess }) {
  const templateId = showModal?.pass_vesselreg_template_id;
  const isEdit = !!templateId;

  const { createTemplate, updateTemplate, isBeingUpdated } = useCGPassTemplateReducer((s) => s);
  const { ports, getPorts } = usePortReducer((s) => s);

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

  const onSubmit = (data) => {
    const payload = {
      port_id: data.port_id ? Number(data.port_id) : null,
      template_name: data.template_name?.trim() ?? '',
      template_type: 'CG Pass',
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
    <h1 className="modal-title">{isEdit ? 'Edit CG Pass Template' : 'Add CG Pass Template'}</h1>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="cgPassTemplateForm" onSubmit={handleSubmit(onSubmit)}>

          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              <div className="col-lg-6 col-sm-12">
                <div className="desig-inp">
                  <label className="mb-2 d-block">
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

              <div className="col-lg-6 col-sm-12">
                <div className="desig-inp">
                  <label className="mb-2 d-block">
                    Template Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.template_name ? 'field-error' : ''}`}
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
            <div className="permInputs row">
              <div className="col-12">
                <div className="desig-inp">
                  <label className="mb-2 d-block">Description</label>
                  <textarea
                    className="form-control"
                    placeholder=""
                    rows={3}
                    dir="rtl"
                    {...register('description')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-lg-3 mb-sm-0">
            <div className="permInputs row">
              <div className="col-12">
                <div className="desig-inp">
                  <label className="mb-2 d-block">
                    Content <span className="text-danger">*</span>
                  </label>
                  <Controller
                    name="content"
                    control={control}
                    rules={{
                      required: 'Content is required',
                      validate: (v) => !isHtmlEmpty(v) || 'Content is required',
                    }}
                    render={({ field }) => (
                      <QuillEditor
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Enter content..."
                      />
                    )}
                  />
                  {errors.content && (
                    <span className="error text-danger">
                      {errors.content.message}
                    </span>
                  )}
                </div>
              </div>
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
        form="cgPassTemplateForm"
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
