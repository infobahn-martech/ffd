import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import DefaultMenu from './components/DefaultMenu';
import BoardFilterPanel from './components/BoardFilterPanel';
import ManagersModal from './components/ManagersModal';
import DashboardsModal from './components/DashboardsModal';
import BusinessRulesModal from './components/BusinessRulesModal';
import BlockersModal from './components/BlockersModal';
import StickersModal from './components/StickersModal';
import TagsModal from './components/TagsModal';
import TypesModal from './components/TypesModal';
import AddDashboardModal from './components/AddDashboardModal';
import SelectWorkflowModal from './components/SelectWorkflowModal';
import WorkspacesSideNavPanel from './components/WorkspacesSideNavPanel';
import MyAccountsModal from '../Header/MyAccountsModal';
import '../../design/scss/common.scss';
import '../../design/scss/sidebar.scss';

// Existing icons
import dashboardIcon from '../../assets/images/icon-dashboard.svg';
import settingsIcon from '../../assets/images/icon-settings.svg';
import usersIcon from '../../assets/images/icon-users.svg';
import configIcon from '../../assets/images/icon-config.svg';
import workersIcon from '../../assets/images/icon-workers.svg';
import inspectionIcon from '../../assets/images/icon-inspection.svg';
import billingIcon from '../../assets/images/icon-billing.svg';

import { useBreakpoint } from '../../shared/hooks/useWindowSize';
import {
  buildKanbanAddCardEventDetail,
  getSwimlaneOptionsFromWorkflow,
  resolveSidebarAddCardAction,
} from '../../shared/helpers/kanbanAddWorkflowSelection';

// 🆕 Kanban sidebar icons + tooltip
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { FiPlus, FiInbox, FiFilter, FiPlusCircle, FiActivity, FiLayout, FiSettings, FiEdit3, FiLayers } from 'react-icons/fi';
import TaskCardModal from '../../pages/TaskCard';
import { useLayoutView } from '../../shared/context/LayoutViewContext';
import useWorkSpaceReducer from '../../store/WorkSpaceReducer';
import useAuthReducer from '../../store/AuthReducer';
import { useKanbanSidebarBridge } from '../../store/kanbanSidebarBridge';
import { ROUTE_PATHS } from '../../router/paths';
import {
  hasKanbanFullSidebar,
  isRestrictedBoardUser,
} from '../../shared/helpers/restrictedBoardUser';
import usePermissions from '../../shared/hooks/usePermissions';
import { PERMISSION_MODULES, PERMISSION_SUBMODULES, PERMISSION_ACTIONS } from '../../shared/constants/permissions';

