import { useEffect, useState } from 'react';
import '../../design/scss/employee.scss';
import CustomTable from '../../components/customTable';
import CommonHeader from '../../components/CommonHeader';
import useProspectReducer from '../../store/ProspectReducer';
import AddEditModal from '../../components/CommomForm';
import ImportModal from './Modals/ImportModal';
import { formConfig } from './formConfig';
import {
  DateFormat,
  RenderAction,
  RenderName,
  changeStatus,
} from './RenderCells';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';

const Prospects = () => {
  const [showImportModal, setShowImportModal] = useState(null);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });
  const [State, setState] = useState({
    showAddModal: false,
    editData: null,
    selectedIdForDelete: null,
  });
  const getProspects = useProspectReducer((state) => state.getProspects);
  const isLoading = useProspectReducer((state) => state.isLoading);
  const createProspect = useProspectReducer((state) => state.createProspect);
  const editProspect = useProspectReducer((state) => state.editProspect);
  const deleteProspect = useProspectReducer((state) => state.deleteProspect);
  const isBeingUpdated = useProspectReducer((state) => state.isBeingUpdated);
  const { exportProspectData, isExportLoading } = useProspectReducer(
    (state) => state,
  );
  const totalProspectCount = useProspectReducer(
    (state) => state.totalProspectCount,
  );

  const prospects = useProspectReducer((state) => state.prospects);

  useEffect(() => {
    getProspects({ params });
  }, [params]);

  const { showAddModal, editData, selectedIdForDelete } = State;

  const statusChangeOptions = [
    { value: 'block', label: 'Block' },
    { value: 'active', label: 'Active' },
  ];

  const cols = [
    {
      name: 'Lead Name',
      selector: 'name',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      cell: RenderName,
      width: '400',
    },
    {
      name: 'Company',
      alt: '-',
      selector: 'company',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '300',
    },
    {
      name: 'Phone No.',
      selector: 'phoneNumber',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'Email',
      selector: 'email',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      sort: true,
      width: '300',
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
      name: 'Status',
      selector: 'updatedAt',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      cell: ({ row }) =>
        changeStatus({
          row,
          Options: statusChangeOptions,
          handleClick: (change) => {
            console.log('row', row._id, change);
          },
        }),
      width: '200',
    },
    {
      name: 'Actions',
      selector: 'linksInfo',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      onEditClick: (row) => {
        setState({ ...State, editData: row, showAddModal: true });
      },
      onDeleteClick: (row) => setState({ ...State, selectedIdForDelete: row }),
      cell: RenderAction,
      width: '200',
    },
  ];

  const handlePatch = ({ id, value }) => {
    editProspect({
      id,
      formData: value,
      cb: () => {
        setState({ ...State, editData: null, showAddModal: false });
        getProspects({ params });
      },
    });
  };

  const handlePost = ({ value }) => {
    createProspect({
      formData: value,
      cb: () => {
        setState({ ...State, showAddModal: false });
        getProspects({ params });
      },
    });
  };

  const closeDeleteModal = () =>
    setState({ ...State, selectedIdForDelete: null });

  const confirmDelete = () => {
    deleteProspect({
      id: selectedIdForDelete._id,
      cb: () => {
        closeDeleteModal();
        getProspects({ params });
      },
    });
  };

  return (
    <>
      <DeleteConfirmationModal
        deleteText={`Are you sure you want to delete the prospect ${selectedIdForDelete?.name} ?`}
        show={selectedIdForDelete}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        isLoading={isBeingUpdated}
      />
      <ImportModal
        showModal={showImportModal}
        closeModal={() => setShowImportModal(null)}
      />
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Prospect List"
              isAddEnabled
              addModalLabel="Add Prospect"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              showImport
              onImportClick={() => setShowImportModal(true)}
              onExportClick={(fileType) =>
                exportProspectData({
                  params: {
                    ...params,
                    page: null,
                    limit: null,
                    excelExport: fileType === 'excel',
                  },
                })
              }
              onAddModalClick={() => setState({ ...State, showAddModal: true })}
              showExport
              exportOption={[
                // { label: 'PDF', value: 'pdf' },
                { label: 'Excel', value: 'excel' },
              ]}
              exportTitle="Export"
              exportLoader={isExportLoading}
            />
            <AddEditModal
              editData={editData}
              show={showAddModal}
              formConfig={formConfig}
              handlePost={handlePost}
              handlePatch={handlePatch}
              closeModal={() => setState({ ...State, showAddModal: false })}
              isLoading={isBeingUpdated}
              ModalHeading={`${!editData ? 'Create' : 'Update'} Prospect`}
            />
          </div>

          <CustomTable
            Sl
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            count={totalProspectCount ?? 10}
            columns={cols}
            isLoading={isLoading}
            data={prospects ?? []}
            onPageChange={(currentPage) =>
              setParams({ ...params, page: currentPage })
            }
            onSorting={(sortBy) =>
              setParams({
                ...params,
                sortBy,
                sortOrder: params?.sortOrder === 'asc' ? 'desc' : 'asc',
                page: 1,
              })
            }
            setLimit={(newlimit) => setParams({ ...params, limit: newlimit })}
          />
        </div>
      </div>
    </>
  );
};

export default Prospects;
