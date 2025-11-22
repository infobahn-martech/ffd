import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { UserModal } from "./Modals/AddEditUser";
import { RenderAction, RenderName } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { ROLE_OPTIONS } from "../../constants/roles";
import { PORT_OPTIONS, PORT_DETAILS } from "../../constants/ports";
import StatusConfirmationModal from "../../components/StatusConfirmationModal";

const dummyUsers = [
  {
    _id: "1",
    port: PORT_OPTIONS[0],
    role: ROLE_OPTIONS[0],
    firstName: "Ajay",
    lastName: "Ullas",
    email: "ajay.ullas@example.com",
    phone: "+971500000001",
    address: PORT_DETAILS[0].city,
    avatar: "https://ui-avatars.com/api/?name=Ajay+Ullas&background=00368c&color=fff",
  },
  {
    _id: "2",
    port: PORT_OPTIONS[1],
    role: ROLE_OPTIONS[1],
    firstName: "Nikhil",
    lastName: "Varma",
    email: "nikhil.varma@example.com",
    phone: "+971500000002",
    address: PORT_DETAILS[1].city,
    avatar: "https://ui-avatars.com/api/?name=Nikhil+Varma&background=00368c&color=fff",
  },
  {
    _id: "3",
    port: PORT_OPTIONS[2],
    role: ROLE_OPTIONS[2],
    firstName: "Sangeeth",
    lastName: "Babu",
    email: "sangeeth.babu@example.com",
    phone: "+971500000003",
    address: PORT_DETAILS[2].city,
    avatar: "https://ui-avatars.com/api/?name=Sangeeth+Babu&background=00368c&color=fff",
  },
  {
    _id: "4",
    port: PORT_OPTIONS[3],
    role: ROLE_OPTIONS[3],
    firstName: "Vishnu",
    lastName: "Menon",
    email: "vishnu.menon@example.com",
    phone: "+971500000004",
    address: PORT_DETAILS[3].city,
    avatar: "https://ui-avatars.com/api/?name=Vishnu+Menon&background=00368c&color=fff",
  },
  {
    _id: "5",
    port: PORT_OPTIONS[4],
    role: ROLE_OPTIONS[4],
    firstName: "Riya",
    lastName: "Thomas",
    email: "riya.thomas@example.com",
    phone: "+971500000005",
    address: PORT_DETAILS[4].city,
    avatar: "https://ui-avatars.com/api/?name=Riya+Thomas&background=00368c&color=fff",
  },
  {
    _id: "6",
    port: PORT_OPTIONS[0],
    role: ROLE_OPTIONS[5],
    firstName: "Deepak",
    lastName: "Kumar",
    email: "deepak.kumar@example.com",
    phone: "+971500000006",
    address: PORT_DETAILS[0].city,
    avatar: "https://ui-avatars.com/api/?name=Deepak+Kumar&background=00368c&color=fff",
  },
  {
    _id: "7",
    port: PORT_OPTIONS[1],
    role: ROLE_OPTIONS[6],
    firstName: "Meera",
    lastName: "Suresh",
    email: "meera.suresh@example.com",
    phone: "+971500000007",
    address: PORT_DETAILS[1].city,
    avatar: "https://ui-avatars.com/api/?name=Meera+Suresh&background=00368c&color=fff",
  },
  {
    _id: "8",
    port: PORT_OPTIONS[2],
    role: ROLE_OPTIONS[7],
    firstName: "Arun",
    lastName: "Joseph",
    email: "arun.joseph@example.com",
    phone: "+971500000008",
    address: PORT_DETAILS[2].city,
    avatar: "https://ui-avatars.com/api/?name=Arun+Joseph&background=00368c&color=fff",
  },
  {
    _id: "9",
    port: PORT_OPTIONS[3],
    role: ROLE_OPTIONS[8],
    firstName: "Joel",
    lastName: "Sunny",
    email: "joel.sunny@example.com",
    phone: "+971500000009",
    address: PORT_DETAILS[3].city,
    avatar: "https://ui-avatars.com/api/?name=Joel+Sunny&background=00368c&color=fff",
  },
  {
    _id: "10",
    port: PORT_OPTIONS[4],
    role: ROLE_OPTIONS[9],
    firstName: "Sandra",
    lastName: "Mathew",
    email: "sandra.mathew@example.com",
    phone: "+971500000010",
    address: PORT_DETAILS[4].city,
    avatar: "https://ui-avatars.com/api/?name=Sandra+Mathew&background=00368c&color=fff",
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
  const [showStatusModal, setShowStatusModal] = useState(false);


  // 👉 ONLY TWO COLUMNS (Name + Description)
  const cols = [
    {
      name: "Name",
      selector: "firstName",
      width: "250",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: RenderName,
      sort: true,
    },
    {
      name: "Port",
      selector: "port",
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "User Role",
      selector: "role",
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Email",
      selector: "email",
      width: "250",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Phone",
      selector: "phone",
      width: "180",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Address",
      selector: "address",
      width: "300",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
    },
    {
      name: "Actions",
      selector: "linksInfo",
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: RenderAction,
      onEditClick: (row) => setShowUserModal(row),
      onStatusClick: (row) => setShowStatusModal(true),
      onDeleteClick: () => setShowDeleteModal(true),
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
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={() => { }}
              deleteText="Are you sure you want to delete this user?"
            // isLoading={isBeingUpdated}
            />
          )}

          {!!showStatusModal && (
            <StatusConfirmationModal
              show={showStatusModal}
              onCancel={() => setShowStatusModal(false)}
              onConfirm={() => { }}
              statusText="Are you sure you want to deactivate this user?"
            // isLoading={isBeingUpdated}
            />
          )}

        </div>
      </div>
    </>
  );
};

export default User;
