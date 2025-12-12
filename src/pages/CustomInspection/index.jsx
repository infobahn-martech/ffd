
import { useState } from "react";
import { DateFormat, RenderAction, EditableStatus } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { ViewCustomInspectionModal } from "./Modals/ViewCustomInspection";
import "./CustomInspection.scss";

const initialInspections = [
  {
    _id: "1",
    billingEntity: "Sedres Maritime Co.",
    vesselName: "MV Ocean Star",
    portName: "Dammam Port",
    typeOfCall: "Import",
    ata: "2024-11-15T08:30:00Z",
    status: "commenced",
  },
  {
    _id: "2",
    billingEntity: "Al Fajr Shipping LLC",
    vesselName: "MV Red Sea",
    portName: "Al Jubail Commercial Sea Port",
    typeOfCall: "Export",
    ata: "2024-11-14T14:20:00Z",
    status: "passed",
  },
  {
    _id: "3",
    billingEntity: "Global Port Services",
    vesselName: "SV Wind Runner",
    portName: "Ras Tanura Refinery",
    typeOfCall: "Import",
    ata: "2024-11-13T10:15:00Z",
    status: "failed",
  },
  {
    _id: "4",
    billingEntity: "Ocean Waves Logistics",
    vesselName: "MV Arabian Gulf",
    portName: "Al Khafji Port",
    typeOfCall: "Export",
    ata: "2024-11-12T16:45:00Z",
    status: "commenced",
  },
  {
    _id: "5",
    billingEntity: "Blue Horizon Freight",
    vesselName: "MV Desert Star",
    portName: "As Safaniya Port",
    typeOfCall: "Import",
    ata: "2024-11-11T09:00:00Z",
    status: "passed",
  },
  {
    _id: "6",
    billingEntity: "Desert Star Logistics",
    vesselName: "MV Cargo Express",
    portName: "Dammam Port",
    typeOfCall: "Export",
    ata: "2024-11-10T11:30:00Z",
    status: "commenced",
  },
  {
    _id: "7",
    billingEntity: "PortLink Arabia",
    vesselName: "MV Trade Wind",
    portName: "Al Jubail Commercial Sea Port",
    typeOfCall: "Import",
    ata: "2024-11-09T13:20:00Z",
    status: "passed",
  },
  {
    _id: "8",
    billingEntity: "CargoMax Trading",
    vesselName: "MV Sea Breeze",
    portName: "Ras Tanura Refinery",
    typeOfCall: "Export",
    ata: "2024-11-08T15:10:00Z",
    status: "failed",
  },
];

const CustomInspection = () => {
  const [inspections, setInspections] = useState(initialInspections);
  const [viewModal, setViewModal] = useState(null);

  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
    sortOrder: -1,
    sortBy: 'ata',
  });

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
      name: 'Vessel Name',
      selector: 'vesselName',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Port Name',
      selector: 'portName',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Type of Call',
      selector: 'typeOfCall',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
    },
    {
      name: 'ATA',
      selector: 'ata',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      sort: true,
      cell: DateFormat,
      width: '200',
    },
    {
      name: 'Status',
      selector: 'status',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      sort: true,
      cell: (props) => <EditableStatus {...props} onStatusChange={handleStatusChange} />,
      width: '150',
      notView: true,
    },
    {
      name: 'Action',
      selector: 'action',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      cell: (props) => <RenderAction {...props} onViewClick={handleViewClick} />,
      width: '100',
      notView: true,
    },
  ];

  const handleViewClick = (row) => {
    setViewModal(row);
  };

  const handleStatusChange = (row, newStatus) => {
    setInspections((prev) =>
      prev.map((item) =>
        item._id === row._id ? { ...item, status: newStatus } : item
      )
    );
    // TODO: Add API call to update status
    console.log("Status updated:", row._id, newStatus);
  };

  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Custom Inspection"
              isAddEnabled={false}
              addModalLabel="Add Custom Inspection"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={inspections.length}
            columns={cols}
            data={inspections ?? []}
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
            onView={handleViewClick}
          />
        </div>
      </div>

      {!!viewModal && (
        <ViewCustomInspectionModal
          showModal={viewModal}
          closeModal={() => setViewModal(null)}
        />
      )}
    </>
  );
};

export default CustomInspection;

