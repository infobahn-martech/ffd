import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import CheckListService from '../services/checklistService';
import { downloadFile } from '../utils/utils';

const useCheckListReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    CheckLists: null,
    checklistCount: 0,
    addEditLoader: false,
    deleteLoader: false,
    CheckListsExcelUrl: null,
    isLoadingExcel: false,
    createChecklist: async ({ formData, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await CheckListService.createChecklist(formData);
            set({
                successMessage: data.message,
                addEditLoader: false,
                checklistCount: data?.totalCount ?? 0,
            });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong creating checklist',
                addEditLoader: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getChecklists: async ({ params }) => {
        try {
            set({ isLoading: true });
            const hasTypeFilter =
                params?.call_type_id != null ||
                params?.vessel_type_id != null ||
                params?.barge_type_id != null;
            const service = hasTypeFilter ? CheckListService.getChecklistByType : CheckListService.getChecklist;
            const { data } = await service(params);
            const total =
                data?.pagination?.total ?? data?.totalCount ?? 0;
            set({
                CheckLists: data?.data ?? [],
                isLoading: false,
                checklistCount: total,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false });
        }
    },
    getChecklistById: async ({ checklist_type_id, cb }) => {
        try {
            const { data } = await CheckListService.getChecklistById(checklist_type_id);
            cb?.(data);
        } catch (err) {
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err?.message ?? 'Failed to fetch checklist');
        }
    },
    editChecklist: async ({ id, formData, cb }) => {
        try {
            set({ addEditLoader: true });
            const hasChecklistTypeId = formData instanceof FormData
                ? false
                : formData?.checklist_type_id != null && formData?.checklist_type_id !== '';
            const payload = formData instanceof FormData
                ? formData
                : hasChecklistTypeId
                    ? formData
                    : { ...formData, ...(id != null ? { _id: id } : {}) };
            const { data } = await CheckListService.updateChecklist(payload);
            set({ successMessage: data.message, addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong editing the Checklist',
                addEditLoader: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteChecklist: async ({ checklist_type_id, cb }) => {
        try {
            set({ deleteLoader: true });
            const { data } = await CheckListService.deleteChecklist(checklist_type_id);
            set({ successMessage: data.message, deleteLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the Checklist',
                deleteLoader: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getChecklistsExcel: async ({ params }) => {
        try {
            set({ isLoadingExcel: true });
            const { data } = await CheckListService.getChecklist(params);
            set({
                CheckListsExcelUrl: data?.url,
                isLoadingExcel: false,
            });
            downloadFile({ link: data?.url, fileName: 'checklists' });
        } catch (error) {
            set({ errorMessage: error.message, isLoadingExcel: false });
        }
    },
}));

export default useCheckListReducer;
