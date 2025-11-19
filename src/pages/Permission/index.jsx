import '../../design/scss/employee.scss';
import CustomTable from '../../components/customTable';
import CommonHeader from '../../components/CommonHeader';
import { DateFormat, RenderAction } from './RenderCells';
import { PermissionModal } from './Modals/AddEditPermission';
import { useState } from 'react';

const Permission = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
  });

  const [state, setState] = useState({
    showAddModal: false,
    editData: null,
    selectedIdForDelete: null,
  });

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // 👉 Dummy Permission Data
const dummyPermissions = [
  {
    _id: "1",
    name: "Admin Access",
    noOfUsers: 12,
    description: "Full access to all modules",
    createdAt: "2024-10-12T10:15:00Z",
    updatedAt: "2024-11-05T09:30:00Z",
  },
  {
    _id: "2",
    name: "Editor Access",
    noOfUsers: 8,
    description: "Can edit content but limited access",
    createdAt: "2024-09-28T14:20:00Z",
    updatedAt: "2024-10-15T18:00:00Z",
  },
  {
    _id: "3",
    name: "Viewer Access",
    noOfUsers: 19,
    description: "Only view permissions",
    createdAt: "2024-08-10T11:45:00Z",
    updatedAt: "2024-09:02T10:10:00Z",
  },

  // ➕ New 7 items
  {
    _id: "4",
    name: "User Management Access",
    noOfUsers: 6,
    description: "Manage users, roles, and permissions",
    createdAt: "2024-10-01T09:10:00Z",
    updatedAt: "2024-11-02T11:30:00Z",
  },
  {
    _id: "5",
    name: "Finance Access",
    noOfUsers: 4,
    description: "Access billing and financial reports",
    createdAt: "2024-09-15T13:50:00Z",
    updatedAt: "2024-10-12T15:25:00Z",
  },
  {
    _id: "6",
    name: "Operations Access",
    noOfUsers: 9,
    description: "Manage operational workflows",
    createdAt: "2024-08-22T16:00:00Z",
    updatedAt: "2024-08-30T12:45:00Z",
  },
  {
    _id: "7",
    name: "Approval Access",
    noOfUsers: 11,
    description: "Approve tasks and workflow actions",
    createdAt: "2024-07-10T08:20:00Z",
    updatedAt: "2024-08-18T17:00:00Z",
  },
  {
    _id: "8",
    name: "Report Access",
    noOfUsers: 14,
    description: "View and download system reports",
    createdAt: "2024-09-01T11:00:00Z",
    updatedAt: "2024-10-01T09:30:00Z",
  },
  {
    _id: "9",
    name: "Support Access",
    noOfUsers: 7,
    description: "Access support tickets and communications",
    createdAt: "2024-09-19T10:05:00Z",
    updatedAt: "2024-10-25T14:40:00Z",
  },
  {
    _id: "10",
    name: "Audit Access",
    noOfUsers: 5,
    description: "View logs and system audit data",
    createdAt: "2024-10-05T09:55:00Z",
    updatedAt: "2024-11-01T08:45:00Z",
  },
];


  const totalPermissionCount = dummyPermissions.length;

  const cols = [
    {
      name: 'Permission',
      selector: 'name',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
           width: '200',
    },
    {
      name: 'Users',
      selector: 'noOfUsers',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
           width: '200',
    },
    {
      name: 'Short Description',
      selector: 'description',
      tableClasses: 'table-striped',
      sort: true,
           width: '300',
    },
    {
      name: 'Created At',
      selector: 'createdAt',
      cell: DateFormat,
      width: '200',
    },
    {
      name: 'Modified At',
      selector: 'updatedAt',
      cell: DateFormat,
      width: '200',
    },
    {
      name: 'Actions',
      selector: 'linksInfo',
      onEditClick: (row) => {
        setState({ ...state, editData: row, showAddModal: true });
      },
      onDeleteClick: (row) =>
        setState({ ...state, selectedIdForDelete: row._id }),
      cell: RenderAction,
    },
  ];

  return (
    <div className="page-body">
      <div className="prospect employee">
        <div className="container-fluid">
          <CommonHeader
            tableTitle="Permission List"
            isAddEnabled
            addModalLabel="Add Permission"
            setSearch={(e) =>
              setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
            }
            exportTitle="Export"
            exportLoader={false}
          />
        </div>

        {/* TABLE */}
        <CustomTable
          Sl
          pagination={{ currentPage: params.page, limit: params.limit }}
          tableClasses="px-start"
          count={totalPermissionCount}
          columns={cols}
          isLoading={false}
          data={dummyPermissions}
          onPageChange={(currentPage) =>
            setParams({ ...params, page: currentPage })
          }
          setLimit={(newlimit) => setParams({ ...params, limit: newlimit })}
        />

        {!!showPermissionModal && (
          <PermissionModal
            showModal={showPermissionModal}
            closeModal={() =>   setShowPermissionModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Permission;
