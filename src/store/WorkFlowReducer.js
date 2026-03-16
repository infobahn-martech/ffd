import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import workflowService from '../services/workflowService';

const useWorkFlowReducer = create((set) => ({
  isLoading: false,
  addEditLoader: false,
  errorMessage: '',
  workflows: null,

  getWorkflowByBoard: async ({ boardId }) => {
    try {
      set({ isLoading: true });
      const { data } = await workflowService.getWorkflowByBoard(boardId);
      // For now we only log the response and keep UI static
      // eslint-disable-next-line no-console
      console.log('get_workflow_by_board response:', data);
      set({
        workflows: data?.data ?? null,
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
}));

export default useWorkFlowReducer;
