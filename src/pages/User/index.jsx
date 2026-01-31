import { useState, useEffect } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/CustomTable";
import { UserModal } from "./Modals/AddEditUser";
import { PermissionModal } from "../Permission/Modals/AddEditPermission";
import { RenderAction, RenderName } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import useUserReducer from "../../store/UserReducer";

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
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    getUsers,
    users,
    userCount,
    isLoading,
    getUserPermissions,
    userPermissions,
    isLoadingPermissions,
    activateUser,
  } = useUserReducer((state) => state);

  useEffect(() => {
    getUsers({ params });
  }, [params]);


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
      name: "Role",
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
      selector: "user_status",
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
      sort: true,
      cell: ({ row }) => (
        <span
          className={
            row.user_status === "Active"
              ? "status-active"
              : row.user_status === "Inactive"
                ? "status-inactive"
                : "status-pending"
          }
        >
          {row.user_status}
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
        activateUser({ user_id: row?.user_id, cb: () => getUsers({ params }) });
      },
      onPermissionClick: async (row) => {
        setSelectedUser(row);
        await getUserPermissions({ userId: row?.user_id });
        setShowPermissionModal(true);
      },
      onDeleteClick: (row) => {
        setSelectedUser(row);
        setShowDeleteModal(true);
      },
    },
  ];

  console.log("users", users);
  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              // showFilter
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
            data={users ?? []}
            count={userCount ?? 0}
            isLoading={isLoading}
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
              closeModal={() => {
                setShowUserModal(false);
              }}
              onSuccess={() => {
                getUsers({ params });
              }}
            />
          )}
          {!!showPermissionModal && (
            <PermissionModal
              showModal={showPermissionModal}
              closeModal={() => {
                setShowPermissionModal(false);
                setSelectedUser(null);
              }}
              userPermissions={userPermissions}
              isLoadingPermissions={isLoadingPermissions}
              selectedUser={selectedUser}
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
