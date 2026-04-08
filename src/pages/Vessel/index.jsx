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
    sortBy: "vessel_name",
  });

  const [filters, setFilters] = useState({
    vesselType: "",
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
    };

    getVessels({ params: apiParams });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.page, params.limit, params.search, params.sortBy, params.sortOrder]);


  // ✅ Extract unique values for filter options
  const vesselTypeOptions = useMemo(() => {
    const standard = ["Bulk", "Container", "Carrier", "Tanker"];
    const fromData = vessels
      .map((v) => v.vessel_type ?? v.vesselType)
      .filter(Boolean);
    return [...new Set([...standard, ...fromData])];
  }, [vessels]);

  // ✅ Filter configuration (type filter is client-side on the current page)
  const filterOptions = useMemo(
    () => [
      {
        key: "vesselType",
        label: "Type",
        placeholder: "Select Type",
        options: vesselTypeOptions,
      },
    ],
    [vesselTypeOptions]
  );

  const filteredVessels = useMemo(() => {
    if (!filters.vesselType) return vessels;
    return vessels.filter(
      (v) => (v.vessel_type ?? v.vesselType) === filters.vesselType
    );
  }, [vessels, filters.vesselType]);

  const handleClearFilter = () => {
    setFilters({ vesselType: "" });
    setParams((prev) => ({ ...prev, page: 1 }));
  };

  const cols = useMemo(
    () => [
      {
        name: "Vessel",
        selector: "vessel_name",
        sort: true,
        thclass: "tb-head",
        width: "220",
      },
      {
        name: "Unique ID",
        selector: "vessel_unique_id",
        sort: true,
        thclass: "tb-head",
        width: "160",
      },
      {
        name: "Type",
        selector: "vessel_type",
        sort: true,
        thclass: "tb-head",
        width: "140",
      },
      {
        name: "Billing Entity",
        selector: "billing_entity",
        sort: true,
        thclass: "tb-head",
        width: "200",
      },
      {
        name: "Owner",
        selector: "vessel_owner",
        sort: true,
        thclass: "tb-head",
        width: "180",
      },
      {
        name: "Manager",
        selector: "vessel_manager",
        sort: true,
        thclass: "tb-head",
        width: "180",
      },
      {
        name: "Principal",
        selector: "vessel_principal",
        sort: true,
        thclass: "tb-head",
        width: "180",
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
        width: "100",
      },
      {
        name: "Days to MWP expiry",
        selector: "days_to_expiry",
        sort: true,
        thclass: "tb-head",
        width: "160",
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
        width: "180",
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
            Sl={false}
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
              key={
                showVesselModal === true
                  ? "vessel-add"
                  : String(
                    showVesselModal?.vessel_id ??
                    showVesselModal?._id ??
                    "vessel-edit"
                  )
              }
              showModal={showVesselModal}
              closeModal={() => setShowVesselModal(false)}
              callBack={() =>
                getVessels({
                  params: {
                    page: 1,
                    limit: 10,
                    search: "",
                    sortBy: "vessel_name",
                  },
                })
              }
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
