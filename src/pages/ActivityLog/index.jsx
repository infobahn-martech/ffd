import { useState } from "react";
import { DateFormat, RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { ViewActivityLogModal } from "./Modals/ViewActivityLog";
import "./ActivityLog.scss";

const initialActivityLogs = [
  {
    _id: "1",
    dateTime: "2024-11-15T10:30:00Z",
    userName: "John Smith",
    activityType: "Login",
    module: "Authentication",
    description: "User logged in successfully",
    status: "Success",
    ipAddress: "192.168.1.100",
    action: "View Details",
  },
  {
    _id: "2",
    dateTime: "2024-11-15T09:15:00Z",
    userName: "Ahmed Al-Rashid",
    activityType: "Create",
    module: "Crew Management",
    description: "Created new crew member record",
    status: "Success",
    ipAddress: "192.168.1.101",
    action: "View Details",
  },
  {
    _id: "3",
    dateTime: "2024-11-15T08:45:00Z",
    userName: "Maria Garcia",
    activityType: "Update",
    module: "Custom Inspection",
    description: "Updated inspection status",
    status: "Success",
    ipAddress: "192.168.1.102",
    action: "View Details",
  },
  {
    _id: "4",
    dateTime: "2024-11-14T16:20:00Z",
    userName: "David Chen",
    activityType: "Delete",
    module: "Vessel Management",
    description: "Deleted vessel record",
    status: "Success",
    ipAddress: "192.168.1.103",
    action: "View Details",
  },
  {
    _id: "5",
    dateTime: "2024-11-14T14:10:00Z",
    userName: "James Wilson",
    activityType: "Export",
    module: "Reports",
    description: "Exported crew data to CSV",
    status: "Success",
    ipAddress: "192.168.1.104",
    action: "View Details",
  },
  {
    _id: "6",
    dateTime: "2024-11-14T11:30:00Z",
    userName: "Fatima Hassan",
    activityType: "Login",
    module: "Authentication",
    description: "Failed login attempt",
    status: "Failed",
    ipAddress: "192.168.1.105",
    action: "View Details",
  },
  {
    _id: "7",
    dateTime: "2024-11-14T10:00:00Z",
    userName: "Roberto Silva",
    activityType: "Update",
    module: "Port Management",
    description: "Updated port information",
    status: "Success",
    ipAddress: "192.168.1.106",
    action: "View Details",
  },
  {
    _id: "8",
    dateTime: "2024-11-13T15:45:00Z",
    userName: "Yuki Tanaka",
    activityType: "Create",
    module: "Billing Entity",
    description: "Created new billing entity",
    status: "Success",
    ipAddress: "192.168.1.107",
    action: "View Details",
  },
];

const ActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState(initialActivityLogs);
  const [viewModal, setViewModal] = useState(null);

  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
    sortOrder: -1,
    sortBy: 'dateTime',
  });

  const cols = [
    {
      name: 'Date/Time',
      selector: 'dateTime',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      cell: DateFormat,
      width: '180',
    },
    {
      name: 'User Name',
      selector: 'userName',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
    },
    {
      name: 'Activity Type',
      selector: 'activityType',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '130',
    },
    {
      name: 'Module',
      selector: 'module',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
    },
    {
      name: 'Description',
      selector: 'description',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '250',
    },
    {
      name: 'Status',
      selector: 'status',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '120',
    },
    {
      name: 'IP Address',
      selector: 'ipAddress',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '130',
    },
    {
      name: 'Action',
      selector: 'action',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      cell: (props) => <RenderAction {...props} onViewClick={handleViewClick} />,
      width: '100',
      notView: true,
    },
  ];

  const handleViewClick = (row) => {
    setViewModal(row);
  };

  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Activity Log"
              isAddEnabled={false}
              addModalLabel="Add Activity Log"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={activityLogs.length}
            columns={cols}
            data={activityLogs ?? []}
            onPageChange={(currentPage) =>
              setParams({ ...params, page: currentPage })
            }
            setLimit={(newlimit) => setParams({ ...params, limit: newlimit })}
            onSorting={(sortBy) => {
              setParams({
                ...params,
                sortBy,
                sortOrder: params?.sortOrder === -1 ? 1 : -1,
                page: 1,
              });
            }}
            onView={handleViewClick}
          />
        </div>
      </div>

      {!!viewModal && (
        <ViewActivityLogModal
          showModal={viewModal}
          closeModal={() => setViewModal(null)}
        />
      )}
    </>
  );
};

export default ActivityLog;

