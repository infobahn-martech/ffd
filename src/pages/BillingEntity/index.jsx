
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

const dummyBillingEntities = PORT_DETAILS.map((port, index) => ({
  _id: `${index + 1}`,
  firstName: `${port.name} Billing Entity`,
  phoneNumber: `+9665800000${index + 1}`,
  email: `${slugify(port.name)}.billing@sedres.com`,
  createdAt: billingTimeline[index]?.createdAt ?? "2024-06-01T10:00:00Z",
  updatedAt: billingTimeline[index]?.updatedAt ?? "2024-08-01T10:00:00Z",
}));

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

  console.log("showDeleteModal",showDeleteModal)


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
      onEditClick:(row)=>{setShowBillingEntityModal(row)},
      onDeleteClick:()=>{setShowDeleteModal(true)},
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
                          onCancel={()=>setShowDeleteModal(false)}
                          onConfirm={()=>{}}
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
