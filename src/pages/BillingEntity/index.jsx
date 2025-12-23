
import { useState } from "react";
import { DateFormat, RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { BillingEntityModal } from "./Modals/AddEditBillingEntity";
import { PORT_DETAILS } from "../../constants/ports";

const billingTimeline = [
  { createdAt: "2024-10-12T10:15:00Z", updatedAt: "2024-11-03T08:45:00Z" },
  { createdAt: "2024-09-20T12:30:00Z", updatedAt: "2024-10-15T14:20:00Z" },
  { createdAt: "2024-08-05T09:00:00Z", updatedAt: "2024-10-02T11:40:00Z" },
  { createdAt: "2024-07-18T16:00:00Z", updatedAt: "2024-09-28T10:10:00Z" },
  { createdAt: "2024-06-12T14:00:00Z", updatedAt: "2024-08-21T09:00:00Z" },
];

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");

const dummyBillingEntities = [
  {
    _id: "1",
    name: "Sedres Maritime Co.",
    customerId: "CUST-001",
    vatNo: "VAT-SD-12345",
    phoneNumber: "+966540112233",
    email: "accounts@sedresmaritime.com",
    contactPerson: "Mohammed Ali",
    createdAt: "2024-09-12T10:15:00Z",
    updatedAt: "2024-10-03T08:45:00Z",
  },
  {
    _id: "2",
    name: "Al Fajr Shipping LLC",
    customerId: "CUST-002",
    vatNo: "VAT-AF-67890",
    phoneNumber: "+966550221144",
    email: "billing@alfajrshipping.com",
    contactPerson: "Rashid Khan",
    createdAt: "2024-08-20T12:30:00Z",
    updatedAt: "2024-09-15T14:20:00Z",
  },
  {
    _id: "3",
    name: "Global Port Services",
    customerId: "CUST-003",
    vatNo: "VAT-GP-99887",
    phoneNumber: "+966531223344",
    email: "accounts@globalport.com",
    contactPerson: "John Mathew",
    createdAt: "2024-07-05T09:00:00Z",
    updatedAt: "2024-09-02T11:40:00Z",
  },
  {
    _id: "4",
    name: "Ocean Waves Logistics",
    customerId: "CUST-004",
    vatNo: "VAT-OW-55667",
    phoneNumber: "+966588991122",
    email: "finance@oceanwaves.com",
    contactPerson: "Dawood Ibrahim",
    createdAt: "2024-06-18T16:00:00Z",
    updatedAt: "2024-08-28T10:10:00Z",
  },
  {
    _id: "5",
    name: "Blue Horizon Freight",
    customerId: "CUST-005",
    vatNo: "VAT-BH-11224",
    phoneNumber: "+966512007755",
    email: "billing@bluehorizon.com",
    contactPerson: "Samuel Thomas",
    createdAt: "2024-05-12T14:00:00Z",
    updatedAt: "2024-07-21T09:00:00Z",
  },
  {
    _id: "6",
    name: "Desert Star Logistics",
    customerId: "CUST-006",
    vatNo: "VAT-DS-77882",
    phoneNumber: "+966599881177",
    email: "accounts@desertstar.com",
    contactPerson: "Noura Abdullah",
    createdAt: "2024-04-09T11:20:00Z",
    updatedAt: "2024-06-12T09:30:00Z",
  },
  {
    _id: "7",
    name: "PortLink Arabia",
    customerId: "CUST-007",
    vatNo: "VAT-PL-66789",
    phoneNumber: "+966522334455",
    email: "finance@portlinkarabia.com",
    contactPerson: "Hassan Ahmed",
    createdAt: "2024-03-22T08:45:00Z",
    updatedAt: "2024-05-18T12:10:00Z",
  },
  {
    _id: "8",
    name: "CargoMax Trading",
    customerId: "CUST-008",
    vatNo: "VAT-CM-33445",
    phoneNumber: "+966544556677",
    email: "billing@cargomax.com",
    contactPerson: "Peter Joseph",
    createdAt: "2024-02-11T10:00:00Z",
    updatedAt: "2024-04-02T09:15:00Z",
  },
  {
    _id: "9",
    name: "Arabian Gulf Movers",
    customerId: "CUST-009",
    vatNo: "VAT-AG-22119",
    phoneNumber: "+966566778899",
    email: "accounts@agmovers.com",
    contactPerson: "Kareem Faris",
    createdAt: "2024-01-29T09:10:00Z",
    updatedAt: "2024-03-20T08:50:00Z",
  },
  {
    _id: "10",
    name: "Falcon Marine Services",
    customerId: "CUST-010",
    vatNo: "VAT-FM-88001",
    phoneNumber: "+966533224466",
    email: "billing@falconmarine.com",
    contactPerson: "Isaac Daniel",
    createdAt: "2023-12-15T15:30:00Z",
    updatedAt: "2024-02-10T12:00:00Z",
  },
];


const BillingEntity = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
    sortOrder: -1,
    sortBy: 'createdAt',
  });

  const [showBillingEntityModal, setShowBillingEntityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  console.log("showDeleteModal", showDeleteModal)


  const cols = [
    {
      name: 'Billing Entity',
      selector: 'name',
      sort: true,
      width: '200',
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Customer ID',
      selector: 'customerId',
      sort: true,
      width: '150',
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'VAT Number',
      selector: 'vatNo',
      sort: true,
      width: '200',
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Contact Person',
      selector: 'contactPerson',
      sort: true,
      width: '220',
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Phone No.',
      selector: 'phoneNumber',
      sort: true,
      width: '180',
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Email',
      selector: 'email',
      sort: true,
      width: '250',
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Created At',
      selector: 'createdAt',
      sort: true,
      width: '200',
      cell: DateFormat,
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Updated At',
      selector: 'updatedAt',
      sort: true,
      width: '200',
      cell: DateFormat,
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Actions',
      selector: 'actions',
      width: '150',
      cell: RenderAction,
      thclass: 'tb-head',
      onEditClick: (row) => setShowBillingEntityModal(row),
      onDeleteClick: () => setShowDeleteModal(true),
    },
  ];


  return (
    <>
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              showFilter
              tableTitle="Billing Accounts"
              isAddEnabled
              addModalLabel="Add BillingEntity"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              onAddModalClick={() => {
                setShowBillingEntityModal(true);
              }}
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={dummyBillingEntities.length}
            columns={cols}
            // isLoading={isLoading}
            data={dummyBillingEntities ?? []}
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
          {!!showBillingEntityModal && (
            <BillingEntityModal
              showModal={showBillingEntityModal}
              closeModal={() => setShowBillingEntityModal(false)}
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

export default BillingEntity;
