
import { useState } from "react";
import { DateFormat, RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { PortModal } from "./Modals/AddEditPort";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { PORT_DETAILS } from "../../constants/ports";

const portTimeline = [
  { createdAt: "2024-10-12T10:15:00Z", updatedAt: "2024-11-03T08:45:00Z" },
  { createdAt: "2024-09-20T12:30:00Z", updatedAt: "2024-10-15T14:20:00Z" },
  { createdAt: "2024-08-05T09:00:00Z", updatedAt: "2024-10-02T11:40:00Z" },
  { createdAt: "2024-07-18T16:00:00Z", updatedAt: "2024-09-28T10:10:00Z" },
  { createdAt: "2024-06-12T14:00:00Z", updatedAt: "2024-08-21T09:00:00Z" },
];

const dummyPorts = PORT_DETAILS.map((port, index) => ({
  _id: `${index + 1}`,
  firstName: port.name,
  phoneNumber: port.phoneNumber,
  email: port.email,
  createdAt: portTimeline[index]?.createdAt ?? "2024-06-01T10:00:00Z",
  updatedAt: portTimeline[index]?.updatedAt ?? "2024-08-01T10:00:00Z",
}));


const Port = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
    sortOrder: -1,
    sortBy: 'createdAt',
  });

  const [showPortModal, setShowPortModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  console.log("showDeleteModal", showDeleteModal)


  const cols = [
    {
      name: 'Name',
      selector: 'firstName',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '400',
    },
    {
      name: 'Phone No.',
      selector: 'phoneNumber',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Email',
      selector: 'email',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
    },
    {
      name: 'Created At',
      selector: 'createdAt',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      sort: true,
      cell: DateFormat,
      width: '400',
    },
    {
      name: 'Modified At',
      selector: 'updatedAt',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      sort: true,
      cell: DateFormat,
      width: '400',
    },
    {
      name: 'Actions',
      selector: 'linksInfo',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      onEditClick: (row) => { setShowPortModal(row) },
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
              //  showFilter
              tableTitle="Ports"
              isAddEnabled={false}
              addModalLabel="Add Port"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              onAddModalClick={() => {
                setShowPortModal(true);
              }}
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={dummyPorts.length}
            columns={cols}
            // isLoading={isLoading}
            data={dummyPorts ?? []}
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
          {!!showPortModal && (
            <PortModal
              showModal={showPortModal}
              closeModal={() => setShowPortModal(false)}
            />
          )}

          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={() => { }}
              deleteText="Are you sure you want to delete this port?"
            // isLoading={isBeingUpdated}
            />
          )}


        </div>
      </div>
    </>
  );
};

export default Port;
