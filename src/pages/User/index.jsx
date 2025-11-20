import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { UserModal } from "./Modals/AddEditUser";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const dummyRoles = [
  { _id: "1", name: "Admin", description: "Full system access" },
  { _id: "2", name: "Manager", description: "Manage users and workflows" },
  { _id: "3", name: "Viewer", description: "Read-only access" },
  { _id: "4", name: "Operator", description: "Handle daily operations" },
  { _id: "5", name: "Supervisor", description: "Review and approve tasks" },
  { _id: "6", name: "Coordinator", description: "Coordinate tasks between teams" },
  { _id: "7", name: "Auditor", description: "Review logs and compliance checks" },
  { _id: "8", name: "Support Staff", description: "Assist users with issues and queries" },
  { _id: "9", name: "Quality Analyst", description: "Monitor and ensure process quality" },
  { _id: "10", name: "Data Entry", description: "Enter and update system records" },
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
      onEditClick:(row)=>{setShowUserModal(row)},
      onDeleteClick:()=>{setShowDeleteModal(true)},
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

          {!!showUserModal && (
            <UserModal
              showModal={showUserModal}
              closeModal={() => setShowUserModal(false)}
            />
          )}
           {!!showDeleteModal && (
                             <DeleteConfirmationModal
                                    show={showDeleteModal}
                                    onCancel={()=>setShowDeleteModal(false)}
                                    onConfirm={()=>{}}
                                    deleteText="Are you sure you want to delete this user?"
                                    // isLoading={isBeingUpdated}
                                  />
                            )}
          
        </div>
      </div>
    </>
  );
};

export default User;