function SideNav({ isMobileMenuOpen, onCloseMobileMenu, activePortal = null }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { width, isMobile } = useBreakpoint();
  const createDashboard = useWorkSpaceReducer((s) => s.createDashboard);

  const isKanbanBoard =
    pathname === '/kanban-board/operator' ||
    pathname.startsWith('/kanban-board/') ||
    pathname === '/workspaces' ||
    pathname.startsWith('/workspaces/dashboard') ||
    pathname === '/compact';

  const isWorkspacesShell = pathname === '/workspaces' || pathname.startsWith('/workspaces/dashboard');

  const { layoutView } = useLayoutView();
  const isDarkMode = layoutView === 'dark';
  const userProfile = useAuthReducer((state) => state.userProfile);
  const userRoleId =
    userProfile?.role_id ||
    userProfile?.roleId ||
    userProfile?.role?.role_id ||
    userProfile?.user?.role_id ||
    userProfile?.data?.role_id;
  const isPortManagerRole = String(userRoleId) === '1';
  const isPortSupervisorRole = String(userRoleId) === '3' || String(userRoleId) === '23';
  const restrictedNav = isRestrictedBoardUser(userProfile);
  // Classic sidebar only renders while already on a /kanban-board/* (or /compact)
  // route for restricted nav, so the current board can be read straight from the URL.
  const restrictedBoardBasePath = useMemo(
    () => pathname.match(/^\/kanban-board\/[^/]+/)?.[0] ?? '/kanban-board',
    [pathname]
  );
  const { hasPermission } = usePermissions();
  // User Management → Users is fully migrated to the new permission system:
  // the backend permission response is authoritative here, no legacy OR.
  const canViewUsersMenu = hasPermission({
    moduleKey: PERMISSION_MODULES.USER_MANAGEMENT,
    submoduleKey: PERMISSION_SUBMODULES.USERS,
    actionKey: PERMISSION_ACTIONS.VIEW,
  });
  // Kanban Workspaces is fully migrated to the new permission system: the
  // backend permission response is authoritative here, no legacy OR.
  const canViewWorkspaceMenu = hasPermission({
    moduleKey: PERMISSION_MODULES.KANBAN_WORKSPACE,
    actionKey: PERMISSION_ACTIONS.VIEW_WORKSPACE,
  });
  const kanbanFullSidebar = hasKanbanFullSidebar(userProfile);
  // Edit Workflow sidebar icon is gated by KANBAN_WORKFLOW/VIEW_WORKFLOW (the
  // backend has no separate EDIT_WORKFLOW action — VIEW_WORKFLOW is access to
  // the workflow builder page), matching the board card's "Edit Workflows" item.
  const canEditWorkflow = hasPermission({
    moduleKey: PERMISSION_MODULES.KANBAN_WORKFLOW,
    actionKey: PERMISSION_ACTIONS.VIEW_WORKFLOW,
  });
  // FFD's four job-lifecycle modules — each links straight to its board rather
  // than a dedicated page (see src/mocks/ffd/boards.js).
  const canViewCommercialPricing = hasPermission({
    moduleKey: PERMISSION_MODULES.COMMERCIAL_PRICING,
    actionKey: PERMISSION_ACTIONS.VIEW,
  });
  const canViewOperationsModule = hasPermission({
    moduleKey: PERMISSION_MODULES.OPERATIONS_MODULE,
    actionKey: PERMISSION_ACTIONS.VIEW,
  });
  const canViewCustomsClearance = hasPermission({
    moduleKey: PERMISSION_MODULES.CUSTOMS_CLEARANCE,
    actionKey: PERMISSION_ACTIONS.VIEW,
  });
  const canViewBillingDesk = hasPermission({
    moduleKey: PERMISSION_MODULES.BILLING_DESK,
    actionKey: PERMISSION_ACTIONS.VIEW,
  });

  const boardRouteMatchForEditWorkflow = pathname.match(/^\/kanban-board\/([^/]+)$/);
  const kanbanBoardIdForEditWorkflow = boardRouteMatchForEditWorkflow?.[1] ?? null;
  const showEditWorkflowSidebarIcon =
    canEditWorkflow &&
    Boolean(kanbanBoardIdForEditWorkflow) &&
    String(kanbanBoardIdForEditWorkflow).toLowerCase() !== 'operator';

  const kanbanBoardIcons = useMemo(() => {
    if (kanbanFullSidebar || isPortSupervisorRole) {
      const icons = [{ id: 1, icon: FiPlus, label: 'Add' }];
      if (showEditWorkflowSidebarIcon) {
        icons.push({ id: 9, icon: FiEdit3, label: 'Edit Workflow' });
      }
      icons.push(
        { id: 11, icon: FiLayers, label: 'Task' },
        { id: 8, icon: FiSettings, label: 'Settings' }
      );
      return icons;
    }
    const icons = [];
    if (showEditWorkflowSidebarIcon) {
      icons.push({ id: 9, icon: FiEdit3, label: 'Edit Workflow' });
    }
    icons.push({ id: 11, icon: FiLayers, label: 'Task' });
    return icons;
  }, [showEditWorkflowSidebarIcon, kanbanFullSidebar, isPortSupervisorRole]);

  const restrictedKanbanStripIcons = useMemo(
    () =>
      [
        canViewWorkspaceMenu ? { id: 4, icon: FiInbox, label: 'Workspaces' } : null,
        { id: 6, icon: FiLayout, label: 'Kanban Board' },
      ].filter(Boolean),
    [canViewWorkspaceMenu]
  );

  const workspacesIcons = [
    { id: 4, icon: FiInbox, label: 'Workspaces' },
    { id: 5, icon: FiPlusCircle, label: 'Add new dashboard' },
  ];

  // Board teams submenu items
  const boardTeamsSubmenu = [
    { label: 'Managers', modal: 'managers' },
    { label: 'Dashboards', modal: 'dashboards' },
  ];

  // Card management submenu items
  const cardManagementSubmenu = [
    { label: 'Blockers', modal: 'blockers' },
    { label: 'Stickers', modal: 'stickers' },
    { label: 'Tags', modal: 'tags' },
    { label: 'Types', modal: 'types' },
  ];

  // Select icons based on route (restricted roles: only Workspaces + fixed board)
  const kanbanIcons = restrictedNav
    ? restrictedKanbanStripIcons
    : pathname === '/kanban-board/operator' || pathname.startsWith('/kanban-board/') || pathname === '/compact'
      ? kanbanBoardIcons
      : workspacesIcons;

  // 🆕 Active state only for Kanban sidebar
  const [activeKanbanIcon, setActiveKanbanIcon] = useState(2);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showBoardTeamsSubmenu, setShowBoardTeamsSubmenu] = useState(false);
  const [showSettingsSubmenu, setShowSettingsSubmenu] = useState(false);
  const [showCardManagementSubmenu, setShowCardManagementSubmenu] = useState(false);
  const [showManagersModal, setShowManagersModal] = useState(false);
  const [showDashboardsModal, setShowDashboardsModal] = useState(false);
  const [showBusinessRulesModal, setShowBusinessRulesModal] = useState(false);
  const [showBlockersModal, setShowBlockersModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showTypesModal, setShowTypesModal] = useState(false);
  const [showAddDashboardModal, setShowAddDashboardModal] = useState(false);
  const [showMyAccountsModal, setShowMyAccountsModal] = useState(false);
  const [showSelectWorkflowModal, setShowSelectWorkflowModal] = useState(false);
  const [showSubTaskModal, setShowSubTaskModal] = useState(false);
  const [addModalStep, setAddModalStep] = useState('workflow');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [selectedSwimlaneId, setSelectedSwimlaneId] = useState(null);
  const [addModalWorkflows, setAddModalWorkflows] = useState([]);
  const [swimlanePhaseWorkflow, setSwimlanePhaseWorkflow] = useState(null);

  const sidebarWorkflows = useKanbanSidebarBridge((s) => s.boardWorkflows);
  const pendingAddCardFromWorkflowRef = useRef(null);

  const swimlaneOptionsForModal = useMemo(
    () => getSwimlaneOptionsFromWorkflow(swimlanePhaseWorkflow),
    [swimlanePhaseWorkflow]
  );
  const workflowOptionsForModal = useMemo(() => {
    return (sidebarWorkflows || [])
      .filter((workflow) => workflow?.role_id === null)
      .filter((workflow) => {
        const name = workflow?.workflow_name ?? workflow?.name ?? workflow?.title ?? '';
        return name !== 'Task Workflow' && name !== 'DA Workflow';
      })
      .map((workflow) => ({
        id: workflow?.workflow_id ?? workflow?.id,
        name: workflow?.workflow_name ?? workflow?.name ?? workflow?.title ?? 'Workflow',
        description: workflow?.description,
      }));
  }, [sidebarWorkflows]);

  const swimlaneContextDisplayName =
    swimlanePhaseWorkflow?.name ?? swimlanePhaseWorkflow?.title ?? '';

  const resetAddModalState = useCallback(() => {
    setAddModalStep('workflow');
    setAddModalWorkflows([]);
    setSwimlanePhaseWorkflow(null);
    setSelectedWorkflowId(null);
    setSelectedSwimlaneId(null);
  }, []);

  const closeSelectWorkflowModal = useCallback(() => {
    pendingAddCardFromWorkflowRef.current = null;
    setShowSelectWorkflowModal(false);
    resetAddModalState();
  }, [resetAddModalState]);

  const beginSidebarAddCard = useCallback(() => {
    const resolved = resolveSidebarAddCardAction(sidebarWorkflows);
    if (resolved.kind === 'dispatch') {
      window.dispatchEvent(new CustomEvent('kanban:add-card', { detail: resolved.detail }));
      return;
    }
    setAddModalWorkflows(resolved.workflowsForWorkflowStep ?? []);
    if (resolved.initialStep === 'swimlane') {
      setAddModalStep('swimlane');
      setSwimlanePhaseWorkflow(resolved.swimlaneContextWorkflow);
    } else {
      setAddModalStep('workflow');
      setSwimlanePhaseWorkflow(null);
    }
    setSelectedWorkflowId(null);
    setSelectedSwimlaneId(null);
    setShowSelectWorkflowModal(true);
  }, [sidebarWorkflows]);

  const handleAddModalContinue = useCallback(() => {
    if (addModalStep === 'workflow') {
      const w = addModalWorkflows.find(
        (x) => x.id === selectedWorkflowId || String(x.id) === String(selectedWorkflowId)
      );
      if (!w) return;
      const lanes = getSwimlaneOptionsFromWorkflow(w);
      if (lanes.length > 1) {
        setSwimlanePhaseWorkflow(w);
        setAddModalStep('swimlane');
        setSelectedSwimlaneId(null);
        return;
      }
      if (lanes.length === 1) {
        pendingAddCardFromWorkflowRef.current = buildKanbanAddCardEventDetail(w, lanes[0]);
      } else {
        pendingAddCardFromWorkflowRef.current = buildKanbanAddCardEventDetail(w, null);
      }
      setShowSelectWorkflowModal(false);
      setSelectedWorkflowId(null);
      return;
    }
    if (addModalStep === 'swimlane') {
      const wf = swimlanePhaseWorkflow;
      if (!wf) return;
      const lanes = getSwimlaneOptionsFromWorkflow(wf);
      const lane = lanes.find(
        (l) => l.id === selectedSwimlaneId || String(l.id) === String(selectedSwimlaneId)
      );
      if (!lane) return;
      pendingAddCardFromWorkflowRef.current = buildKanbanAddCardEventDetail(wf, lane);
      setShowSelectWorkflowModal(false);
      setSelectedSwimlaneId(null);
    }
  }, [
    addModalStep,
    addModalWorkflows,
    selectedWorkflowId,
    swimlanePhaseWorkflow,
    selectedSwimlaneId,
  ]);

  const handleSelectWorkflowModalExited = useCallback(() => {
    const d = pendingAddCardFromWorkflowRef.current;
    if (!d) {
      resetAddModalState();
      return;
    }
    pendingAddCardFromWorkflowRef.current = null;
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('kanban:add-card', { detail: d }));
    });
    resetAddModalState();
  }, [resetAddModalState, navigate]);

  const [expand, setExpand] = useState(false);

  // Generic sidebar: only routes the FFD foundation actually ships. Board/workflow
  // navigation lives in the kanban icon strip above, not here — this is the
  // non-board (Dashboard/User Management/Settings) menu tree.
  const menus = [
    {
      menu: 'Dashboard',
      isDefaultMenu: true,
      to: ROUTE_PATHS.DASHBOARD,
      icon: dashboardIcon,
      hasPermission: true,
    },
    {
      menu: 'Commercial/Pricing Desk',
      isDefaultMenu: true,
      to: '/kanban-board/ffd-board-commercials',
      icon: configIcon,
      hasPermission: canViewCommercialPricing,
    },
    {
      menu: 'Operations',
      isDefaultMenu: true,
      to: '/kanban-board/ffd-board-ops',
      icon: workersIcon,
      hasPermission: canViewOperationsModule,
    },
    {
      menu: 'Customs Clearance',
      isDefaultMenu: true,
      to: '/kanban-board/ffd-board-customs',
      icon: inspectionIcon,
      hasPermission: canViewCustomsClearance,
    },
    {
      menu: 'Billing Desk',
      isDefaultMenu: true,
      to: '/kanban-board/ffd-board-billing',
      icon: billingIcon,
      hasPermission: canViewBillingDesk,
    },
    {
      menu: 'User Management',
      isDefaultMenu: true,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        { menu: 'Users', to: '/users', hasPermission: canViewUsersMenu },
        { menu: 'Permissions', to: '/permissions', hasPermission: true },
      ],
      icon: usersIcon,
    },
    {
      menu: 'Settings',
      isDefaultMenu: true,
      icon: settingsIcon,
      hasPermission: true,
      isOpen: false,
      subMenus: [
        { menu: 'My Accounts', to: '/my-accounts', hasPermission: true },
        { menu: 'Activity Log', to: '/activity-log', hasPermission: true },
      ],
    },
  ];

  const restrictedSidebarMenus = useMemo(
    () => [
      {
        menu: 'Workspaces',
        isDefaultMenu: true,
        to: '/workspaces',
        icon: dashboardIcon,
        hasPermission: canViewWorkspaceMenu,
      },
      {
        menu: 'Kanban Board',
        isDefaultMenu: true,
        to: restrictedBoardBasePath,
        icon: dashboardIcon,
        hasPermission: true,
      },
    ],
    [restrictedBoardBasePath, canViewWorkspaceMenu]
  );

  const [menuState, setMenuState] = useState(menus);
  const effectiveMenuState = restrictedNav ? restrictedSidebarMenus : menuState;

  // Sync with Header's mobile menu state
  useEffect(() => {
    if (isMobileMenuOpen !== undefined) {
      setExpand(isMobileMenuOpen);
    }
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile && expand && onCloseMobileMenu) {
      setExpand(false);
      onCloseMobileMenu();
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobile && expand && onCloseMobileMenu) {
      const handleClickOutside = (e) => {
        const sidebar = document.querySelector('.sidebar');
        const headerToggle = document.querySelector('.mobile-menu-toggle');
        if (sidebar && !sidebar.contains(e.target) && !headerToggle?.contains(e.target)) {
          setExpand(false);
          onCloseMobileMenu();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, expand, onCloseMobileMenu]);

  useEffect(() => {
    // 🔒 Don’t touch normal menu behaviour when on Kanban sidebar
    if (isKanbanBoard || activePortal || restrictedNav) return;

    if (width > 991)
      setMenuState((prev) =>
        prev.map((e) => ({
          ...e,
          // Only open the menu whose submenu matches the current route, close all others
          isOpen: e?.subMenus && e.subMenus.some((eS) => eS?.to === pathname) ? true : false,
        }))
      );
    else {
      setMenuState((prev) => prev.map((e) => ({ ...e, isOpen: false })));
      setExpand(false);
    }
  }, [pathname, width, isKanbanBoard, activePortal, restrictedNav]);

  const toggleCollapse = (menu) => {
    setMenuState((prev) => {
      const clickedMenu = prev.find((e) => e.menu === menu);
      const willBeOpen = clickedMenu
        ? width < 991 && !expand
          ? true
          : !clickedMenu.isOpen
        : false;

      // Close all other menus when opening a menu
      return prev.map((e) => ({
        ...e,
        isOpen: e.menu === menu ? willBeOpen : false,
      }));
    });
    if (width < 991) {
      setExpand(!expand);
      if (onCloseMobileMenu && expand) {
        onCloseMobileMenu();
      }
    }
  };

  const handleSubmenuClickDefault = (subMenu) => {
    if (subMenu === 'My Accounts') {
      setShowMyAccountsModal(true);
      if (isMobile && expand && onCloseMobileMenu) {
        setExpand(false);
        onCloseMobileMenu();
      }
      return true;
    }
    return false;
  };

  const handleToggle = () => {
    const newExpand = !expand;
    setExpand(newExpand);
    if (onCloseMobileMenu) {
      if (!newExpand) onCloseMobileMenu();
    }
  };

  // Set active icon based on current route
  useEffect(() => {
    if (!isKanbanBoard) return;
    if (restrictedNav) {
      if (pathname === '/workspaces' || pathname.startsWith('/workspaces/')) {
        setActiveKanbanIcon(4);
      } else {
        setActiveKanbanIcon(6);
      }
      return;
    }
    if (pathname === '/workspaces') {
      setActiveKanbanIcon(4);
    } else if (pathname.includes('/analytics')) {
      setActiveKanbanIcon(3);
    } else if (
      pathname === '/kanban-board/operator' ||
      pathname.startsWith('/kanban-board/') ||
      pathname === '/compact'
    ) {
      setActiveKanbanIcon(1);
    }
  }, [pathname, isKanbanBoard, restrictedNav]);

  // Add/remove class to body when submenu is open
  useEffect(() => {
    if (showBoardTeamsSubmenu || showCardManagementSubmenu) {
      document.body.classList.add('board-teams-submenu-open');
    } else {
      document.body.classList.remove('board-teams-submenu-open');
    }
    return () => {
      document.body.classList.remove('board-teams-submenu-open');
    };
  }, [showBoardTeamsSubmenu, showCardManagementSubmenu]);

  // Close submenu when clicking outside (board teams)
  useEffect(() => {
    if (showBoardTeamsSubmenu) {
      const handleClickOutside = (event) => {
        const sidebar = document.querySelector('.kanban-sidebar');
        const submenu = document.querySelector('.kanban-sidebar-submenu');
        if (sidebar && !sidebar.contains(event.target) && submenu && !submenu.contains(event.target)) {
          setShowBoardTeamsSubmenu(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBoardTeamsSubmenu]);

  // Close submenu when clicking outside (card management)
  useEffect(() => {
    if (showCardManagementSubmenu) {
      const handleClickOutside = (event) => {
        const sidebar = document.querySelector('.kanban-sidebar');
        const submenu = document.querySelector('.card-management-submenu');
        if (sidebar && !sidebar.contains(event.target) && submenu && !submenu.contains(event.target)) {
          setShowCardManagementSubmenu(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCardManagementSubmenu]);

  // 🆕 Special layout for /kanban-board and /workspaces (skip when in Vendor Portal)
  if (isKanbanBoard && !activePortal && isWorkspacesShell) {
    return (
      <>
        <WorkspacesSideNavPanel
          isDarkMode={isDarkMode}
          onNewDashboard={() => setShowAddDashboardModal(true)}
          restrictedBoardUser={restrictedNav}
        />
        <BoardFilterPanel show={showFilterPanel} onClose={() => setShowFilterPanel(false)} />
        <ManagersModal show={showManagersModal} onClose={() => setShowManagersModal(false)} />
        <DashboardsModal show={showDashboardsModal} onClose={() => setShowDashboardsModal(false)} />
        <BusinessRulesModal show={showBusinessRulesModal} onClose={() => setShowBusinessRulesModal(false)} />
        <BlockersModal show={showBlockersModal} onClose={() => setShowBlockersModal(false)} />
        <StickersModal show={showStickersModal} onClose={() => setShowStickersModal(false)} />
        <TagsModal show={showTagsModal} onClose={() => setShowTagsModal(false)} />
        <TypesModal show={showTypesModal} onClose={() => setShowTypesModal(false)} />
        <AddDashboardModal
          show={showAddDashboardModal}
          onClose={() => setShowAddDashboardModal(false)}
          onSave={(data) => {
            createDashboard({
              dashboard_name: data.name,
              cb: (newId) => {
                setShowAddDashboardModal(false);
                if (newId) navigate(`/workspaces/dashboard/${newId}`);
              },
            });
          }}
        />
      </>
    );
  }

  if (isKanbanBoard && !activePortal) {
    const handleIconClick = (item) => {
      if (restrictedNav) {
        if (item.label === 'Workspaces') {
          navigate('/workspaces');
          setActiveKanbanIcon(item.id);
          return;
        }
        if (item.label === 'Kanban Board') {
          navigate(restrictedBoardBasePath);
          setActiveKanbanIcon(item.id);
          return;
        }
      }

      if (item.label === 'Filter') {
        const newShowState = !showFilterPanel;
        closeSelectWorkflowModal();
        setShowFilterPanel(newShowState);
        setShowBoardTeamsSubmenu(false);
        setShowSettingsSubmenu(false);
        setShowCardManagementSubmenu(false);
        if (newShowState) setActiveKanbanIcon(item.id);
        return;
      }

      if (item.label === 'Analytics') {
        closeSelectWorkflowModal();
        // Extract board ID from pathname if available
        const boardIdMatch = pathname.match(/\/kanban-board\/operator\/(\d+)/);
        const boardId = boardIdMatch ? boardIdMatch[1] : '';
        navigate(`/kanban-board/${boardId ? `${boardId}/` : ''}analytics`);
        setActiveKanbanIcon(item.id);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowSettingsSubmenu(false);
        setShowCardManagementSubmenu(false);
        return;
      }

      if (item.label === 'Board teams') {
        const newShowState = !showBoardTeamsSubmenu;
        closeSelectWorkflowModal();
        setShowBoardTeamsSubmenu(newShowState);
        setShowFilterPanel(false);
        setShowSettingsSubmenu(false);
        setShowBusinessRulesModal(false);
        setShowCardManagementSubmenu(false);
        if (newShowState) setActiveKanbanIcon(item.id);
        return;
      }

      if (item.label === 'Business rules') {
        closeSelectWorkflowModal();
        setShowBusinessRulesModal(true);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowSettingsSubmenu(false);
        setShowCardManagementSubmenu(false);
        setActiveKanbanIcon(item.id);
        return;
      }

      if (item.label === 'Card management') {
        const newShowState = !showCardManagementSubmenu;
        closeSelectWorkflowModal();
        setShowCardManagementSubmenu(newShowState);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowSettingsSubmenu(false);
        setShowBusinessRulesModal(false);
        setShowBlockersModal(false);
        setShowStickersModal(false);
        setShowTagsModal(false);
        setShowTypesModal(false);
        if (newShowState) setActiveKanbanIcon(item.id);
        return;
      }

      if (item.label === 'Settings') {
        const newShowState = !showSettingsSubmenu;
        closeSelectWorkflowModal();
        setShowSettingsSubmenu(newShowState);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowBusinessRulesModal(false);
        if (!newShowState) {
          setShowCardManagementSubmenu(false);
          setShowBlockersModal(false);
          setShowStickersModal(false);
          setShowTagsModal(false);
          setShowTypesModal(false);
        }
        if (newShowState) setActiveKanbanIcon(item.id);
        return;
      }

      if (item.label === 'Edit Workflow') {
        closeSelectWorkflowModal();
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowSettingsSubmenu(false);
        setShowCardManagementSubmenu(false);
        navigate(`/edit-workflow?boardId=${kanbanBoardIdForEditWorkflow}`);
        setActiveKanbanIcon(item.id);
        return;
      }

      if (showFilterPanel) setShowFilterPanel(false);
      if (showBoardTeamsSubmenu) setShowBoardTeamsSubmenu(false);
      if (showSettingsSubmenu) setShowSettingsSubmenu(false);
      if (showCardManagementSubmenu) setShowCardManagementSubmenu(false);
      if (showBusinessRulesModal) setShowBusinessRulesModal(false);
      if (showBlockersModal) setShowBlockersModal(false);
      if (showStickersModal) setShowStickersModal(false);
      if (showTagsModal) setShowTagsModal(false);
      if (showTypesModal) setShowTypesModal(false);
      if (showAddDashboardModal) setShowAddDashboardModal(false);
      if (showSubTaskModal && item.label !== 'Task') setShowSubTaskModal(false);
      if (item.label !== 'Add') {
        closeSelectWorkflowModal();
      }

      setActiveKanbanIcon(item.id);

      if (item.label === 'Add') {
        beginSidebarAddCard();
      }

      if (item.label === 'Task') {
        closeSelectWorkflowModal();
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowSettingsSubmenu(false);
        setShowCardManagementSubmenu(false);
        setShowSubTaskModal(true);
        setActiveKanbanIcon(item.id);
        return;
      }

      if (item.label === 'Add new dashboard') {
        setShowAddDashboardModal(true);
        setShowFilterPanel(false);
        setShowBoardTeamsSubmenu(false);
        setShowSettingsSubmenu(false);
        setShowCardManagementSubmenu(false);
        setActiveKanbanIcon(item.id);
        return;
      }

      if (item.label === 'Workspaces') {
        navigate('/workspaces');
      } else if (pathname === '/workspaces' && item.label !== 'Workspaces') {
        navigate('/kanban-board/operator');
        window.dispatchEvent(new CustomEvent('kanban:hide-workspaces', { detail: { activeIcon: item.id } }));
      } else {
        window.dispatchEvent(new CustomEvent('kanban:hide-workspaces', { detail: { activeIcon: item.id } }));
      }
    };

    const handleSettingsBusinessRulesClick = () => {
      setShowSettingsSubmenu(false);
      setShowCardManagementSubmenu(false);
      setShowFilterPanel(false);
      setShowBoardTeamsSubmenu(false);
      setShowManagersModal(false);
      setShowDashboardsModal(false);
      setShowBlockersModal(false);
      setShowStickersModal(false);
      setShowTagsModal(false);
      setShowTypesModal(false);
      setShowBusinessRulesModal(true);
    };

    const handleSettingsCardManagementRowClick = (e) => {
      e.stopPropagation();
      const next = !showCardManagementSubmenu;
      setShowCardManagementSubmenu(next);
      if (!next) {
        setShowBlockersModal(false);
        setShowStickersModal(false);
        setShowTagsModal(false);
        setShowTypesModal(false);
      }
    };

    const handleSubmenuClickKanban = (item) => {
      setShowBoardTeamsSubmenu(false);
      setShowSettingsSubmenu(false);
      if (item.modal === 'managers') setShowManagersModal(true);
      else if (item.modal === 'dashboards') setShowDashboardsModal(true);
    };

    const handleCardManagementSubmenuClick = (item) => {
      setShowCardManagementSubmenu(false);
      setShowSettingsSubmenu(false);

      setShowFilterPanel(false);
      setShowBoardTeamsSubmenu(false);
      setShowBusinessRulesModal(false);

      setShowBlockersModal(false);
      setShowStickersModal(false);
      setShowTagsModal(false);
      setShowTypesModal(false);

      if (item.modal === 'blockers') setShowBlockersModal(true);
      if (item.modal === 'stickers') setShowStickersModal(true);
      if (item.modal === 'tags') setShowTagsModal(true);
      if (item.modal === 'types') setShowTypesModal(true);
    };

    return (
      <>
        {(isPortManagerRole || isPortSupervisorRole) && (
          <aside className={`kanban-sidebar ${isDarkMode ? 'kanban-sidebar-dark' : ''}`}>
            {kanbanIcons.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeKanbanIcon === item.id ||
                (restrictedNav &&
                  item.label === 'Kanban Board' &&
                  pathname.startsWith('/kanban-board/')) ||
                (item.label === 'Filter' && showFilterPanel) ||
                (item.label === 'Analytics' && pathname.includes('/analytics')) ||
                (item.label === 'Board teams' && showBoardTeamsSubmenu) ||
                (item.label === 'Business rules' && showBusinessRulesModal) ||
                (item.label === 'Card management' && showCardManagementSubmenu) ||
                (item.label === 'Edit Workflow' && pathname.startsWith('/edit-workflow')) ||
                (item.label === 'Settings' && (showSettingsSubmenu || showCardManagementSubmenu)) ||
                (item.label === 'Add new dashboard' && showAddDashboardModal) ||
                (item.label === 'Add' && showSelectWorkflowModal) ||
                (item.label === 'Task' && showSubTaskModal);

              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <div
                    className={`kanban-sidebar-icon ${isActive ? 'active' : ''}`}
                    onClick={() => handleIconClick(item)}
                    data-tooltip-id="sidebar-tooltip"
                    data-tooltip-content={item.label}
                  >
                    <Icon size={22} />
                  </div>

                  {item.label === 'Board teams' && showBoardTeamsSubmenu && (
                    <div className="kanban-sidebar-submenu">
                      {boardTeamsSubmenu.map((subItem, index) => (
                        <div
                          key={index}
                          className="kanban-sidebar-submenu-item"
                          onClick={() => handleSubmenuClickKanban(subItem)}
                        >
                          {subItem.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.label === 'Card management' && showCardManagementSubmenu && (
                    <div className="kanban-sidebar-submenu card-management-submenu">
                      {cardManagementSubmenu.map((subItem, index) => (
                        <div
                          key={index}
                          className="kanban-sidebar-submenu-item"
                          onClick={() => handleCardManagementSubmenuClick(subItem)}
                        >
                          {subItem.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.label === 'Settings' && showSettingsSubmenu && (
                    <div className="kanban-sidebar-submenu">
                      <div
                        className="kanban-sidebar-submenu-item"
                        onClick={handleSettingsBusinessRulesClick}
                      >
                        Business rules
                      </div>
                      <div
                        className={`kanban-sidebar-submenu-item ${showCardManagementSubmenu ? 'submenu-open' : ''}`}
                        onClick={handleSettingsCardManagementRowClick}
                      >
                        Card management
                      </div>
                      {showCardManagementSubmenu && (
                        <div className="kanban-sidebar-submenu card-management-submenu">
                          {cardManagementSubmenu.map((subItem, index) => (
                            <div
                              key={index}
                              className="kanban-sidebar-submenu-item"
                              onClick={() => handleCardManagementSubmenuClick(subItem)}
                            >
                              {subItem.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <Tooltip
              id="sidebar-tooltip"
              place="right"
              style={{
                backgroundColor: '#333',
                color: '#fff',
                fontSize: '0.85rem',
                borderRadius: '6px',
                padding: '6px 10px',
                fontWeight: '500',
              }}
            />
          </aside>
        )}

        <BoardFilterPanel show={showFilterPanel} onClose={() => setShowFilterPanel(false)} />
        <ManagersModal show={showManagersModal} onClose={() => setShowManagersModal(false)} />
        <DashboardsModal show={showDashboardsModal} onClose={() => setShowDashboardsModal(false)} />
        <BusinessRulesModal show={showBusinessRulesModal} onClose={() => setShowBusinessRulesModal(false)} />
        <BlockersModal show={showBlockersModal} onClose={() => setShowBlockersModal(false)} />
        <StickersModal show={showStickersModal} onClose={() => setShowStickersModal(false)} />
        <TagsModal show={showTagsModal} onClose={() => setShowTagsModal(false)} />
        <TypesModal show={showTypesModal} onClose={() => setShowTypesModal(false)} />
        <AddDashboardModal
          show={showAddDashboardModal}
          onClose={() => setShowAddDashboardModal(false)}
          onSave={(data) => {
            createDashboard({
              dashboard_name: data.name,
              cb: (newId) => {
                setShowAddDashboardModal(false);
                if (newId) navigate(`/workspaces/dashboard/${newId}`);
              },
            });
          }}
        />
        <SelectWorkflowModal
          show={showSelectWorkflowModal}
          selectionMode={addModalStep === 'swimlane' ? 'swimlane' : 'workflow'}
          workflows={workflowOptionsForModal}
          swimlanes={addModalStep === 'swimlane' ? swimlaneOptionsForModal : []}
          workflowContextName={addModalStep === 'swimlane' ? swimlaneContextDisplayName : undefined}
          selectedWorkflowId={addModalStep === 'workflow' ? selectedWorkflowId : null}
          selectedSwimlaneId={addModalStep === 'swimlane' ? selectedSwimlaneId : null}
          onSelectWorkflowId={setSelectedWorkflowId}
          onSelectSwimlaneId={setSelectedSwimlaneId}
          onClose={closeSelectWorkflowModal}
          onContinue={handleAddModalContinue}
          onExited={handleSelectWorkflowModalExited}
        />
        <TaskCardModal
          show={showSubTaskModal}
          onClose={() => setShowSubTaskModal(false)}
        />
      </>
    );
  }

  // 🔵 Default sidebar (all other routes)
  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && expand && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            setExpand(false);
            if (onCloseMobileMenu) onCloseMobileMenu();
          }}
        />
      )}

      <div className={`sidebar ${expand ? 'show' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="st-wrp">
          <button
            type="button"
            onClick={handleToggle}
            className="sidebar-toggle"
            aria-label="Toggle sidebar"
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <div className="menuWrp">
          <ul className="menu">
            {effectiveMenuState
              .filter((e) => e.hasPermission === true)
              .map(({ menu, subMenus, to, isDefaultMenu, icon, isOpen }) => {
                if (!isDefaultMenu) return null;
                return (
                  <DefaultMenu
                    menu={menu}
                    subMenus={subMenus}
                    to={to}
                    key={menu}
                    icon={icon}
                    isOpen={isOpen}
                    toggleCollapse={toggleCollapse}
                    onSubmenuClick={handleSubmenuClickDefault}
                  />
                );
              })}
          </ul>
        </div>

        <div className="toggleDark" />
      </div>

      {/* My Accounts Modal */}
      {!!showMyAccountsModal && (
        <MyAccountsModal show={showMyAccountsModal} onClose={() => setShowMyAccountsModal(false)} />
      )}
    </>
  );
}

export default SideNav;
