import { useState, useEffect } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { CheckListModal } from "./Modals/AddEditCheckList";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import useCommonReducer from "../../store/CommonReducer";
import useCheckListReducer from "../../store/CheckListReducer";



const CheckList = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "checklist_name",
    sortOrder: 1,
  });

  const [showCheckListModal, setShowCheckListModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    getCallTypes,
    callTypes,
  } = useCommonReducer((state) => state);

  const {
    getChecklists,
    CheckLists,
    checklistCount
  } = useCheckListReducer((state) => state);

  console.log("CheckLists", CheckLists);

  useEffect(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
    };
    getChecklists({ params: apiParams });
  }, [params]);

  useEffect(() => {
    getCallTypes();
  }, []);

  // 👉 COLUMNS (Checklist Name + Call Type + Vessel Type + Barge Type + Sections + Actions)
  const cols = [
    {
      name: "Name",
      selector: "checklist_name",
      sort: true,
      width: "250",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Call Type",
      selector: "call_type",
      sort: true,
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Vessel Type",
      selector: "vessel_type",
      sort: true,
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Barge Type",
      selector: "barge_type",
      sort: true,
      width: "150",
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
      width: '100',
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
                setParams({ ...params, search: e, page: 1 })
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
            count={checklistCount}
            columns={cols}
            data={CheckLists ?? []}
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
              callTypesOptions={callTypes}
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
