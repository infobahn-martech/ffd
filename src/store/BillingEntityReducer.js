import { create } from 'zustand';
import billingEntityService from '../services/billingEntityService';
import useAlertReducer from './AlertReducer';

const useBillingEntityReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  billingEntities: null,
  totalCount: null,
  selectedBillingEntity: null,
  isLoadingEntityDetail: false,

  getBillingEntities: async ({ params } = {}) => {
    try {
      set({ isLoading: true });
      const { data } = await billingEntityService.getBillingEntities({ params });
      const raw = data?.data ?? data ?? [];
      const list = (Array.isArray(raw) ? raw : []).map((row) => ({
        ...row,
        _id: row._id ?? row.entity_id ?? row.id,
        entity_id: row.entity_id ?? row.id,
        customer_code: row.customer_code ?? '',
        billing_entity: row.billing_entity ?? '',
        phone_number: row.phone_number ?? '',
        contact_name: row.contact_name ?? '',
        entity_logo: row.entity_logo ?? '',
        credit_limit: row.credit_limit ?? row.creditLimit ?? null,
      }));
      const total =
        data?.pagination?.total ?? data?.totalCount ?? data?.total ?? list?.length ?? 0;
      set({ billingEntities: list, totalCount: total, isLoading: false });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ errorMessage: error?.message, isLoading: false });
      showError(
        error?.response?.data?.message ?? error?.message ?? 'Failed to fetch billing entities'
      );
    }
  },

  getEntityDetailById: async ({ entityId, cb }) => {
    try {
      set({ isLoadingEntityDetail: true });
      const { data } = await billingEntityService.getEntityDetailById(entityId);
      const entity = data?.data ?? null;
      set({ selectedBillingEntity: entity, isLoadingEntityDetail: false });
      cb && cb(entity);
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ isLoadingEntityDetail: false });
      showError(
        error?.response?.data?.message ?? error?.message ?? 'Failed to fetch billing entity details'
      );
    }
  },
}));

export default useBillingEntityReducer;
