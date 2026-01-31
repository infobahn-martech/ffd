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
    CheckListsExcelUrl: null,
    isLoadingExcel: false,
    createChecklist: async ({ formData, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await CheckListService.postChecklist(formData);
            set({
                successMessage: data.message,
                addEditLoader: false,
                checklistCount: data.totalCount,
            });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong fetching checklist',
                addEditLoader: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getChecklists: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await CheckListService.getChecklist(params);
            set({
                CheckLists: data?.data ?? [],
                isLoading: false,
                checklistCount: data?.totalCount ?? 0,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false });
        }
    },
    editChecklist: async ({ id, formData, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await CheckListService.editChecklist(id, formData);
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
    deleteChecklist: async ({ id, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await CheckListService.deleteChecklist(id);
            set({ successMessage: data.message, addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the Checklist',
                addEditLoader: false,
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
