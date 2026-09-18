import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import kpiService from '../services/kpiService';
import kpiDashboardService from '../services/kpiDashboardService';

const normalizeAssignedTask = (task) => ({
  ...task,
  task_name: task?.task_name ?? task?.name ?? '',
  status_label: task?.status_label ?? task?.status ?? task?.task_status ?? '',
  status_color: task?.status_color ?? task?.statusColor ?? task?.color ?? '',
  start_time: task?.start_time ?? task?.startTime ?? null,
  completed_time: task?.completed_time ?? task?.completedTime ?? null,
  delay_text: task?.delay_text ?? task?.delayText ?? '',
});

const normalizeTaskHistoryItem = (task) => ({
  ...task,
  id: task?.user_kpi_id ?? task?.id,
  name: task?.task_name ?? task?.name ?? '',
  estimatedTime: task?.estimated_time ?? '',
  timeSpent: task?.time_spent ?? '',
  remainingTime: task?.remaining_time ?? '',
  status: task?.status_label ?? task?.status ?? '',
  statusColor: task?.status_color ?? '',
  totalPoints: Number(task?.total_points) || 0,
  earnedPoints: Number(task?.earned_points) || 0,
  balancePoints: Number(task?.balance_points) || 0,
});

const initialTaskHistoryPagination = {
  total: 0,
  page: 1,
  limit: 10,
  total_pages: 0,
};

const normalizeLeaderboardItem = (member) => ({
  ...member,
  id: member?.user_id ?? member?.id,
  name: member?.name ?? '',
  levelId: member?.level_id ?? null,
  levelName: member?.level_name ?? null,
  points: Number(member?.total_points) || 0,
  rank: member?.rank ?? 0,
  avatarUrl: member?.avatar_url ?? null,
  badgeIconUrl: member?.badge_icon_url ?? null,
  completion: Number(member?.level_completion) || 0,
});

const initialLeaderboardPagination = {
  total: 0,
  page: 1,
  limit: 20,
  total_pages: 0,
};

const initialDashboardData = {
  user: null,
  total_points: 0,
  points_last_24h: 0,
  completed_tasks: 0,
  pending_tasks: 0,
  current_level: null,
  badge_icon_url: null,
  last_level_up: null,
  next_level: null,
  points_to_next_level: null,
};

const useKPIDashboardReducer = create((set) => ({
  isLoading: false,
  isLoadingTasks: false,
  isLoadingTaskHistory: false,
  isLoadingLeaderboard: false,
  errorMessage: '',
  tasksErrorMessage: '',
  taskHistoryErrorMessage: '',
  leaderboardErrorMessage: '',
  dashboardData: initialDashboardData,
  assignedTasks: [],
  taskHistory: [],
  taskHistoryPagination: initialTaskHistoryPagination,
  leaderboard: [],
  leaderboardPagination: initialLeaderboardPagination,

  fetchUserKpiDashboard: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoading: true, errorMessage: '' });
      const { data } = await kpiDashboardService.getUserKpiDashboard(userId);
      const dashboardData = data?.data ?? initialDashboardData;

      set({
        dashboardData: {
          ...initialDashboardData,
          ...dashboardData,
        },
        isLoading: false,
      });
    } catch (err) {
      set({
        dashboardData: initialDashboardData,
        errorMessage: err?.message ?? 'Failed to load KPI dashboard',
        isLoading: false,
      });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to load KPI dashboard');
    }
  },

  fetchUserAssignedTasks: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoadingTasks: true, tasksErrorMessage: '' });
      const { data } = await kpiService.getUserAssignedTasks(userId);
      const assignedTasks = Array.isArray(data?.data)
        ? data.data.map(normalizeAssignedTask)
        : [];

      set({ assignedTasks, isLoadingTasks: false });
    } catch (err) {
      set({
        assignedTasks: [],
        tasksErrorMessage: err?.message ?? 'Failed to load assigned tasks',
        isLoadingTasks: false,
      });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to load assigned tasks');
    }
  },

  fetchUserTaskHistory: async (userId, params = {}) => {
    if (!userId) return;

    try {
      set({ isLoadingTaskHistory: true, taskHistoryErrorMessage: '' });
      const { data } = await kpiDashboardService.getUserTaskHistory(userId, params);
      const taskHistory = Array.isArray(data?.data)
        ? data.data.map(normalizeTaskHistoryItem)
        : [];

      set({
        taskHistory,
        taskHistoryPagination: {
          ...initialTaskHistoryPagination,
          ...(data?.pagination ?? {}),
        },
        isLoadingTaskHistory: false,
      });
    } catch (err) {
      set({
        taskHistory: [],
        taskHistoryPagination: initialTaskHistoryPagination,
        taskHistoryErrorMessage: err?.message ?? 'Failed to load task history',
        isLoadingTaskHistory: false,
      });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to load task history');
    }
  },

  fetchLeaderboard: async (params = {}) => {
    try {
      set({ isLoadingLeaderboard: true, leaderboardErrorMessage: '' });
      const { data } = await kpiDashboardService.getLeaderboard(params);
      const leaderboard = Array.isArray(data?.data)
        ? data.data.map(normalizeLeaderboardItem)
        : [];

      set({
        leaderboard,
        leaderboardPagination: {
          ...initialLeaderboardPagination,
          ...(data?.pagination ?? {}),
        },
        isLoadingLeaderboard: false,
      });
    } catch (err) {
      set({
        leaderboard: [],
        leaderboardPagination: initialLeaderboardPagination,
        leaderboardErrorMessage: err?.message ?? 'Failed to load leaderboard',
        isLoadingLeaderboard: false,
      });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to load leaderboard');
    }
  },

  resetDashboard: () => {
    set({
      dashboardData: initialDashboardData,
      assignedTasks: [],
      taskHistory: [],
      taskHistoryPagination: initialTaskHistoryPagination,
      leaderboard: [],
      leaderboardPagination: initialLeaderboardPagination,
      errorMessage: '',
      tasksErrorMessage: '',
      taskHistoryErrorMessage: '',
      leaderboardErrorMessage: '',
      isLoading: false,
      isLoadingTasks: false,
      isLoadingTaskHistory: false,
      isLoadingLeaderboard: false,
    });
  },
}));

export default useKPIDashboardReducer;
