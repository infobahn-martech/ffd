import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { UserModal } from "./Modals/AddEditUser";
import { RenderAction, RenderName } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { ROLE_OPTIONS } from "../../constants/roles";
import { PORT_DETAILS } from "../../constants/ports";

const dummyUsers = [
  {
    _id: "1",
    role: ROLE_OPTIONS[0],
    firstName: "Ajay",
    lastName: "Ullas",
    email: "ajay.ullas@example.com",
    phone: "+971500000001",
    address: PORT_DETAILS[0].city,
    avatar: "https://ui-avatars.com/api/?name=Ajay+Ullas&background=00368c&color=fff",
    status: "Active",
  },
  {
    _id: "2",
    role: ROLE_OPTIONS[1],
    firstName: "Nikhil",
    lastName: "Varma",
    email: "nikhil.varma@example.com",
    phone: "+971500000002",
    address: PORT_DETAILS[1].city,
    avatar: "https://ui-avatars.com/api/?name=Nikhil+Varma&background=00368c&color=fff",
    status: "Inactive",
  },
  {
    _id: "3",
    role: ROLE_OPTIONS[2],
    firstName: "Sangeeth",
    lastName: "Babu",
    email: "sangeeth.babu@example.com",
    phone: "+971500000003",
    address: PORT_DETAILS[2].city,
    avatar: "https://ui-avatars.com/api/?name=Sangeeth+Babu&background=00368c&color=fff",
    status: "Pending",
  },
  {
    _id: "4",
    role: ROLE_OPTIONS[3],
    firstName: "Vishnu",
    lastName: "Menon",
    email: "vishnu.menon@example.com",
    phone: "+971500000004",
    address: PORT_DETAILS[3].city,
    avatar: "https://ui-avatars.com/api/?name=Vishnu+Menon&background=00368c&color=fff",
    status: "Active",
  },
  {
    _id: "5",
    role: ROLE_OPTIONS[4],
    firstName: "Riya",
    lastName: "Thomas",
    email: "riya.thomas@example.com",
    phone: "+971500000005",
    address: PORT_DETAILS[4].city,
    avatar: "https://ui-avatars.com/api/?name=Riya+Thomas&background=00368c&color=fff",
    status: "Inactive",
  },
  {
    _id: "6",
    role: ROLE_OPTIONS[5],
    firstName: "Deepak",
    lastName: "Kumar",
    email: "deepak.kumar@example.com",
    phone: "+971500000006",
    address: PORT_DETAILS[0].city,
    avatar: "https://ui-avatars.com/api/?name=Deepak+Kumar&background=00368c&color=fff",
    status: "Pending",
  },
  {
    _id: "7",
    role: ROLE_OPTIONS[6],
    firstName: "Meera",
    lastName: "Suresh",
    email: "meera.suresh@example.com",
    phone: "+971500000007",
    address: PORT_DETAILS[1].city,
    avatar: "https://ui-avatars.com/api/?name=Meera+Suresh&background=00368c&color=fff",
    status: "Active",
  },
  {
    _id: "8",
    role: ROLE_OPTIONS[7],
    firstName: "Arun",
    lastName: "Joseph",
    email: "arun.joseph@example.com",
    phone: "+971500000008",
    address: PORT_DETAILS[2].city,
    avatar: "https://ui-avatars.com/api/?name=Arun+Joseph&background=00368c&color=fff",
    status: "Inactive",
  },
  {
    _id: "9",
    role: ROLE_OPTIONS[8],
    firstName: "Joel",
    lastName: "Sunny",
    email: "joel.sunny@example.com",
    phone: "+971500000009",
    address: PORT_DETAILS[3].city,
    avatar: "https://ui-avatars.com/api/?name=Joel+Sunny&background=00368c&color=fff",
    status: "Pending",
  },
  {
    _id: "10",
    role: ROLE_OPTIONS[9],
    firstName: "Sandra",
    lastName: "Mathew",
    email: "sandra.mathew@example.com",
    phone: "+971500000010",
    address: PORT_DETAILS[4].city,
    avatar: "https://ui-avatars.com/api/?name=Sandra+Mathew&background=00368c&color=fff",
    status: "Active",
  },
];




const User = () => {
  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "name",
    sortOrder: 1,
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);


  // 👉 ONLY TWO COLUMNS (Name + Description)
  const cols = [
    {
      name: "Name",
      selector: "firstName",
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: RenderName,
      sort: true,
    },
    {
      name: "User Role",
      selector: "role",
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Email",
      selector: "email",
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Phone",
      selector: "phone",
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Address",
      selector: "address",
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Status",
      selector: "status",
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
      cell: ({ row }) => (
        <span
          className={
            row.status === "Active"
              ? "status-active"
              : row.status === "Inactive"
                ? "status-inactive"
                : "status-pending"
          }
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      selector: "linksInfo",
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: RenderAction,
      onEditClick: (row) => setShowUserModal(row),
      onToggleClick: (row) => {
        // Handle toggle active/inactive
        console.log("Toggle user status:", row);
        // TODO: Implement API call to update user status
      },
      onDeleteClick: (row) => {
        setSelectedUser(row);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              showFilter
              tableTitle="Users"
              isAddEnabled
              addModalLabel="Add User"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1 })
              }
              onAddModalClick={() => setShowUserModal(true)}
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            Sl
            pagination={{ currentPage: params.page, limit: params.limit }}
            tableClasses="px-start"
            columns={cols}
            data={dummyUsers}
            count={dummyUsers.length}
            onPageChange={(currentPage) =>
              setParams({ ...params, page: currentPage })
            }
            setLimit={(newLimit) =>
              setParams({ ...params, limit: newLimit })
            }
            onSorting={(sortBy) =>
              setParams({
                ...params,
                sortBy,
                sortOrder: params.sortOrder === 1 ? -1 : 1,
                page: 1,
              })
            }
          />

          {!!showUserModal && (
            <UserModal
              showModal={showUserModal}
              closeModal={() => setShowUserModal(false)}
            />
          )}
          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              onConfirm={() => {
                // TODO: Implement API call to archive user
                console.log("Archive user:", selectedUser);
                setShowDeleteModal(false);
                setSelectedUser(null);
              }}
              deleteText="Are you sure you want to archive this user?"
            // isLoading={isBeingUpdated}
            />
          )}

        </div>
      </div>
    </>
  );
};

export default User;
