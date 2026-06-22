import { useForm, Controller } from 'react-hook-form';
import { useEffect, useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CustomModal from '../../../components/CustomModal';
import PremiumSelect from '../../../components/form/PremiumSelect';
import useVesselRegistrationTemplateReducer from '../../../store/VesselRegistrationTemplateReducer';
import usePortReducer from '../../../store/PortReducer';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';

const Icons = Quill.import('ui/icons');
Icons['table'] =
  '<svg viewBox="0 0 18 18"><rect class="ql-stroke" height="12" width="12" x="3" y="3"/><line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"/><line class="ql-stroke" x1="9" x2="9" y1="3" y2="15"/></svg>';

const BlockEmbed = Quill.import('blots/block/embed');

class TableEmbed extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const rows = value?.rows ?? 3;
    const cols = value?.cols ?? 3;

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    for (let r = 0; r < rows; r++) {
      const tr = document.createElement('tr');
      for (let c = 0; c < cols; c++) {
        const td = document.createElement('td');
        td.setAttribute('contenteditable', 'true');
        td.setAttribute('dir', 'rtl');
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    node.appendChild(table);

    node.addEventListener('mousedown', (e) => e.stopPropagation());
    node.addEventListener('keydown', (e) => {
      const cell = e.target.closest('td');
      if (!cell) return;
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (cell.textContent.replace(/[\s ]/g, '').length === 0) {
          e.preventDefault();
        } else {
          e.stopPropagation();
        }
      } else {
        e.stopPropagation();
      }
    });

    return node;
  }

  static value(node) {
    const trs = node.querySelectorAll('tr');
    const tds = trs[0]?.querySelectorAll('td');
    return { rows: trs.length || 3, cols: tds?.length || 3 };
  }
}

TableEmbed.blotName = 'table-embed';
TableEmbed.tagName = 'div';
TableEmbed.className = 'ql-table-embed';

Quill.register(TableEmbed);

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
    if (quill) {
      quill.format('direction', 'rtl');
      quill.format('align', 'right');
    }
  }, [showModal]);

  useEffect(() => {
    reset(defaultValues);
  }, [showModal, reset]);

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          [{ align: [] }],
          [{ direction: 'rtl' }],
          ['link', 'table'],
          ['clean'],
        ],
        handlers: {
          table: function () {
            const quill = this.quill;
            quill.focus();
            const range = quill.getSelection();
            const index = range ? range.index : quill.getLength();
            quill.insertEmbed(index, 'table-embed', { rows: 3, cols: 3 }, 'user');
            quill.setSelection(index + 1, 0, 'user');
          },
        },
      },
    }),
    []
  );

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'align', 'direction', 'link',
    'table-embed',
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
            <div className="permInputs row">
              <div className="col-lg-6 col-sm-12">
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

              <div className="col-lg-6 col-sm-12">
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
            <div className="permInputs row">
              <div className="col-12">
                <div className="form-floating desig-inp">
                  <textarea
                    className="form-control"
                    placeholder="Description"
                    rows={3}
                    dir="rtl"
                    {...register('description')}
                  />
                  <label>Description</label>
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
