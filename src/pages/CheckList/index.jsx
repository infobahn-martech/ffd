import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { CheckListModal } from "./Modals/AddEditCheckList";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";



const dummyCheckLists = [
  {
    _id: "1",
    checklistName: "Pre-Arrival Checklist",
    callType: "inbound",            // Inbound call
    vesselType: "cargo",            // Cargo vessel
    bargeType: "flat",              // Flat barge
    sections: [
      { title: "Documentation", sort_order: 1, items: [], sub_sections: [] },
      { title: "Safety Equipment", sort_order: 2, items: [], sub_sections: [] },
      { title: "Crew Verification", sort_order: 3, items: [], sub_sections: [] }
    ]
  },
  {
    _id: "2",
    checklistName: "Cargo Operations",
    callType: "both",               // Inbound & Outbound
    vesselType: "container",        // Container vessel
    bargeType: "deck",              // Deck barge
    sections: [
      { title: "Cargo Inspection", sort_order: 1, items: [], sub_sections: [] },
      { title: "Loading Procedures", sort_order: 2, items: [], sub_sections: [] }
    ]
  },
  {
    _id: "3",
    checklistName: "Safety Inspection",
    callType: "inbound",
    vesselType: "tanker",           // Tanker vessel
    bargeType: "tank",              // Tank barge
    sections: [
      { title: "Fire Safety", sort_order: 1, items: [], sub_sections: [] },
      { title: "Emergency Procedures", sort_order: 2, items: [], sub_sections: [] },
      { title: "Equipment Check", sort_order: 3, items: [], sub_sections: [] }
    ]
  },
  {
    _id: "4",
    checklistName: "Departure Checklist",
    callType: "outbound",
    vesselType: "bulk",             // Bulk carrier
    bargeType: "hopper",            // Hopper barge
    sections: [
      { title: "Final Checks", sort_order: 1, items: [], sub_sections: [] },
      { title: "Documentation Review", sort_order: 2, items: [], sub_sections: [] }
    ]
  },
  {
    _id: "5",
    checklistName: "Emergency Procedures",
    callType: "both",
    vesselType: "cargo",
    bargeType: "flat",
    sections: [
      { title: "Emergency Contacts", sort_order: 1, items: [], sub_sections: [] },
      { title: "Evacuation Plan", sort_order: 2, items: [], sub_sections: [] }
    ]
  },
  {
    _id: "6",
    checklistName: "Tanker Loading Checklist",
    callType: "inbound",
    vesselType: "tanker",
    bargeType: "tank",
    sections: [
      { title: "Pre-Loading Inspection", sort_order: 1, items: [], sub_sections: [] },
      { title: "Loading Operations", sort_order: 2, items: [], sub_sections: [] }
    ]
  },
  {
    _id: "7",
    checklistName: "Container Vessel Checklist",
    callType: "outbound",
    vesselType: "container",
    bargeType: "deck",
    sections: [
      { title: "Container Verification", sort_order: 1, items: [], sub_sections: [] }
    ]
  },
  {
    _id: "8",
    checklistName: "Bulk Carrier Operations",
    callType: "both",
    vesselType: "bulk",
    bargeType: "hopper",
    sections: [
      { title: "Cargo Handling", sort_order: 1, items: [], sub_sections: [] },
      { title: "Safety Protocols", sort_order: 2, items: [], sub_sections: [] }
    ]
  }
];


const CheckList = () => {
  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "checklistName",
    sortOrder: 1,
  });

  const [showCheckListModal, setShowCheckListModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 👉 COLUMNS (Checklist Name + Call Type + Vessel Type + Barge Type + Sections + Actions)
  const cols = [
    {
      name: "Checklist Name",
      selector: "checklistName",
      sort: true,
      width: "250",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Call Type",
      selector: "callType",
      sort: true,
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => {
        const callTypeMap = {
          inbound: "Inbound",
          outbound: "Outbound",
          both: "Both"
        };
        return callTypeMap[row.callType] || row.callType;
      }
    },
    {
      name: "Vessel Type",
      selector: "vesselType",
      sort: true,
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => {
        const vesselTypeMap = {
          cargo: "Cargo",
          tanker: "Tanker",
          container: "Container",
          bulk: "Bulk Carrier"
        };
        return vesselTypeMap[row.vesselType] || row.vesselType;
      }
    },
    {
      name: "Barge Type",
      selector: "bargeType",
      sort: true,
      width: "150",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => {
        const bargeTypeMap = {
          flat: "Flat Barge",
          hopper: "Hopper Barge",
          deck: "Deck Barge",
          tank: "Tank Barge"
        };
        return bargeTypeMap[row.bargeType] || row.bargeType;
      }
    },
    {
      name: "Sections",
      selector: "sections",
      sort: true,
      width: "120",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => {
        const sectionCount = row.sections?.length || 0;
        return (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "32px",
            height: "24px",
            padding: "0 8px",
            backgroundColor: "#f8f9ff",
            color: "#00368c",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "600"
          }}>
            {sectionCount}
          </span>
        );
      }
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
