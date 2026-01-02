import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { RoleModal } from "./Modals/AddEditRole";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { ROLE_OPTIONS, getRoleDescription } from "../../constants/roles";

const dummyRoles = ROLE_OPTIONS.map((role, index) => ({
  _id: `${index + 1}`,
  name: role,
  description: getRoleDescription(role),
}));


const Role = () => {
  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "name",
    sortOrder: 1,
  });

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  // 👉 ONLY TWO COLUMNS (Name + Description)
  const cols = [
    {
      name: "Name",
      selector: "name",
      sort: true,
      width: "300",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Description",
      selector: "description",
      sort: true,
      width: "500",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: 'Actions',
      selector: 'linksInfo',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      onEditClick: (row) => { setShowRoleModal(row) },
      onDeleteClick: () => { setShowDeleteModal(true) },
      cell: RenderAction,
      width: '200',
    },
  ];

  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Roles"
              isAddEnabled
              addModalLabel="Add Role"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1 })
              }
              onAddModalClick={() => setShowRoleModal(true)}
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            Sl
            pagination={{ currentPage: params.page, limit: params.limit }}
            tableClasses="px-start"
            count={dummyRoles.length}
            columns={cols}
            data={dummyRoles}
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

          {!!showRoleModal && (
            <RoleModal
              showModal={showRoleModal}
              closeModal={() => setShowRoleModal(false)}
            />
          )}
          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={() => { }}
              deleteText="Are you sure you want to delete this role?"
            // isLoading={isBeingUpdated}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Role;
