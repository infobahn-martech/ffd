import { useEffect, useState } from 'react';
import '../../design/scss/employee.scss';
import CustomTable from '../../components/customTable';
import CommonHeader from '../../components/CommonHeader';
import usePermissionReducer from '../../store/PermissionReducer';
import { DateFormat, RenderAction } from './RenderCells';
import { PermissionModal } from './Modals/AddEditPermission';

const Permission = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
  });

  const [state, setState] = useState({
    showAddModal: false,
    editData: null,
    selectedIdForDelete: null,
  });

  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const {
    fetchPermission,
    desginations,
    // addPermission,
    // updatePermission,
    // deletePermission,
    // isBeingUpdated,
    totalDesignationCount,
    isLoading,
  } = usePermissionReducer((state) => state);

  // console.log('desginations', desginations);

  // const { showAddModal, editData, selectedIdForDelete } = state;

  useEffect(() => {
    fetchPermission({ params });
  }, [params]);

  const cols = [
    {
      name: 'Designation',
      selector: 'name',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
    },
    {
      name: 'Users',
      selector: 'noOfUsers',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
    },
    {
      name: 'Short Description',
      selector: 'description',
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
      onEditClick: (row) => {
        setState({ ...state, editData: row, showAddModal: true });
      },
      onDeleteClick: (row) =>
        setState({ ...state, selectedIdForDelete: row._id }),
      cell: RenderAction,
    },
  ];

  return (
    <div className="page-body">
      <div className="prospect employee">
        <div className="container-fluid">
          <CommonHeader
            tableTitle="Designation Management"
            isAddEnabled
            addModalLabel="Add Designation"
            setSearch={(e) =>
              setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
            }
            onAddModalClick={() => {
              setState({ ...state, showAddModal: true });
              setShowPermissionModal(true);
            }}
            exportTitle="Export"
            exportLoader={false}
          />
        </div>
        <CustomTable
          Sl
          pagination={{ currentPage: params?.page, limit: params?.limit }}
          tableClasses="px-start"
          count={totalDesignationCount ?? 10}
          columns={cols}
          isLoading={isLoading}
          data={desginations ?? []}
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
      </div>
    </div>
  );
};

export default Permission;
