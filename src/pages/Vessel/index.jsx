
import { useState } from "react";
import { DateFormat, RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { VesselModal } from "./Modals/AddEditVessel";

const dummyVessels = [
  {
    _id: "1",
    billingEntity: "Billing Entity 1",
    vesselType: "Foreign Flag Vessel",
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

  const [showVesselModal, setShowVesselModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVesselForDelete, setSelectedVesselForDelete] = useState(null);

  const cols = [
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
      name: 'Vessel Type',
      selector: 'vesselType',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Vessel Name',
      selector: 'vesselName',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Flag State',
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
      width: '150',
    },
    {
      name: 'Call Sign',
      selector: 'callSign',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '120',
    },
    {
      name: 'Year Built',
      selector: 'yearBuilt',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '120',
    },
    {
      name: 'Class Society',
      selector: 'classSociety',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '180',
    },
    {
      name: 'P&I Club',
      selector: 'pnIClub',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '180',
    },
    {
      name: 'Length Overall',
      selector: 'lengthOverall',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '150',
    },
    {
      name: 'Beam',
      selector: 'beam',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '120',
    },
    {
      name: 'Draft',
      selector: 'draft',
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
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={dummyVessels.length}
            columns={cols}
            data={dummyVessels}
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
