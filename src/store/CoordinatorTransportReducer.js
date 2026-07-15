import { create } from 'zustand';
import callFileService from '../services/callFileService';
import transportContentService from '../services/transportContentService';
import transportCompanyService from '../services/transportCompanyService';
import vehicleService from '../services/vehicleService';

const extractListEnvelope = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const useCoordinatorTransportReducer = create((set) => ({
  callDetails: null,
  loadingCallDetails: false,
  transportRequests: [],
  loadingTransportRequests: false,
  transportCompanies: [],
  loadingCompanies: false,
  vehicleTypes: [],
  loadingVehicleTypes: false,
  inhouseDrivers: [],
  loadingInhouseDrivers: false,
  isSavingTransport: false,

  fetchCallDetails: async (callId) => {
    if (!callId) {
      set({ callDetails: null });
      return;
    }
    try {
      set({ loadingCallDetails: true });
      const { data } = await callFileService.getCallDetail(callId);
      set({ callDetails: data?.data || null, loadingCallDetails: false });
    } catch {
      set({ callDetails: null, loadingCallDetails: false });
    }
  },

  fetchTransportRequests: async (callId) => {
    if (!callId) {
      set({ transportRequests: [], loadingTransportRequests: false });
      return;
    }
    set({ loadingTransportRequests: true });
    try {
      const response = await transportContentService.getTransportRequest(callId);
      set({ transportRequests: extractListEnvelope(response), loadingTransportRequests: false });
    } catch {
      set({ transportRequests: [], loadingTransportRequests: false });
    }
  },

  fetchTransportCompanies: async () => {
    set({ loadingCompanies: true });
    try {
      const response = await transportCompanyService.getTransportCompanyData();
      set({ transportCompanies: extractListEnvelope(response), loadingCompanies: false });
    } catch {
      set({ transportCompanies: [], loadingCompanies: false });
    }
  },

  fetchVehicleTypes: async () => {
    set({ loadingVehicleTypes: true });
    try {
      const response = await vehicleService.getAllTransportVehicles();
      set({ vehicleTypes: extractListEnvelope(response), loadingVehicleTypes: false });
    } catch {
      set({ vehicleTypes: [], loadingVehicleTypes: false });
    }
  },

  fetchInhouseDrivers: async (vehicleTypeId) => {
    if (!vehicleTypeId) {
      set({ inhouseDrivers: [] });
      return;
    }
    set({ loadingInhouseDrivers: true });
    try {
      const response = await vehicleService.getDriversByVehicleType(vehicleTypeId);
      set({ inhouseDrivers: extractListEnvelope(response), loadingInhouseDrivers: false });
    } catch {
      set({ inhouseDrivers: [], loadingInhouseDrivers: false });
    }
  },

  fetchTransportRequestBasicDetail: async (transportRequestId) => {
    if (!transportRequestId) return null;
    try {
      const response = await transportContentService.getTransportRequestBasicDetail(transportRequestId);
      return response?.data?.data ?? response?.data ?? null;
    } catch {
      return null;
    }
  },

  createTransportRequest: async (formData) => {
    set({ isSavingTransport: true });
    try {
      const response = await transportContentService.createTransportRequest(formData);
      set({ isSavingTransport: false });
      return response;
    } catch (err) {
      set({ isSavingTransport: false });
      throw err;
    }
  },
}));

export default useCoordinatorTransportReducer;
