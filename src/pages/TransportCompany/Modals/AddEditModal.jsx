import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import CustomModal from '../../../components/CustomModal';
import useTransportCompanyReducer from '../../../store/TransportCompanyReducer';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';

export const COMPANY_TYPE = {
  SEDRES: 1,
  THIRD_PARTY: 2,
};

export function TransportCompanyModal({ showModal, closeModal, onSuccess }) {
  const transportCompanyId = showModal?.transport_company_id;
  const isEdit = !!transportCompanyId;

  const { addTransportCompany, updateTransportCompany, getTransportCompanyById, isBeingUpdated } =
    useTransportCompanyReducer((state) => state);

  const [loadError, setLoadError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      transport_company: '',
      company_type: COMPANY_TYPE.SEDRES,
    },
  });

  useEffect(() => {
    if (!showModal || !transportCompanyId) {
      setLoadError('');
      return;
    }

    if (showModal.transport_company !== undefined && showModal.transport_company !== null) {
      reset({
        transport_company: showModal.transport_company ?? '',
        company_type:
          showModal.company_type === COMPANY_TYPE.THIRD_PARTY
            ? COMPANY_TYPE.THIRD_PARTY
            : COMPANY_TYPE.SEDRES,
      });
    }

    let cancelled = false;
    setLoadError('');

    (async () => {
      try {
        const row = await getTransportCompanyById(transportCompanyId);
        if (cancelled || !row) return;
        reset({
          transport_company: row.transport_company ?? '',
          company_type:
            row.company_type === COMPANY_TYPE.THIRD_PARTY ? COMPANY_TYPE.THIRD_PARTY : COMPANY_TYPE.SEDRES,
        });
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.response?.data?.message ?? e?.message ?? 'Failed to load company');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showModal, transportCompanyId, getTransportCompanyById, reset]);

  useEffect(() => {
    if (showModal && !transportCompanyId) {
      reset({
        transport_company: '',
        company_type: COMPANY_TYPE.SEDRES,
      });
    }
  }, [showModal, transportCompanyId, reset]);

  const onSubmit = async (data) => {
    const company_type = Number(data.company_type);
    const payload = {
      transport_company: data.transport_company?.trim() ?? '',
      company_type,
    };
    const cb = () => {
      closeModal();
      onSuccess?.();
    };
    if (isEdit) {
      await updateTransportCompany({
        formData: { transport_company_id: transportCompanyId, ...payload },
        cb,
      });
    } else {
      await addTransportCompany({ formData: payload, cb });
    }
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">{isEdit ? 'Edit Transport Company' : 'Add Transport Company'}</h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="transportCompanyForm" onSubmit={handleSubmit(onSubmit)}>
          {loadError && <div className="alert alert-danger mb-3">{loadError}</div>}

          <div className="mb-lg-3 mb-sm-0">
            <div className="form-floating desig-inp">
              <input
                type="text"
                className={`form-control ${errors.transport_company ? 'is-invalid' : ''}`}
                placeholder=" "
                {...register('transport_company', { required: 'Company name is required' })}
              />
              <label>
                Transport company <span className="text-danger">*</span>
              </label>
              {errors.transport_company && (
                <span className="error text-danger">{errors.transport_company.message}</span>
              )}
            </div>
          </div>

          <div className="mb-lg-3 mb-sm-0">
            <label className="form-label d-block mb-2">Company type</label>
            <div className="d-flex flex-wrap gap-3">
              <label className="d-flex align-items-center gap-2 mb-0">
                <input
                  type="radio"
                  value={COMPANY_TYPE.SEDRES}
                  {...register('company_type', { valueAsNumber: true })}
                />
                Sedres
              </label>
              <label className="d-flex align-items-center gap-2 mb-0">
                <input
                  type="radio"
                  value={COMPANY_TYPE.THIRD_PARTY}
                  {...register('company_type', { valueAsNumber: true })}
                />
                Third Party
              </label>
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
      <button
        type="submit"
        form="transportCompanyForm"
        className="btn btn-primary"
        disabled={isBeingUpdated}
      >
        {isBeingUpdated ? 'Saving...' : 'Save'}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="fade role-modal-sm modal show"
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
