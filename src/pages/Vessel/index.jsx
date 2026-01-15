
import { useState, useMemo } from "react";
import { RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { VesselModal } from "./Modals/AddEditVessel";
import { ViewVesselModal } from "./Modals/ViewVessel";

const dummyVessels = [
  {
    _id: "1",
    billingEntity: "Billing Entity 1",
    vesselType: "Foreign Flag Vessel",
    bargeType: "Barge Import",
    vesselName: "MV Ocean Star",
    flagState: "Liberia",
    grossTonnage: "15,000",
    callSign: "A3XY4",
    yearBuilt: "2010",
    classSociety: "Lloyd's Register",
    pnIClub: "North P&I Club",
    lengthOverall: "150.5",
    beam: "25.3",
    draft: "8.5",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    billingEntity: "Billing Entity 2",
    vesselType: "Saudi Flag Vessel",
    bargeType: "Flat Barge Import",
    vesselName: "MV Red Sea",
    flagState: "Saudi Arabia",
    grossTonnage: "12,500",
    callSign: "B4ZW5",
    yearBuilt: "2015",
    classSociety: "DNV",
    pnIClub: "Gard",
    lengthOverall: "135.2",
    beam: "22.8",
    draft: "7.8",
    createdAt: "2024-01-16T11:20:00Z",
  },
  {
    _id: "3",
    billingEntity: "Billing Entity 1",
    vesselType: "Small Boat",
    bargeType: "Jack Up Barge",
    vesselName: "SV Wind Runner",
    flagState: "UAE",
    grossTonnage: "500",
    callSign: "C5AB6",
    yearBuilt: "2020",
    classSociety: "ABS",
    pnIClub: "Standard Club",
    lengthOverall: "45.0",
    beam: "12.0",
    draft: "3.5",
    createdAt: "2024-01-17T09:15:00Z",
  },
  {
    _id: "4",
    billingEntity: "Billing Entity 3",
    vesselType: "Taxi Tug Temp Import",
    bargeType: "Barge Import",
    vesselName: "TT Harbor Master",
    flagState: "Bahrain",
    grossTonnage: "800",
    callSign: "D6CD7",
    yearBuilt: "2018",
    classSociety: "Bureau Veritas",
    pnIClub: "West of England",
    lengthOverall: "35.5",
    beam: "10.5",
    draft: "4.2",
    createdAt: "2024-01-18T14:45:00Z",
  },
  {
    _id: "5",
    billingEntity: "Billing Entity 2",
    vesselType: "Foreign Flag Vessel",
    bargeType: "Flat Barge Import",
    vesselName: "MV Atlantic Voyager",
    flagState: "Panama",
    grossTonnage: "18,500",
    callSign: "E7EF8",
    yearBuilt: "2012",
    classSociety: "Lloyd's Register",
    pnIClub: "North P&I Club",
    lengthOverall: "165.8",
    beam: "28.4",
    draft: "9.2",
    createdAt: "2024-01-19T08:20:00Z",
  },
  {
    _id: "6",
    billingEntity: "Billing Entity 1",
    vesselType: "Saudi Flag Vessel",
    bargeType: "Jack Up Barge",
    vesselName: "MV Desert Storm",
    flagState: "Saudi Arabia",
    grossTonnage: "14,200",
    callSign: "F8FG9",
    yearBuilt: "2016",
    classSociety: "DNV",
    pnIClub: "Gard",
    lengthOverall: "142.6",
    beam: "24.1",
    draft: "8.1",
    createdAt: "2024-01-20T11:30:00Z",
  },
  {
    _id: "7",
    billingEntity: "Billing Entity 3",
    vesselType: "Small Boat",
    bargeType: "Barge Import",
    vesselName: "SV Coastal Express",
    flagState: "Oman",
    grossTonnage: "650",
    callSign: "G9GH0",
    yearBuilt: "2021",
    classSociety: "ABS",
    pnIClub: "Standard Club",
    lengthOverall: "48.3",
    beam: "13.2",
    draft: "3.8",
    createdAt: "2024-01-21T09:15:00Z",
  },
  {
    _id: "8",
    billingEntity: "Billing Entity 2",
    vesselType: "Taxi Tug Temp Import",
    bargeType: "Flat Barge Import",
    vesselName: "TT Port Authority",
    flagState: "Qatar",
    grossTonnage: "950",
    callSign: "H0HI1",
    yearBuilt: "2019",
    classSociety: "Bureau Veritas",
    pnIClub: "West of England",
    lengthOverall: "38.7",
    beam: "11.2",
    draft: "4.5",
    createdAt: "2024-01-22T13:45:00Z",
  },
  {
    _id: "9",
    billingEntity: "Billing Entity 1",
    vesselType: "Foreign Flag Vessel",
    bargeType: "Jack Up Barge",
    vesselName: "MV Pacific Star",
    flagState: "Singapore",
    grossTonnage: "20,000",
    callSign: "I1IJ2",
    yearBuilt: "2011",
    classSociety: "Lloyd's Register",
    pnIClub: "North P&I Club",
    lengthOverall: "175.2",
    beam: "30.1",
    draft: "9.8",
    createdAt: "2024-01-23T10:00:00Z",
  },
  {
    _id: "10",
    billingEntity: "Billing Entity 3",
    vesselType: "Small Boat",
    bargeType: "Barge Import",
    vesselName: "SV Blue Horizon",
    flagState: "Kuwait",
    grossTonnage: "720",
    callSign: "J2JK3",
    yearBuilt: "2022",
    classSociety: "ABS",
    pnIClub: "Standard Club",
    lengthOverall: "52.1",
    beam: "14.5",
    draft: "4.0",
    createdAt: "2024-01-24T15:30:00Z",
  },
];

const Vessel = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
    sortOrder: -1,
    sortBy: 'createdAt',
  });

  const [filters, setFilters] = useState({
    vesselType: '',
    bargeType: '',
  });

  const [showVesselModal, setShowVesselModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVesselForDelete, setSelectedVesselForDelete] = useState(null);
  const [showViewVesselModal, setShowViewVesselModal] = useState(false);

  // Extract unique values for filter options
  const vesselTypeOptions = useMemo(() => {
    const types = [...new Set(dummyVessels.map(v => v.vesselType))];
    return types.sort();
  }, []);

  const bargeTypeOptions = useMemo(() => {
    const types = [...new Set(dummyVessels.map(v => v.bargeType))];
    return types.sort();
  }, []);

  // Filter configuration for CommonFilter
  const filterOptions = [
    {
      key: 'vesselType',
      label: 'Type',
      placeholder: 'Select Type',
      options: vesselTypeOptions,
    },
    {
      key: 'bargeType',
      label: 'Barge Type',
      placeholder: 'Select Barge Type',
      options: bargeTypeOptions,
    },
  ];

  // Filter vessels based on current filters
  const filteredVessels = useMemo(() => {
    let filtered = [...dummyVessels];

    // Apply vessel type filter
    if (filters.vesselType) {
      filtered = filtered.filter(v => v.vesselType === filters.vesselType);
    }

    // Apply barge type filter
    if (filters.bargeType) {
      filtered = filtered.filter(v => v.bargeType === filters.bargeType);
    }

    // Apply search filter
    if (params.searchTerm) {
      const searchLower = params.searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.vesselName?.toLowerCase().includes(searchLower) ||
        v.flagState?.toLowerCase().includes(searchLower) ||
        v.billingEntity?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [filters, params.searchTerm]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    // Reset to page 1 when filter changes
    setParams(prev => ({ ...prev, page: 1 }));
  };

  const handleApplyFilter = () => {
    // Filter is already applied via state, just reset to page 1
    setParams(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilter = () => {
    setFilters({
      vesselType: '',
      bargeType: '',
    });
    setParams(prev => ({ ...prev, page: 1 }));
  };

  const cols = [
    {
      name: 'Vessel',
      selector: 'vesselName',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '250',
    },
    {
      name: 'Type',
      selector: 'vesselType',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Barge Type',
      selector: 'bargeType',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '180',
    },
    {
      name: 'Billing Entity',
      selector: 'billingEntity',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Flag',
      selector: 'flagState',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '150',
    },
    {
      name: 'Gross Tonnage',
      selector: 'grossTonnage',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Year',
      selector: 'yearBuilt',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '120',
    },
    {
      name: 'Actions',
      selector: 'linksInfo',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      onViewClick: (row) => { setShowViewVesselModal(row) },
      onEditClick: (row) => { setShowVesselModal(row) },
      onDeleteClick: (row) => {
        setSelectedVesselForDelete(row);
        setShowDeleteModal(true);
      },
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
              tableTitle="Vessels"
              isAddEnabled
              addModalLabel="Add Vessel"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              onAddModalClick={() => setShowVesselModal(true)}
              exportTitle="Export"
              exportLoader={false}
              filterOptions={filterOptions}
              filterValue={filters}
              onFilterChange={handleFilterChange}
              onApplyFilter={handleApplyFilter}
              onClearFilter={handleClearFilter}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={filteredVessels.length}
            columns={cols}
            data={filteredVessels}
            Sl={true}
            onPageChange={(currentPage) =>
              setParams({ ...params, page: currentPage })
            }
            setLimit={(newlimit) => setParams({ ...params, limit: newlimit })}
            onSorting={(sortBy) => {
              setParams({
                ...params,
                sortBy,
                sortOrder: params?.sortOrder === -1 ? 1 : -1,
                page: 1,
              });
            }}
          />
          {!!showVesselModal && (
            <VesselModal
              showModal={showVesselModal}
              closeModal={() => setShowVesselModal(false)}
            />
          )}

          {showViewVesselModal && (
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
              deleteText={`Are you sure you want to delete this vessel ${selectedVesselForDelete?.vesselName || ''}?`}
            />
          )}


        </div>
      </div>
    </>
  );
};

export default Vessel;
