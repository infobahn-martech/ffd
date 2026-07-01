import { useForm, Controller } from 'react-hook-form';
import { useEffect, useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import QuillTableBetter from 'quill-table-better';
import 'react-quill/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';
import CustomModal from '../../../components/CustomModal';
import PremiumSelect from '../../../components/form/PremiumSelect';
import useVesselRegistrationTemplateReducer from '../../../store/VesselRegistrationTemplateReducer';
import usePortReducer from '../../../store/PortReducer';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';
import '../../../design/scss/pages/vessel-registration-template/modals/AddEditVesselRegistrationTemplate.scss';

Quill.register({ 'modules/table-better': QuillTableBetter }, true);
QuillTableBetter.register();

const Icons = Quill.import('ui/icons');
Icons['table-better'] = `<svg viewBox="0 0 18 18"><rect class="ql-stroke" height="12" width="12" x="3" y="3"/><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"/><line class="ql-stroke" x1="9" x2="9" y1="3" y2="15"/></svg>`;

const isHtmlEmpty = (value) => {
  if (!value) return true;
  return value.replace(/<(.|\n)*?>/g, '').replace(/&nbsp;/g, ' ').trim().length === 0;
};

export function AddEditVesselRegistrationTemplateModal({ showModal, closeModal, onSuccess }) {
  const templateId = showModal?.pass_vesselreg_template_id;
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
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    quill.format('direction', 'rtl');
    quill.format('align', 'right');

    const toolbarContainer = quill.getModule('toolbar')?.container;
    const tableBtn = toolbarContainer?.querySelector('button.ql-table-better');
    if (tableBtn && !tableBtn._focusHandlerAdded) {
      tableBtn.addEventListener('mousedown', (e) => e.preventDefault());
      tableBtn.addEventListener('click', () => {
        setTimeout(() => {
          const picker = document.querySelector('.ql-table-select-container');
          if (picker && !picker._nofocusAdded) {
            picker.addEventListener('mousedown', (e) => e.preventDefault(), true);
            picker._nofocusAdded = true;
          }
        }, 0);
      });
      tableBtn._focusHandlerAdded = true;
    }

    // insertTable calls getSelection(true) and aborts if it returns null.
    // Bootstrap focus on the modal causes this: root.focus() fires selectionchange
    // → update() reads null (no cursor yet) → savedRange = null → setRange(null)
    // → root.blur() → getSelection returns null → silent abort.
    //
    // Two-layer fix:
    // 1. setSelection before origInsert plants a native DOM selection so the
    //    selectionchange fired by root.focus() reads a valid position.
    // 2. getSelection override is the hard guarantee — even if layer 1 races,
    //    getSelection(true) can never return null.
    if (!quill._getSelectionPatched) {
      const origGetSel = quill.getSelection.bind(quill);
      quill.getSelection = function (force) {
        const range = origGetSel(force);
        return range !== null ? range : (force ? { index: 0, length: 0 } : null);
      };
      quill._getSelectionPatched = true;
    }

    const tableBetter = quill.getModule('table-better');
    if (tableBetter && !tableBetter._selectionPatched) {
      const origInsert = tableBetter.insertTable.bind(tableBetter);
      tableBetter.insertTable = function (rows, cols) {
        const idx = quill.selection?.savedRange?.index ?? 0;
        quill.setSelection(idx, 0, 'silent');
        return origInsert(rows, cols);
      };
      tableBetter._selectionPatched = true;
    }
  }, [showModal]);

  useEffect(() => {
    reset(defaultValues);
  }, [showModal, reset]);

  const quillModules = useMemo(
    () => ({
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
    }),
    []
  );

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
                    className="form-control"
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
                      <div className="react-quill-wrapper" dir="rtl">
                        <ReactQuill
                          ref={quillRef}
                          theme="snow"
                          value={field.value || ''}
                          onChange={field.onChange}
                          modules={quillModules}
                          placeholder="Enter content..."
                        />
                      </div>
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
