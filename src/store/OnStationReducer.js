import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import onStationService from "../services/onStationService";

const getRowId = (row) => row?.call_id ?? row?._id;

const patchRow = (list, callId, patch) =>
  list.map((row) => (getRowId(row) === callId ? { ...row, ...patch } : row));

const setRowActionLoading = (state, callId, action, value) => ({
  rowActionLoading: {
    ...state.rowActionLoading,
    [callId]: {
      ...state.rowActionLoading[callId],
      [action]: value,
    },
  },
});

const useOnStationReducer = create((set, get) => ({
  list: [],
  total: 0,
  isLoadingList: false,
  rowActionLoading: {},
  onStationId: null,
  salesOrderId: null,
  salesOrderNo: null,
  taxInvoiceId: null,
  taxInvoiceNo: null,
  errorMessage: "",

  getOnStationList: async (params) => {
    try {
      set({ isLoadingList: true });
      const { data } = await onStationService.getOnStationList({ params });
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.list)
          ? data.list
          : [];
      set({
        list,
        total: data?.total ?? data?.pagination?.total ?? data?.meta?.total ?? list.length,
        isLoadingList: false,
      });
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        isLoadingList: false,
        list: [],
        total: 0,
        errorMessage: err?.response?.data?.message ?? err.message,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  toggleOnStation: async ({ call_id, is_enabled }) => {
    if (get().rowActionLoading[call_id]?.toggle) return;
    try {
      set((state) => setRowActionLoading(state, call_id, "toggle", true));
      const { data } = await onStationService.toggleOnStation({ call_id, is_enabled });
      const onStationId = data?.on_station_id ?? data?.data?.on_station_id ?? null;
      set((state) => ({
        list: patchRow(state.list, call_id, { is_enabled, on_station_id: onStationId }),
        onStationId,
        ...setRowActionLoading(state, call_id, "toggle", false),
      }));
      useAlertReducer.getState().success(data?.message ?? "On Station updated successfully");
    } catch (err) {
      set((state) => setRowActionLoading(state, call_id, "toggle", false));
      useAlertReducer.getState().error(err?.response?.data?.message ?? err.message);
    }
  },

  createSalesOrder: async ({ call_id, on_station_id }) => {
    if (get().rowActionLoading[call_id]?.createSalesOrder) return;
    try {
      set((state) => setRowActionLoading(state, call_id, "createSalesOrder", true));
      const { data } = await onStationService.createSalesOrder({ on_station_id });
      const salesOrderId = data?.sales_order_id ?? data?.data?.sales_order_id ?? null;
      const salesOrderNo = data?.sales_order_no ?? data?.data?.sales_order_no ?? null;
      set((state) => ({
        list: patchRow(state.list, call_id, {
          sales_order_id: salesOrderId,
          sales_order_no: salesOrderNo,
        }),
        salesOrderId,
        salesOrderNo,
        ...setRowActionLoading(state, call_id, "createSalesOrder", false),
      }));
      useAlertReducer.getState().success(data?.message ?? "Sales order created successfully");
    } catch (err) {
      set((state) => setRowActionLoading(state, call_id, "createSalesOrder", false));
      useAlertReducer.getState().error(err?.response?.data?.message ?? err.message);
    }
  },

  convertToTaxInvoice: async ({ call_id, sales_order_id }) => {
    if (get().rowActionLoading[call_id]?.convertTaxInvoice) return;
    try {
      set((state) => setRowActionLoading(state, call_id, "convertTaxInvoice", true));
      const { data } = await onStationService.convertToTaxInvoice({ sales_order_id });
      const taxInvoiceId = data?.tax_invoice_id ?? data?.data?.tax_invoice_id ?? null;
      const taxInvoiceNo = data?.tax_invoice_no ?? data?.data?.tax_invoice_no ?? null;
      set((state) => ({
        list: patchRow(state.list, call_id, {
          tax_invoice_id: taxInvoiceId,
          tax_invoice_no: taxInvoiceNo,
        }),
        taxInvoiceId,
        taxInvoiceNo,
        ...setRowActionLoading(state, call_id, "convertTaxInvoice", false),
      }));
      useAlertReducer.getState().success(data?.message ?? "Converted to tax invoice successfully");
    } catch (err) {
      // Backend reports "already converted" as an error but still includes the existing
      // tax_invoice_id — treat that as success instead of surfacing an error toast.
      const alreadyConvertedId =
        err?.response?.data?.tax_invoice_id ?? err?.response?.data?.data?.tax_invoice_id ?? null;

      if (alreadyConvertedId) {
        const taxInvoiceNo =
          err?.response?.data?.tax_invoice_no ?? err?.response?.data?.data?.tax_invoice_no ?? null;
        set((state) => ({
          list: patchRow(state.list, call_id, {
            tax_invoice_id: alreadyConvertedId,
            tax_invoice_no: taxInvoiceNo,
          }),
          taxInvoiceId: alreadyConvertedId,
          taxInvoiceNo,
          ...setRowActionLoading(state, call_id, "convertTaxInvoice", false),
        }));
        useAlertReducer.getState().success(err?.response?.data?.message ?? "Tax invoice already exists");
        return;
      }

      set((state) => setRowActionLoading(state, call_id, "convertTaxInvoice", false));
      useAlertReducer.getState().error(err?.response?.data?.message ?? err.message);
    }
  },

  sendTaxInvoice: async ({ call_id, tax_invoice_id }) => {
    if (get().rowActionLoading[call_id]?.sendTaxInvoice) return;
    try {
      set((state) => setRowActionLoading(state, call_id, "sendTaxInvoice", true));
      const { data } = await onStationService.sendTaxInvoice({ tax_invoice_id });
      set((state) => ({
        list: patchRow(state.list, call_id, { tax_invoice_sent: true }),
        ...setRowActionLoading(state, call_id, "sendTaxInvoice", false),
      }));
      useAlertReducer.getState().success(data?.message ?? "Tax invoice sent successfully");
    } catch (err) {
      set((state) => setRowActionLoading(state, call_id, "sendTaxInvoice", false));
      useAlertReducer.getState().error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useOnStationReducer;
