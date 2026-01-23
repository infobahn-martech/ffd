import { useState, useEffect } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { VesselTypeModal } from "./Modals/AddEditVesselType";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";
import useVesselTypeReducer from "../../store/VesselTypeReducer";

const VesselType = () => {
  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "name",
    sortOrder: 1,
  });

  const [showVesselTypeModal, setShowVesselTypeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);

  const {
    getVesselTypes,
    vesselTypes,
    totalCount,
    isLoading,
  } = useVesselTypeReducer((state) => state);

  useEffect(() => {
    const apiParams = {
      page: params.page,
      limit: params.limit,
      ...(params.searchTerm && { searchTerm: params.searchTerm }),
      ...(params.sortBy && { sortBy: params.sortBy }),
    };
    getVesselTypes({ params: apiParams });
  }, [params]);

  const cols = [
    {
      name: "Vessel Type",
      selector: "name",
      sort: true,
      width: "400",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Created At",
      selector: "createdAt",
      sort: true,
      width: "400",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: DateFormat,
    },
    {
      name: 'Actions',
      selector: 'linksInfo',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      onEditClick: (row) => setShowVesselTypeModal(row),
      onDeleteClick: (row) => {
        setSelectedRowForDelete(row);
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
              tableTitle="Vessel Types"
              isAddEnabled
              addModalLabel="Add VesselType"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1 })
              }
              onAddModalClick={() => setShowVesselTypeModal(true)}
              exportTitle="Export"
              exportLoader={false}
            />
          </div>

          <CustomTable
            pagination={{ currentPage: params.page, limit: params.limit }}
            tableClasses="px-start"
            count={totalCount ?? 0}
            columns={cols}
            data={vesselTypes ?? []}
            Sl={true}
            isLoading={isLoading}
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

          {!!showVesselTypeModal && (
            <VesselTypeModal
              showModal={showVesselTypeModal}
              closeModal={() => setShowVesselTypeModal(false)}
              onSuccess={() => getVesselTypes({ params })}
            />
          )}
          {!!showDeleteModal && (
            <DeleteConfirmationModal
              show={showDeleteModal}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedRowForDelete(null);
              }}
              onConfirm={() => {
                // TODO: Implement delete API when available
                setShowDeleteModal(false);
                setSelectedRowForDelete(null);
              }}
              deleteText="Are you sure you want to delete this vessel type?"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default VesselType;
