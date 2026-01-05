import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { CheckListModal } from "./Modals/AddEditCheckList";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const dummyCheckLists = [
  { _id: "1", name: "Pre-Arrival Checklist", description: "Checklist for vessel pre-arrival procedures" },
  { _id: "2", name: "Cargo Operations", description: "Checklist for cargo handling operations" },
  { _id: "3", name: "Safety Inspection", description: "Safety and security inspection checklist" },
  { _id: "4", name: "Departure Checklist", description: "Checklist for vessel departure procedures" },
  { _id: "5", name: "Emergency Procedures", description: "Emergency response and procedures checklist" },
];

const CheckList = () => {
  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "name",
    sortOrder: 1,
  });

  const [showCheckListModal, setShowCheckListModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 👉 COLUMNS (Name + Description + Actions)
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
      onEditClick: (row) => { setShowCheckListModal(row) },
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
              tableTitle="CheckList"
              isAddEnabled
              addModalLabel="Add Checklist"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1 })
              }
              onAddModalClick={() => setShowCheckListModal(true)}
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            Sl
            pagination={{ currentPage: params.page, limit: params.limit }}
            tableClasses="px-start"
            count={dummyCheckLists.length}
            columns={cols}
            data={dummyCheckLists}
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

          {!!showCheckListModal && (
            <CheckListModal
              showModal={showCheckListModal}
              closeModal={() => setShowCheckListModal(false)}
            />
          )}
          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={() => { }}
              deleteText="Are you sure you want to delete this checklist?"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CheckList;
