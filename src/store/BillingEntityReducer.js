import { create } from 'zustand';
import billingEntityService from '../services/billingEntityService';
import useAlertReducer from './AlertReducer';

const useBillingEntityReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  billingEntities: null,
  totalCount: null,
  addEditLoader: false,

  getBillingEntities: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await billingEntityService.getBillingEntities({ params });
      const raw = data?.data ?? data ?? [];
      const list = (Array.isArray(raw) ? raw : []).map((row) => ({
        ...row,
        _id: row._id ?? row.id,
        name: row.name,
        customerId: row.customer_id ?? row.customerId,
        vatNo: row.vat_no ?? row.vatNo,
        phoneNumber: row.phone_number ?? row.phoneNumber,
        email: row.email,
        contactPerson: row.contact_person ?? row.contactPerson,
        createdAt: row.created_at ?? row.createdAt,
        updatedAt: row.updated_at ?? row.updatedAt,
      }));
      const total =
        data?.pagination?.total ??
        data?.totalCount ??
        data?.total ??
        list?.length ??
        0;
      set({
        billingEntities: list,
        totalCount: total,
        isLoading: false,
      });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ errorMessage: error?.message, isLoading: false });
      showError(
        error?.response?.data?.message ?? error?.message ?? 'Failed to fetch billing entities'
      );
    }
  },
}));

export default useBillingEntityReducer;
