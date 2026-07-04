import { create } from 'zustand';
import billingEntityService from '../services/billingEntityService';
import customerPricingInfobhanService from '../services/customerPricingInfobhanService';
import useAlertReducer from './AlertReducer';

const useCustomerPricingInfobhanReducer = create((set) => ({
  isLoading: false,
  customerPriceList: [],
  totalCount: 0,

  isLoadingServiceCodes: false,
  serviceCodes: [],

  isSaving: false,
  isLoadingPricingDetail: false,
  isUpdating: false,

  getAllServiceCodes: async () => {
    try {
      set({ isLoadingServiceCodes: true });
      const { data } = await customerPricingInfobhanService.getAllServiceCodes();
      const raw = data?.data ?? data ?? [];
      const list = Array.isArray(raw) ? raw : [];
      set({ serviceCodes: list, isLoadingServiceCodes: false });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ isLoadingServiceCodes: false, serviceCodes: [] });
      showError(
        error?.response?.data?.message ??
          error?.message ??
          'Failed to fetch service codes'
      );
    }
  },

  savePricing: async ({ payload, cb }) => {
    try {
      set({ isSaving: true });
      const { data } = await customerPricingInfobhanService.savePricing(payload);
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Customer pricing saved successfully');
      set({ isSaving: false });
      cb && cb();
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ isSaving: false });
      showError(
        error?.response?.data?.message ??
          error?.message ??
          'Failed to save customer pricing'
      );
    }
  },

  getPricingDetail: async ({ tariffId, cb }) => {
    try {
      set({ isLoadingPricingDetail: true });
      const { data } = await customerPricingInfobhanService.getPricingByTariffId(tariffId);
      const detail = data?.data ?? data ?? null;
      set({ isLoadingPricingDetail: false });
      cb && cb(detail);
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ isLoadingPricingDetail: false });
      showError(
        error?.response?.data?.message ??
          error?.message ??
          'Failed to fetch pricing details'
      );
    }
  },

  updatePricing: async ({ payload, cb }) => {
    try {
      set({ isUpdating: true });
      const { data } = await customerPricingInfobhanService.updatePricing(payload);
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Customer pricing updated successfully');
      set({ isUpdating: false });
      cb && cb();
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ isUpdating: false });
      showError(
        error?.response?.data?.message ??
          error?.message ??
          'Failed to update customer pricing'
      );
    }
  },

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
      const total = list.length;
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

export default useCustomerPricingInfobhanReducer;
