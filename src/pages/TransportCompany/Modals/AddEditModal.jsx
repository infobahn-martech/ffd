import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import CustomModal from '../../../components/CustomModal';
import useTransportCompanyReducer from '../../../store/TransportCompanyReducer';
import useVehicleReducer from '../../../store/VehicleReducer';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';

const emptyDriver = () => ({
  transport_driver_id: '',
  driver_name: '',
  contact_no: '',
  vehicle_type_id: '',
});

const mapDriversFromApi = (list) => {
  const rows = Array.isArray(list) ? list : [];
  if (rows.length === 0) return [emptyDriver()];
  return rows.map((d) => ({
    transport_driver_id: d.transport_driver_id != null ? String(d.transport_driver_id) : '',
    driver_name: d.driver_name ?? '',
    contact_no: d.contact_no ?? '',
    vehicle_type_id: d.vehicle_type_id != null ? String(d.vehicle_type_id) : '',
  }));
};

export function TransportCompanyModal({ showModal, closeModal, onSuccess }) {
  const transportCompanyId = showModal?.transport_company_id ?? showModal?._id;
  const isEdit = !!transportCompanyId;

  const { addTransportCompany, updateTransportCompany, getTransportCompanyById, isBeingUpdated } =
    useTransportCompanyReducer((state) => state);

  const { vehicles = [], getVehicles } = useVehicleReducer((state) => state);

  const [loadError, setLoadError] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      transport_company: '',
      drivers: [emptyDriver()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'drivers',
  });

  useEffect(() => {
    if (showModal) {
      getVehicles?.({ params: {} });
    }
  }, [showModal, getVehicles]);

  useEffect(() => {
    if (showModal && !transportCompanyId) {
      setLoadError('');
      reset({
        transport_company: '',
        drivers: [emptyDriver()],
      });
    }
  }, [showModal, transportCompanyId, reset]);

  useEffect(() => {
    if (!showModal || !transportCompanyId) {
      setLoadError('');
      return;
    }

    let cancelled = false;
    setLoadError('');
    setIsLoadingDetail(true);

    (async () => {
      try {
        const row = await getTransportCompanyById(transportCompanyId);
        if (cancelled || !row) return;
        reset({
          transport_company: String(row.transport_company ?? ''),
          drivers: mapDriversFromApi(row.drivers),
        });
      } catch (e) {
        if (!cancelled) {
          setLoadError(e?.response?.data?.message ?? e?.message ?? 'Failed to load company');
        }
      } finally {
        if (!cancelled) setIsLoadingDetail(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [showModal, transportCompanyId, getTransportCompanyById, reset]);

  const onSubmit = async (data) => {
    const driversPayload = (data.drivers ?? []).map((d) => {
      const entry = {
        driver_name: d.driver_name?.trim() ?? '',
        contact_no: d.contact_no?.trim() ?? '',
        vehicle_type_id: Number(d.vehicle_type_id),
      };
      const existingId = d.transport_driver_id?.toString().trim();
      if (isEdit && existingId) {
        return { transport_driver_id: Number(existingId), ...entry };
      }
      return entry;
    });

    const payload = {
      transport_company: data.transport_company?.trim() ?? '',
      drivers: driversPayload,
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
        {isEdit && isLoadingDetail && (
          <div className="text-center py-4 text-muted">Loading...</div>
        )}
        <form
          id="transportCompanyForm"
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: isEdit && isLoadingDetail ? 'none' : undefined }}
        >
          {loadError && <div className="alert alert-danger mb-3">{loadError}</div>}

          <div className="mb-lg-3 mb-sm-0">
            <div className="form-floating desig-inp">
              <input
                type="text"
                className={`form-control ${errors.transport_company ? 'is-invalid' : ''}`}
                placeholder=" "
                disabled={isEdit && isLoadingDetail}
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

          <div className="mt-3">
            <label className="form-label mb-2 d-block">
              Drivers <span className="text-danger">*</span>
            </label>
            {fields.map((field, index) => {
              const isLast = index === fields.length - 1;
              return (
                <div className="row align-items-end g-2 mb-2" key={field.id}>
                  <input type="hidden" {...register(`drivers.${index}.transport_driver_id`)} />
                  <div className="col-12 col-md-4">
                    <div className="form-floating desig-inp">
                      <input
                        type="text"
                        className={`form-control ${errors.drivers?.[index]?.driver_name ? 'is-invalid' : ''}`}
                        placeholder=" "
                        disabled={isEdit && isLoadingDetail}
                        {...register(`drivers.${index}.driver_name`, {
                          required: 'Driver name is required',
                        })}
                      />
                      <label>
                        Driver name <span className="text-danger">*</span>
                      </label>
                      {errors.drivers?.[index]?.driver_name && (
                        <span className="error text-danger d-block small">
                          {errors.drivers[index].driver_name.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="form-floating desig-inp">
                      <input
                        type="text"
                        className={`form-control ${errors.drivers?.[index]?.contact_no ? 'is-invalid' : ''}`}
                        placeholder=" "
                        disabled={isEdit && isLoadingDetail}
                        {...register(`drivers.${index}.contact_no`, {
                          required: 'Contact number is required',
                        })}
                      />
                      <label>
                        Contact no <span className="text-danger">*</span>
                      </label>
                      {errors.drivers?.[index]?.contact_no && (
                        <span className="error text-danger d-block small">
                          {errors.drivers[index].contact_no.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12 col-md-3">
                    <div className="form-floating desig-inp">
                      <select
                        className={`form-control form-select ${errors.drivers?.[index]?.vehicle_type_id ? 'is-invalid' : ''}`}
                        disabled={isEdit && isLoadingDetail}
                        {...register(`drivers.${index}.vehicle_type_id`, {
                          required: 'Vehicle type is required',
                        })}
                      >
                        <option value="">Select vehicle type</option>
                        {(vehicles || []).map((v) => (
                          <option key={v.vehicle_type_id ?? v._id} value={v.vehicle_type_id ?? v._id}>
                            {v.vehicle_type ?? v.name ?? `Vehicle ${v.vehicle_type_id ?? v._id}`}
                          </option>
                        ))}
                      </select>
                      <label>
                        Vehicle type <span className="text-danger">*</span>
                      </label>
                      {errors.drivers?.[index]?.vehicle_type_id && (
                        <span className="error text-danger d-block small">
                          {errors.drivers[index].vehicle_type_id.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-12 col-md-2 d-flex align-items-center justify-content-end gap-1 pb-1">
                    {isLast ? (
                      <>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-circle p-2 d-inline-flex align-items-center justify-content-center"
                            onClick={() => remove(index)}
                            title="Remove driver"
                          >
                            <FiX size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary rounded-circle p-2 d-inline-flex align-items-center justify-content-center"
                          onClick={() => append(emptyDriver())}
                          title="Add driver"
                        >
                          <FiPlus size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-circle p-2 d-inline-flex align-items-center justify-content-center"
                        onClick={() => remove(index)}
                        title="Remove driver"
                      >
                        <FiX size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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
        disabled={isBeingUpdated || (isEdit && isLoadingDetail)}
      >
        Close
      </button>
      <button
        type="submit"
        form="transportCompanyForm"
        className="btn btn-primary"
        disabled={isBeingUpdated || (isEdit && isLoadingDetail)}
      >
        {isBeingUpdated ? 'Saving...' : 'Save'}
      </button>
    </div>
  );

  return (
    <CustomModal
      className="fade role-modal-sm modal show"
      dialgName="modal-dialog modal-dialog-centered modal-lg"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
