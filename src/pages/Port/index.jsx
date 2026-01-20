import { useState, useEffect } from "react";
import { DateFormat, RenderAction, RenderEmptyField } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { PortModal } from "./Modals/AddEditPort";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import usePortReducer from "../../store/PortReducer";

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

  const {
    getPorts,
    ports,
    isLoading,
    totalPortCount,
  } = usePortReducer((state) => state);

  useEffect(() => {
    getPorts({ params });
  }, [params]);


  const cols = [
    {
      name: 'Name',
      selector: 'port',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Phone No.',
      selector: 'phoneNumber',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
      cell: RenderEmptyField,
    },
    {
      name: 'Email',
      selector: 'email',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
      cell: RenderEmptyField,
    },
    {
      name: 'Created At',
      selector: 'createdAt',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      sort: true,
      cell: DateFormat,
      width: '200',
    },
    {
      name: 'Modified At',
      selector: 'updatedAt',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      sort: true,
      cell: DateFormat,
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
            count={totalPortCount ?? 0}
            columns={cols}
            isLoading={isLoading}
            data={ports ?? []}
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
