import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import workflowService from '../services/workflowService';
import { normalizeWorkflowData } from '../pages/EditWorkflows/workflow.utils';

const useWorkFlowReducer = create((set) => ({
    isLoading: false,
    addEditLoader: false,
    errorMessage: '',
    workflows: null,

    getWorkflowByBoard: async ({ boardId }) => {
        try {
            set({ isLoading: true });
            const { data } = await workflowService.getWorkflowByBoard(boardId);
            const transformed = normalizeWorkflowData(data);
            set({
                workflows: transformed,
                isLoading: false,
            });
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                isLoading: false,
                workflows: [],
            });
            // List load failures are surfaced on Edit Workflows (empty state), not as a toast.
        }
    },

    renameWorkflow: async ({ workflow_id, workflow_name, cb }) => {
        try {
            set({ addEditLoader: true });
            const payload = {
                workflow_id,
                workflow_name,
            };
            const { data } = await workflowService.renameWorkflow(workflow_id, payload);
            set({
                addEditLoader: false,
            });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    deleteWorkflow: async ({ workflow_id, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await workflowService.deleteWorkflow(workflow_id);
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    disableWorkflow: async ({ workflow_id, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await workflowService.disableWorkflow(workflow_id);
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb(data);
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    createWorkflow: async ({ board_id, workflow_name, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await workflowService.createWorkflow({ board_id, workflow_name });
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    createSwimlane: async ({ workflow_id, swimlane_name, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await workflowService.createSwimlane({ workflow_id, swimlane_name });
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    getSwimlaneByWorkflow: async ({ workflow_id }) => {
        try {
            const { data } = await workflowService.getSwimlaneByWorkflow(workflow_id);
            return data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
            throw err;
        }
    },

    renameSwimlane: async ({ swimlane_id, swimlane_name, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await workflowService.renameSwimlane({ swimlane_id, swimlane_name });
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    deleteSwimlane: async ({ swimlane_id, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await workflowService.deleteSwimlane({ swimlane_id });
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    createWorkflowColumn: async ({ body, cb }) => {
        try {
            set({ addEditLoader: true });
            const { data } = await workflowService.createWorkflowColumn(body);
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },

    renameWorkflowColumn: async ({ column_id, column_name, cb }) => {
        try {
            set({ addEditLoader: true });
            const payload = { column_id, column_name };
            const { data } = await workflowService.renameWorkflowColumn(column_id, payload);
            set({ addEditLoader: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                addEditLoader: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useWorkFlowReducer;
