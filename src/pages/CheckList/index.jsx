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

/** API returns null for absent FKs; Number(null) is 0 and breaks vessel/barge exclusivity in the edit form. */
function optionalTypeId(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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
  const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);

  const { getCallTypes, callTypes } = useCommonReducer((state) => state);
  const { vesselTypes, getVesselTypes } = useVesselTypeReducer((state) => state);
  const { bargeTypes, getBargeTypes } = useBargeTypeReducer((state) => state);

  const {
    getChecklists,
    getChecklistById,
    deleteChecklist,
    CheckLists,
    checklistCount,
    deleteLoader,
  } = useCheckListReducer((state) => state);

  const handleEditClick = (row) => {
    const checklistTypeId = row?.checklist_type_id ?? row?._id;
    if (!checklistTypeId) {
      setShowCheckListModal(row);
      return;
    }
    getChecklistById({
      checklist_type_id: checklistTypeId,
      cb: (res) => {
        const details = res?.checklist_details;
        if (!details) {
          setShowCheckListModal(row);
          return;
        }
        const mappedEditData = {
          checklist_type_id: Number(details.checklist_type_id ?? checklistTypeId),
          call_type_id: Number(details.call_type_id),
          vessel_type_id: optionalTypeId(details.vessel_type_id),
          tug_type_id: optionalTypeId(details.tug_type_id),
          barge_type_id: optionalTypeId(details.barge_type_id),
          port_id: optionalTypeId(details.port_id),
          checklist_name: details.checklist_name,
          sections: res?.data ?? []
        };
        setShowCheckListModal(mappedEditData);
      }
    });
  };

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
      name: "Port Name",
      selector: "port",
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
      onDeleteClick: (row) => {
        setSelectedRowForDelete(row);
        setShowDeleteModal(true);
      },
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
              filterOptions={filterOptions}
              filterValue={filters}
              onFilterChange={handleFilterChange}
              onApplyFilter={() => { }}
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
              key={showCheckListModal?.checklist_type_id ?? "new"}
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
              isLoading={deleteLoader}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedRowForDelete(null);
              }}
              onConfirm={() => {
                const checklist_type_id =
                  selectedRowForDelete?.checklist_type_id ??
                  selectedRowForDelete?._id;
                if (!checklist_type_id) return;
                deleteChecklist({
                  checklist_type_id,
                  cb: () => {
                    setShowDeleteModal(false);
                    setSelectedRowForDelete(null);
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
                  },
                });
              }}
              deleteText="Are you sure you want to delete this checklist?"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default CheckList;
