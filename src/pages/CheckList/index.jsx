import { useState, useEffect, useMemo } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { CheckListModal } from "./Modals/AddEditCheckList";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import useCommonReducer from "../../store/CommonReducer";
import useCheckListReducer from "../../store/CheckListReducer";
import useVesselTypeReducer from "../../store/VesselTypeReducer";
import useBargeTypeReducer from "../../store/BargeTypeReducer";

const CheckList = () => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: "",
    sortBy: "checklist_name",
    sortOrder: 1,
  });

  const [filters, setFilters] = useState({
    call_type_id: "",
    vessel_type_id: "",
    barge_type_id: "",
  });

  const [showCheckListModal, setShowCheckListModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { getCallTypes, callTypes } = useCommonReducer((state) => state);
  const { vesselTypes, getVesselTypes } = useVesselTypeReducer((state) => state);
  const { bargeTypes, getBargeTypes } = useBargeTypeReducer((state) => state);

  const {
    getChecklists,
    getChecklistById,
    CheckLists,
    checklistCount
  } = useCheckListReducer((state) => state);

  const handleEditClick = (row) => {
    const checklistTypeId = row?.checklist_type_id ?? row?._id;
    if (!checklistTypeId) {
      setShowCheckListModal(row);
      return;
    }
    getChecklistById({
      checklist_type_id: checklistTypeId,
      cb: (data) => setShowCheckListModal(data ?? row)
    });
  };

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
    getVesselTypes({ params: { limit: 1000 } });
    getBargeTypes({ params: { limit: 1000 } });
  }, []);

  useEffect(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      ...(params.search && { search: params.search }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(filters.call_type_id && { call_type_id: filters.call_type_id }),
      ...(filters.vessel_type_id && { vessel_type_id: filters.vessel_type_id }),
      ...(filters.barge_type_id && { barge_type_id: filters.barge_type_id }),
    };
    getChecklists({ params: apiParams });
  }, [params.page, params.limit, params.search, params.sortBy, params.sortOrder, filters.call_type_id, filters.vessel_type_id, filters.barge_type_id]);

  const filterOptions = useMemo(
    () => [
      {
        key: "call_type_id",
        label: "Call Type",
        placeholder: "Select Call Type",
        options: (callTypes ?? []).map((c) => ({
          value: String(c?.call_type_id ?? c?._id ?? ""),
          label: c?.call_type ?? c?.name ?? "",
        })),
      },
      {
        key: "vessel_type_id",
        label: "Vessel Type",
        placeholder: "Select Vessel Type",
        options: (vesselTypes ?? []).map((v) => ({
          value: String(v?.vessel_type_id ?? v?._id ?? ""),
          label: v?.vessel_type ?? v?.name ?? "",
        })),
      },
      {
        key: "barge_type_id",
        label: "Barge Type",
        placeholder: "Select Barge Type",
        options: (bargeTypes ?? []).map((b) => ({
          value: String(b?.barge_type_id ?? b?._id ?? ""),
          label: b?.barge_type ?? b?.name ?? "",
        })),
      },
    ],
    [callTypes, vesselTypes, bargeTypes]
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilter = () => {
    setFilters({ call_type_id: "", vessel_type_id: "", barge_type_id: "" });
    setParams((prev) => ({ ...prev, page: 1 }));
  };

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
      onEditClick: handleEditClick,
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
                setParams((prev) => ({ ...prev, search: e, page: 1 }))
              }
              onAddModalClick={() => setShowCheckListModal(true)}
              exportTitle="Export"
              exportLoader={false}
              showFilter={true}
              filterOptions={filterOptions}
              filterValue={filters}
              onFilterChange={handleFilterChange}
              onApplyFilter={() => {}}
              onClearFilter={handleClearFilter}
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
              key={showCheckListModal?._id ?? "new"}
              showModal={showCheckListModal}
              closeModal={() => setShowCheckListModal(false)}
              callTypesOptions={callTypes}
              onSuccess={() => {
                const apiParams = {
                  page: params.page,
                  limit: params.limit,
                  ...(params.search && { search: params.search }),
                  ...(params.sortBy && { sortBy: params.sortBy }),
                  ...(filters.call_type_id && { call_type_id: filters.call_type_id }),
                  ...(filters.vessel_type_id && { vessel_type_id: filters.vessel_type_id }),
                  ...(filters.barge_type_id && { barge_type_id: filters.barge_type_id }),
                };
                getChecklists({ params: apiParams });
              }}
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
