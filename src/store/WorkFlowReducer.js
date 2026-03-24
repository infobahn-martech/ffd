import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import workflowService from '../services/workflowService';
import { transformApiWorkflowToInternal } from '../pages/EditWorkflows/workflow.utils';

const useWorkFlowReducer = create((set) => ({
    isLoading: false,
    addEditLoader: false,
    errorMessage: '',
    workflows: null,

    getWorkflowByBoard: async ({ boardId }) => {
        try {
            set({ isLoading: true });
            const { data } = await workflowService.getWorkflowByBoard(boardId);
            const transformed = transformApiWorkflowToInternal(data);
            set({
                workflows: transformed ? [transformed] : null,
                isLoading: false,
            });
        } catch (err) {
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                isLoading: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
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
