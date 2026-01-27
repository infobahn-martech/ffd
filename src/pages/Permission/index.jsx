import '../../design/scss/employee.scss';
import CustomTable from '../../components/CustomTable';
import CommonHeader from '../../components/CommonHeader';
import { DateFormat, RenderAction } from './RenderCells';
import { PermissionModal } from './Modals/AddEditPermission';
import { useState, useEffect } from 'react';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import usePermissionReducer from '../../store/PermissionReducer';

const Permission = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const {
    fetchPermission,
    designations,
    isLoading,
    totalDesignationCount,
  } = usePermissionReducer((state) => state);

  useEffect(() => {
    fetchPermission({ params });
  }, [params]);

  const cols = [
    {
      name: 'Permission',
      selector: 'section_name',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Users',
      selector: 'noOfUsers',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Created At',
      selector: 'createdAt',
      cell: DateFormat,
      width: '400',
    },
    {
      name: 'Actions',
      selector: 'linksInfo',
      onEditClick: (row) => {
        setShowPermissionModal(row)
      },
      onDeleteClick: () => { setShowDeleteModal(true) },
      cell: RenderAction,
      width: '200',
    },
  ];

  return (
    <div className="page-body">
      <div className="prospect employee">
        <div className="container-fluid">
          <CommonHeader
            tableTitle="Permissions"
            isAddEnabled
            onAddModalClick={() => {
              setShowPermissionModal(true);
            }}
            addModalLabel="Add Permission"
            setSearch={(e) =>
              setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
            }
            exportTitle="Export"
            exportLoader={false}
          />
        </div>

        {/* TABLE */}
        <CustomTable
          Sl
          pagination={{ currentPage: params.page, limit: params.limit }}
          tableClasses="px-start"
          count={totalDesignationCount || 0}
          columns={cols}
          isLoading={isLoading}
          data={designations || []}
          onPageChange={(currentPage) =>
            setParams({ ...params, page: currentPage })
          }
          setLimit={(newlimit) => setParams({ ...params, limit: newlimit })}
        />

        {!!showPermissionModal && (
          <PermissionModal
            showModal={showPermissionModal}
            closeModal={() => setShowPermissionModal(false)}
          />
        )}

        {!!showDeleteModal && (
          <DeleteConfirmationModal
            show={showDeleteModal}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={() => { }}
            deleteText="Are you sure you want to delete this permission?"
          // isLoading={isBeingUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default Permission;
