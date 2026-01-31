import { useState, useMemo, useEffect } from "react";
import { RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { VesselModal } from "./Modals/AddEditVessel";
import { ViewVesselModal } from "./Modals/ViewVessel";
import useVesselReducer from "../../store/VesselReducer";


const Vessel = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    search: "",
    sortOrder: -1,
    sortBy: "createdAt",
  });

  const [filters, setFilters] = useState({
    vesselType: "",
    bargeType: "",
  });

  const [showVesselModal, setShowVesselModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVesselForDelete, setSelectedVesselForDelete] = useState(null);
  const [showViewVesselModal, setShowViewVesselModal] = useState(false);

  const { getVessels, vessels, totalCount, isLoading } = useVesselReducer(
    (state) => state
  );

  // ✅ Fetch vessels
  useEffect(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      ...(params.search ? { search: params.search } : {}),
      ...(params.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params.sortOrder !== null && params.sortOrder !== undefined
        ? { sortOrder: params.sortOrder }
        : {}),
      // If your API supports filter params, you can send them too:
      ...(filters.vesselType ? { vesselType: filters.vesselType } : {}),
      ...(filters.bargeType ? { bargeType: filters.bargeType } : {}),
    };

    getVessels({ params: apiParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.search, params.sortBy, params.sortOrder, filters.vesselType, filters.bargeType]);


  // ✅ Extract unique values for filter options
  const vesselTypeOptions = useMemo(() => {
    const types = vessels
      .map((v) => v.vessel_type ?? v.vesselType)
      .filter(Boolean);
    return [...new Set(types)];
  }, [vessels]);

  const bargeTypeOptions = useMemo(() => {
    const types = vessels
      .map((v) => v.barge_type ?? v.bargeType)
      .filter(Boolean);
    return [...new Set(types)];
  }, [vessels]);

  // ✅ Filter configuration
  const filterOptions = useMemo(
    () => [
      {
        key: "vesselType",
        label: "Type",
        placeholder: "Select Type",
        options: vesselTypeOptions,
      },
      {
        key: "bargeType",
        label: "Barge Type",
        placeholder: "Select Barge Type",
        options: bargeTypeOptions,
      },
    ],
    [vesselTypeOptions, bargeTypeOptions]
  );

  // ✅ Filter + Search in UI (client-side)
  const filteredVessels = useMemo(() => {
    let filtered = [...vessels];

    if (filters.vesselType) {
      filtered = filtered.filter(
        (v) => (v.vessel_type ?? v.vesselType) === filters.vesselType
      );
    }

    if (filters.bargeType) {
      filtered = filtered.filter(
        (v) => (v.barge_type ?? v.bargeType) === filters.bargeType
      );
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter((v) => {
        const vesselName = (v.vessel_name ?? v.vesselName ?? "").toLowerCase();
        const billingEntity = (v.billing_entity ?? v.billingEntity ?? "").toLowerCase();
        return vesselName.includes(searchLower) || billingEntity.includes(searchLower);
      });
    }

    return filtered;
  }, [vessels, filters.vesselType, filters.bargeType, params.search]);

  const handleClearFilter = () => {
    setFilters({ vesselType: "", bargeType: "" });
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const cols = useMemo(
    () => [
      {
        name: "Vessel",
        selector: "vessel_name",
        sort: true,
        thclass: "tb-head",
        width: "250",
      },
      {
        name: "Type",
        selector: "vessel_type",
        sort: true,
        thclass: "tb-head",
        width: "200",
      },
      {
        name: "Billing Entity",
        selector: "billing_entity",
        sort: true,
        thclass: "tb-head",
        width: "200",
      },
      {
        name: "Flag",
        selector: "flag_state",
        sort: true,
        thclass: "tb-head",
        width: "150",
      },
      {
        name: "Gross Tonnage",
        selector: "gross_tonnage",
        sort: true,
        thclass: "tb-head",
        width: "200",
      },
      {
        name: "Year",
        selector: "year_built",
        sort: true,
        thclass: "tb-head",
        width: "120",
      },
      {
        name: "Actions",
        selector: "links_info",
        thclass: "tb-head",
        onViewClick: (row) => setShowViewVesselModal(row),
        onEditClick: (row) => setShowVesselModal(row),
        onDeleteClick: (row) => {
          setSelectedVesselForDelete(row);
          setShowDeleteModal(true);
        },
        cell: RenderAction,
        width: "200",
      },
    ],
    []
  );

  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              // showFilter
              tableTitle="Vessels"
              isAddEnabled
              addModalLabel="Add Vessel"
              setSearch={(e) =>
                setParams((prev) => ({ ...prev, search: e, page: 1, limit: 10 }))
              }
              onAddModalClick={() => setShowVesselModal(true)}
              exportTitle="Export"
              exportLoader={false}
              filterOptions={filterOptions}
              filterValue={filters}
              // If your CommonHeader supports these props, keep them:
              setFilterValue={setFilters}
              onClearFilter={handleClearFilter}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params.page, limit: params.limit }}
            tableClasses="px-start"
            count={totalCount ?? filteredVessels.length}
            columns={cols}
            data={filteredVessels}
            Sl={true}
            loading={isLoading}
            onPageChange={(currentPage) =>
              setParams((prev) => ({ ...prev, page: currentPage }))
            }
            setLimit={(newlimit) =>
              setParams((prev) => ({ ...prev, limit: newlimit }))
            }
            onSorting={(sortBy) => {
              setParams((prev) => ({
                ...prev,
                sortBy,
                sortOrder: prev.sortOrder === -1 ? 1 : -1,
                page: 1,
              }));
            }}
          />

          {!!showVesselModal && (
            <VesselModal
              showModal={showVesselModal}
              closeModal={() => setShowVesselModal(false)}
              callBack={() => getVessels({ params: { page: 1, limit: 10, search: "", sortBy: "createdAt", sortOrder: -1 } })}
            />
          )}

          {!!showViewVesselModal && (
            <ViewVesselModal
              showModal={showViewVesselModal}
              closeModal={() => setShowViewVesselModal(false)}
            />
          )}

          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedVesselForDelete(null);
              }}
              onConfirm={() => {
                console.log("Delete vessel:", selectedVesselForDelete);
                setShowDeleteModal(false);
                setSelectedVesselForDelete(null);
              }}
              deleteText={`Are you sure you want to delete this vessel ${selectedVesselForDelete?.vessel_name ??
                selectedVesselForDelete?.vesselName ??
                ""
                }?`}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Vessel;
