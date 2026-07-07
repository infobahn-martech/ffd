import { create } from 'zustand';
import businessRuleService from '../services/businessRuleService';

const useBusinessRuleReducer = create((set) => ({
    isLoadingGet: false,
    triggerTypes: [],

    getTriggerTypes: async ({ params } = {}) => {
        try {
            set({ isLoadingGet: true });
            const { data } = await businessRuleService.getTriggerTypes({ params });
            set({
                triggerTypes: data?.data ?? [],
                isLoadingGet: false,
            });
        } catch (err) {
            set({ triggerTypes: [], isLoadingGet: false });
        }
    },

    isLoadingFields: false,
    fields: [],

    getFields: async ({ params } = {}) => {
        try {
            set({ isLoadingFields: true });
            const { data } = await businessRuleService.getFields({ params });
            set({
                fields: data?.data ?? [],
                isLoadingFields: false,
            });
        } catch (err) {
            set({ fields: [], isLoadingFields: false });
        }
    },

    isLoadingTimeUnits: false,
    timeUnits: [],

    getTimeUnits: async ({ params } = {}) => {
        try {
            set({ isLoadingTimeUnits: true });
            const { data } = await businessRuleService.getTimeUnits({ params });
            set({
                timeUnits: data?.data ?? [],
                isLoadingTimeUnits: false,
            });
        } catch (err) {
            set({ timeUnits: [], isLoadingTimeUnits: false });
        }
    },

    isLoadingCustomFields: false,
    customFields: [],

    getCustomFields: async ({ params } = {}) => {
        try {
            set({ isLoadingCustomFields: true });
            const { data } = await businessRuleService.getCustomFields({ params });
            set({
                customFields: data?.data ?? [],
                isLoadingCustomFields: false,
            });
        } catch (err) {
            set({ customFields: [], isLoadingCustomFields: false });
        }
    },

    isLoadingRegularFields: false,
    regularFields: [],

    getRegularFields: async ({ params } = {}) => {
        try {
            set({ isLoadingRegularFields: true });
            const { data } = await businessRuleService.getRegularFields({ params });
            set({
                regularFields: data?.data ?? [],
                isLoadingRegularFields: false,
            });
        } catch (err) {
            set({ regularFields: [], isLoadingRegularFields: false });
        }
    },

    isLoadingBusinessRules: false,
    businessRules: [],
    businessRulesCount: 0,

    getBusinessRules: async ({ params } = {}) => {
        try {
            set({ isLoadingBusinessRules: true });
            const { data } = await businessRuleService.getBusinessRules({ params });
            set({
                businessRules: data?.data ?? [],
                businessRulesCount: data?.count ?? data?.total ?? 0,
                isLoadingBusinessRules: false,
            });
        } catch (err) {
            set({ businessRules: [], businessRulesCount: 0, isLoadingBusinessRules: false });
        }
    },

    isLoadingTriggerConfig: false,
    triggerConfig: null,

    getTriggerConfig: async (triggerTypeId) => {
        try {
            set({ isLoadingTriggerConfig: true });
            const { data } = await businessRuleService.getTriggerConfig(triggerTypeId);
            set({
                triggerConfig: data?.data ?? null,
                isLoadingTriggerConfig: false,
            });
        } catch (err) {
            set({ triggerConfig: null, isLoadingTriggerConfig: false });
        }
    },

    isLoadingFieldDetails: {},
    fieldDetailsByKey: {},

    getFieldDetails: async (fieldType, fieldId) => {
        const key = `${fieldType}-${fieldId}`;
        try {
            set((state) => ({ isLoadingFieldDetails: { ...state.isLoadingFieldDetails, [key]: true } }));
            const { data } = await businessRuleService.getFieldDetails(fieldType, fieldId);
            set((state) => ({
                fieldDetailsByKey: { ...state.fieldDetailsByKey, [key]: data?.data ?? null },
                isLoadingFieldDetails: { ...state.isLoadingFieldDetails, [key]: false },
            }));
        } catch (err) {
            set((state) => ({
                fieldDetailsByKey: { ...state.fieldDetailsByKey, [key]: null },
                isLoadingFieldDetails: { ...state.isLoadingFieldDetails, [key]: false },
            }));
        }
    },

    isLoadingBusinessRuleStats: false,
    businessRuleStats: { available: 0, created: 0, enabled: 0, visible: 0 },

    getBusinessRuleStats: async () => {
        try {
            set({ isLoadingBusinessRuleStats: true });
            const { data } = await businessRuleService.getBusinessRuleStats();
            set({
                businessRuleStats: {
                    available: data?.data?.available ?? 0,
                    created: data?.data?.created ?? 0,
                    enabled: data?.data?.enabled ?? 0,
                    visible: data?.data?.visible ?? 0,
                },
                isLoadingBusinessRuleStats: false,
            });
        } catch (err) {
            set({ businessRuleStats: { available: 0, created: 0, enabled: 0, visible: 0 }, isLoadingBusinessRuleStats: false });
        }
    },
}));

export default useBusinessRuleReducer;
