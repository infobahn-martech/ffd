import CustomModal from '../../../components/CustomModal';
import icon from '../../../assets/images/icon-chevToggle.svg';
import '../../../design/scss/add-permissions.scss';

// -------------------------------------------
//  DYNAMIC PERMISSION SECTIONS
// -------------------------------------------
const PERMISSION_SECTIONS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    items: [
      { id: 'total_income', title: 'Total Income' },
      { id: 'total_expense', title: 'Total Expense' },
      { id: 'net_profit', title: 'Net Profit' },
      { id: 'new_leads', title: 'New Leads' },
      { id: 'active_workers', title: 'Active Workers' },
      { id: 'pending_tasks', title: 'Pending Tasks' },
    ],
  },

  {
    id: "userManagement",
    title: "User Management",
    subSections: [
      {
        id: "roles",
        title: "Roles",
        items: [
          { id: 'list', title: 'List' },
          { id: 'add', title: 'Add' },
          { id: 'edit', title: 'Edit' },
          { id: 'delete', title: 'Delete' },
        ]
      },
      {
        id: "permissions",
        title: "Permissions",
        items: [
          { id: 'list', title: 'List' },
          { id: 'add', title: 'Add' },
          { id: 'edit', title: 'Edit' },
          { id: 'delete', title: 'Delete' },
        ]
      },
      {
        id: "users",
        title: "Users",
        items: [
          { id: 'list', title: 'List' },
          { id: 'add', title: 'Add' },
          { id: 'edit', title: 'Edit' },
          { id: 'status', title: 'Status' },
          { id: 'delete', title: 'Delete' },
        ]
      },
    ],
  },

  {
    id: "portManagement",
    title: "Port Management",
    items: [
      { id: 'list', title: 'List', items: [] },
    ],
  },

  {
    id: "billingAccounts",
    title: "Billing Accounts",
    items: [
      { id: 'list', title: 'List', items: [] },
    ],
  },

  {
    id: "vesselManagement",
    title: "Vessel Management",
    subSections: [
      { id: "vesselTypes", title: "Vessel Types", items: [{ id: 'list', title: 'List' }] },
      { id: "vessels", title: "Vessels", items: [{ id: 'list', title: 'List' }] },
    ],
  },

  {
    id: "preArrival",
    title: "Pre-Arrival",
    subSections: [
      { id: "documents", title: "Documents", items: [{ id: 'list', title: 'List' }] },
    ],
  },
];

// Unique toggle ID builder
const buildToggleId = (...parts) => `toggle_${parts.join('_')}`;

// -------------------------------------------
//  MAIN COMPONENT
// -------------------------------------------
export function PermissionModal({ showModal, closeModal }) {

  // -------------------------------------------
  //  RENDER TOP LEVEL MENU
  // -------------------------------------------
  const renderTopLevel = (section) => {
    const hasSub = section.subSections && section.subSections.length > 0;
    const hasItems = section.items && section.items.length > 0;
    const collapseId = `permission_${section.id}`;
    const toggleId = buildToggleId(section.id);

    return (
      <div className="permCheck-item" key={section.id}>
        <div className="permCheckWrp">
          <div className="title">{section.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input type="checkbox" id={toggleId} />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          <button
            type="button"
            className="btn btn-toggle"
            {...((hasSub || hasItems)
              ? {
                'data-bs-toggle': 'collapse',
                'data-bs-target': `#${collapseId}`,
                'aria-expanded': 'false',
                'aria-controls': collapseId,
              }
              : {})}
          >
            <img src={icon} alt="down" />
          </button>
        </div>

        {/* DIRECT ITEMS (Dashboard Case) */}
        {hasItems && (
          <div className="collapse" id={collapseId}>
            <div className="permcheck-subitems row">
              {section.items.map((item) => renderDirectItem(section, item))}
            </div>
          </div>
        )}

        {/* SUB-SECTIONS (User Management etc.) */}
        {hasSub && (
          <div className="permCheck-inner">
            <div className="collapse" id={collapseId}>
              <div className="permInnerItems">
                {section.subSections.map((sub) => renderSubLevel(section, sub))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------
  //  Render Level 2 (Submenu)
  // -------------------------------------------
  const renderSubLevel = (section, sub) => {
    const hasItems = sub.items && sub.items.length > 0;
    const collapseId = `permission_${section.id}_${sub.id}`;
    const toggleId = buildToggleId(section.id, sub.id);

    return (
      <div className="permCheck-item level_2" key={sub.id}>
        <div className="permCheckWrp">
          <div className="title">{sub.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input type="checkbox" id={toggleId} />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          {hasItems && (
            <button
              className="btn btn-toggle"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#${collapseId}`}
            >
              <img src={icon} alt="down" />
            </button>
          )}
        </div>

        {hasItems && (
          <div className="collapse" id={collapseId}>
            <div className="permcheck-subitems row">
              {sub.items.map((item) => renderItem(section, sub, item))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // -------------------------------------------
  //  Render Dashboard direct items
  // -------------------------------------------
  const renderDirectItem = (section, item) => {
    const toggleId = buildToggleId(section.id, item.id);

    return (
      <div className="col-xl-4 col-md-6" key={item.id}>
        <div className="permCheckWrp">
          <div className="title">{item.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input type="checkbox" id={toggleId} />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          <button className="btn btn-toggle" type="button">
            <img src={icon} alt="down" />
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------
  //  Render Item (List / Add / Edit...)
  // -------------------------------------------
  const renderItem = (section, sub, item) => {
    const toggleId = buildToggleId(section.id, sub.id, item.id);

    return (
      <div className="col-xl-4 col-md-6" key={item.id}>
        <div className="permCheckWrp">
          <div className="title">{item.title}</div>

          <span className="toggleSwitch">
            <span className="togglerCheckbox">
              <input type="checkbox" id={toggleId} />
              <label htmlFor={toggleId} className="checkLabel" />
            </span>
          </span>

          <button className="btn btn-toggle" type="button">
            <img src={icon} alt="down" />
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------
  //  Body
  // -------------------------------------------
  const renderBody = () => (
    <div className="modal-body">
      <div className="addPermissions">
        <form>
          <div className="permInputs">
            <div className="form-floating desig-inp">
              <input className="form-control" id="floatingName" />
              <label htmlFor="floatingName">Designation name *</label>
            </div>

            <div className="form-floating desc-input">
              <input className="form-control" id="floatingDesc" />
              <label htmlFor="floatingDesc">Description</label>
            </div>
          </div>

          {/* Render dynamic sections */}
          {PERMISSION_SECTIONS.map((section) => renderTopLevel(section))}
        </form>
      </div>
    </div>
  );

  // -------------------------------------------
  //  Footer
  // -------------------------------------------
  const renderFooter = () => (
    <div className="modal-footer">
      <button className="btn btn-outline" onClick={() => closeModal?.(null)}>Close</button>
      <button className="btn btn-primary">Save</button>
    </div>
  );

  return (
    <CustomModal
      className="modal fade addPermissionMod show"
      dialgName="custom-mod custom-mod-xl modal-dialog modal-dialog-centered modal-dialog-scrollable"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={<h1 className="modal-title fs-5">Add Designation and Permission</h1>}
    />
  );
}
