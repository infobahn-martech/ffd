import { create } from 'zustand';
import billingEntityService from '../services/billingEntityService';
import useAlertReducer from './AlertReducer';

const useCustomerPricingReducer = create((set) => ({
  isLoading: false,
  customerPriceList: [],
  totalCount: 0,

  getCustomerPriceList: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await billingEntityService.getCustomerPriceList({ params });
      const raw = data?.data ?? data ?? [];
      const list = (Array.isArray(raw) ? raw : []).map((row) => ({
        ...row,
        _id: row._id ?? row.id,
        customerName: row.customer_name ?? row.customerName ?? '',
        portName: row.port_name ?? row.portName ?? row.port ?? '',
        billingEntity: row.billing_entity ?? row.billingEntity ?? row.billing_entity_name ?? '',
        currency: row.currency ?? '',
        createdAt: row.created_at ?? row.createdAt,
        updatedAt: row.updated_at ?? row.updatedAt,
      }));
      const total =
        data?.pagination?.total ??
        data?.totalCount ??
        data?.total ??
        list.length ??
        0;
      set({
        customerPriceList: list,
        totalCount: total,
        isLoading: false,
      });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ isLoading: false, customerPriceList: [], totalCount: 0 });
      showError(
        error?.response?.data?.message ??
          error?.message ??
          'Failed to fetch customer price list'
      );
    }
  },
}));

export default useCustomerPricingReducer;
