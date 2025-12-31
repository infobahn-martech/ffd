import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { AppointmentAcceptanceModal } from "./Modals/AddEditAppointmentAcceptance";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { PORT_OPTIONS } from "../../constants/ports";
import { CALL_TYPE_OPTIONS } from "../../constants/callTypes";

// Dummy data for demonstration
const dummyAppointmentAcceptances = [
  {
    _id: "1",
    port: "Dammam Port",
    callType: "Port Call",
    subject: "<p>Vessel Arrival Confirmation</p>",
    body: "<p>This is to confirm the arrival of the vessel at Dammam Port. All necessary documentation has been submitted and verified. The vessel is expected to arrive on schedule.</p>",
  },
  {
    _id: "2",
    port: "Al Jubail Commercial Sea Port",
    callType: "Bunkering",
    subject: "<p>Bunkering Request</p>",
    body: "<p>Request for bunkering services at Al Jubail Port. Vessel requires 500 tons of marine fuel oil and 200 tons of diesel. Please confirm availability and schedule.</p>",
  },
  {
    _id: "3",
    port: "Ras Tanura Refinery",
    callType: "Cargo Operations",
    subject: "<p>Cargo Loading Operations</p>",
    body: "<p>Schedule for cargo loading operations at Ras Tanura. Expected completion time is 48 hours. All cargo documentation is ready and customs clearance has been obtained.</p>",
  },
  {
    _id: "4",
    port: "Al Khafji Port",
    callType: "Repair & Maintenance",
    subject: "<p>Emergency Repair Request</p>",
    body: "<p>Vessel requires immediate repair and maintenance services. Engine malfunction detected during voyage. Request urgent assistance for engine repair and technical support.</p>",
  },
  {
    _id: "5",
    port: "As Safaniya Port",
    callType: "Crew Change",
    subject: "<p>Crew Change Schedule</p>",
    body: "<p>Request for crew change operations. 12 crew members need to be replaced at As Safaniya Port. New crew members are ready for boarding and all immigration documents are prepared.</p>",
  },
  {
    _id: "6",
    port: "Dammam Port",
    callType: "Inspection",
    subject: "<p>Port State Control Inspection</p>",
    body: "<p>Vessel scheduled for Port State Control inspection. All certificates and documentation are ready for review. The vessel is fully compliant with all safety and environmental regulations.</p>",
  },
  {
    _id: "7",
    port: "Al Jubail Commercial Sea Port",
    callType: "Port Call",
    subject: "<p>Regular Port Call Notification</p>",
    body: "<p>Standard port call notification for routine operations. Vessel ETA is scheduled for next week. All port services including pilotage and tug assistance are requested.</p>",
  },
  {
    _id: "8",
    port: "Ras Tanura Refinery",
    callType: "Bunkering",
    subject: "<p>Fuel Bunkering Appointment</p>",
    body: "<p>Request for fuel bunkering services. Vessel requires 800 tons of MGO and 1200 tons of IFO. Please arrange for bunker barge and confirm the bunkering schedule.</p>",
  },
  {
    _id: "9",
    port: "Al Khafji Port",
    callType: "Cargo Operations",
    subject: "<p>Bulk Cargo Discharge</p>",
    body: "<p>Scheduled bulk cargo discharge operations. Approximately 15,000 tons of grain to be unloaded. All cargo handling equipment and stevedores are required for the operation.</p>",
  },
  {
    _id: "10",
    port: "As Safaniya Port",
    callType: "Emergency",
    subject: "<p>Medical Emergency</p>",
    body: "<p>Medical emergency on board. Crew member requires immediate medical attention and evacuation. Request urgent medical assistance and ambulance service at the port.</p>",
  },
];

const AppointmentAcceptance = () => {
  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "port",
    sortOrder: 1,
  });

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // Strip HTML tags for display in table
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const cols = [
    {
      name: "Port",
      selector: "port",
      sort: true,
      width: "250",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Call Type",
      selector: "callType",
      sort: true,
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Subject",
      selector: "subject",
      sort: true,
      width: "300",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => (
        <div
          style={{
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={stripHtml(row.subject)}
        >
          {stripHtml(row.subject) || "-"}
        </div>
      ),
    },
    {
      name: "Body",
      selector: "body",
      sort: true,
      width: "400",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => (
        <div
          style={{
            maxWidth: "400px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={stripHtml(row.body)}
        >
          {stripHtml(row.body) || "-"}
        </div>
      ),
    },
    {
      name: "Actions",
      selector: "linksInfo",
      tableClasses: "table-striped",
      contentClass: "table-content",
      thclass: "tb-head",
      onEditClick: (row) => {
        setSelectedRow(row);
        setShowModal(row);
      },
      onDeleteClick: (row) => {
        setSelectedRow(row);
        setShowDeleteModal(true);
      },
      cell: RenderAction,
      width: "200",
    },
  ];

  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Appointment Acceptance"
              isAddEnabled
              addModalLabel="Add Appointment Acceptance"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1 })
              }
              onAddModalClick={() => {
                setSelectedRow(null);
                setShowModal(true);
              }}
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            Sl
            pagination={{ currentPage: params.page, limit: params.limit }}
            tableClasses="px-start"
            count={dummyAppointmentAcceptances.length}
            columns={cols}
            data={dummyAppointmentAcceptances}
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

          {!!showModal && (
            <AppointmentAcceptanceModal
              showModal={showModal}
              closeModal={() => {
                setShowModal(false);
                setSelectedRow(null);
              }}
            />
          )}

          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedRow(null);
              }}
              onConfirm={() => {
                console.log("Delete appointment acceptance:", selectedRow);
                setShowDeleteModal(false);
                setSelectedRow(null);
              }}
              deleteText="Are you sure you want to delete this appointment acceptance?"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AppointmentAcceptance;

