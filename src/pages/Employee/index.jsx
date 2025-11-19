import { useEffect, useState } from 'react';
import '../../design/scss/employee.scss';
import CustomTable from '../../components/customTable';
import CommonHeader from '../../components/CommonHeader';
import useEmployeeReducer from '../../store/EmployeeReducer';
import AddEditModal from '../../components/CommomForm';
import { formConfig } from './formConfig';
import { DateFormat, RenderAction, RenderName } from './RenderCells';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import usePermissionReducer from '../../store/PermissionReducer';

const Employee = () => {
  const [params, setParams] = useState({
    page: 1,
    total: 0,
    limit: 10,
    searchTerm: '',
    sortOrder: -1,
    sortBy: 'createdAt',
  });

  const [state, setState] = useState({
    showAddModal: false,
    editData: null,
    selectedIdForDelete: null,
  });

  const {
    fetchEmployee,
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    isBeingUpdated,
    totalEmployeeCount,
    isLoading,
  } = useEmployeeReducer((state) => state);
  const { fetchPermission, designations } = usePermissionReducer(
    (state) => state,
  );

  const { showAddModal, editData, selectedIdForDelete } = state;

  useEffect(() => {
    fetchEmployee({ params });
    fetchPermission({ params });
  }, [params]);

  const cols = [
    {
      name: 'Name',
      selector: 'firstName',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      cell: RenderName,
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
      onEditClick: (row) => {
        setState({ ...state, editData: row, showAddModal: true });
      },
      onDeleteClick: (row) => setState({ ...state, selectedIdForDelete: row }),
      cell: RenderAction,
      width: '200',
    },
  ];

  const handlePatch = ({ id, value }) => {
    updateEmployee({
      id,
      formData: value,
      cb: () => {
        setState({ ...state, editData: null, showAddModal: false });
        fetchEmployee({ params });
      },
    });
  };

  const handlePost = ({ value }) => {
    addEmployee({
      formData: value,
      cb: () => {
        setState({ ...state, showAddModal: false });
        fetchEmployee({ params });
      },
    });
  };

  const closeDeleteModal = () =>
    setState({ ...state, selectedIdForDelete: null });

  const confirmDelete = () => {
    deleteEmployee({
      id: selectedIdForDelete._id,
      cb: () => {
        closeDeleteModal();
        fetchEmployee({ params });
      },
    });
  };

  return (
    <>
      <DeleteConfirmationModal
        show={selectedIdForDelete}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        deleteText={`Are you sure you want to delete the employee ${selectedIdForDelete?.firstName} ${selectedIdForDelete?.lastName}?`}
        isLoading={isBeingUpdated}
      />
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Employee List"
              isAddEnabled
              addModalLabel="Add Employee"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              onAddModalClick={() => setState({ ...state, showAddModal: true })}
              exportTitle="Export"
              exportLoader={false}
            />
            <AddEditModal
              show={showAddModal}
              // formConfig={formConfig}
              formConfig={formConfig?.map((e) => {
                if (e.label === 'Designation')
                  e.options = designations?.map((f) => ({
                    label: f.name,
                    value: f._id,
                  }));
                return e;
              })}
              handlePost={handlePost}
              handlePatch={handlePatch}
              editData={editData}
              closeModal={() =>
                setState({ ...state, showAddModal: false, editData: null })
              }
              isLoading={isBeingUpdated}
              ModalHeading={`${editData ? 'Update' : 'Create'} Employee`}
            />
          </div>

          <CustomTable
            Sl
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={totalEmployeeCount ?? 10}
            columns={cols}
            isLoading={isLoading}
            data={employees ?? []}
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
        </div>
      </div>
    </>
  );
};

export default Employee;
