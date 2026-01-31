import { useState, useEffect } from "react";
import { DateFormat, RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { BillingEntityModal } from "./Modals/AddEditBillingEntity";
import useBillingEntityReducer from "../../store/BillingEntityReducer";

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

  const {
    getBillingEntities,
    billingEntities,
    totalCount,
    isLoading,
  } = useBillingEntityReducer((state) => state);
  console.log("billingEntities", billingEntities);

  useEffect(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      ...(params.searchTerm && { searchTerm: params.searchTerm }),
      ...(params.sortBy && { sortBy: params.sortBy }),
      ...(params.sortOrder != null && { sortOrder: params.sortOrder }),
    };
    getBillingEntities({ params: apiParams });
  }, [params]);


  const cols = [
    {
      name: 'Billing Entity',
      selector: 'billing_entity',
      sort: true,
      width: '200',
      thclass: 'tb-head',
      contentClass: 'table-content',
    },
    {
      name: 'Customer Code',
      selector: 'customer_code',
      sort: true,
      width: '200',
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
            count={totalCount ?? 0}
            columns={cols}
            isLoading={isLoading}
            data={billingEntities ?? []}
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
              onSuccess={() => {
                const apiParams = {
                  page: params.page,
                  limit: params.limit,
                  ...(params.searchTerm && { searchTerm: params.searchTerm }),
                  ...(params.sortBy && { sortBy: params.sortBy }),
                  ...(params.sortOrder != null && { sortOrder: params.sortOrder }),
                };
                getBillingEntities({ params: apiParams });
              }}
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
