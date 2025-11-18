
import {  useState } from "react";
import { DateFormat, RenderAction, RenderName } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import AddEditModal from "../../components/CommomForm";
import { formConfig } from "./formConfig";


const dummyPorts = [
  {
    _id: "1",
    firstName: "Dubai Port",
    phoneNumber: "+971500000001",
    email: "dubai.port@example.com",
    createdAt: "2024-10-12T10:15:00Z",
    updatedAt: "2024-11-03T08:45:00Z",
  },
  {
    _id: "2",
    firstName: "Abu Dhabi Port",
    phoneNumber: "+971500000002",
    email: "abudhabi.port@example.com",
    createdAt: "2024-09-20T12:30:00Z",
    updatedAt: "2024-10-15T14:20:00Z",
  },
  {
    _id: "3",
    firstName: "Sharjah Port",
    phoneNumber: "+971500000003",
    email: "sharjah.port@example.com",
    createdAt: "2024-08-05T09:00:00Z",
    updatedAt: "2024-10-02T11:40:00Z",
  },
  {
    _id: "4",
    firstName: "Fujairah Port",
    phoneNumber: "+971500000004",
    email: "fujairah.port@example.com",
    createdAt: "2024-07-18T16:00:00Z",
    updatedAt: "2024-09-28T10:10:00Z",
  },
  {
    _id: "5",
    firstName: "Ras Al Khaimah Port",
    phoneNumber: "+971500000005",
    email: "rak.port@example.com",
    createdAt: "2024-06-12T14:00:00Z",
    updatedAt: "2024-08-21T09:00:00Z",
  },
    {
    _id: "6",
    firstName: "Ras Al Khaimah Port",
    phoneNumber: "+971500000005",
    email: "rak.port@example.com",
    createdAt: "2024-06-12T14:00:00Z",
    updatedAt: "2024-08-21T09:00:00Z",
  },
    {
    _id: "7",
    firstName: "Ras Al Khaimah Port",
    phoneNumber: "+971500000005",
    email: "rak.port@example.com",
    createdAt: "2024-06-12T14:00:00Z",
    updatedAt: "2024-08-21T09:00:00Z",
  },
    {
    _id: "8",
    firstName: "Ras Al Khaimah Port",
    phoneNumber: "+971500000005",
    email: "rak.port@example.com",
    createdAt: "2024-06-12T14:00:00Z",
    updatedAt: "2024-08-21T09:00:00Z",
  },
      {
    _id: "9",
    firstName: "Ras Al Khaimah Port",
    phoneNumber: "+971500000005",
    email: "rak.port@example.com",
    createdAt: "2024-06-12T14:00:00Z",
    updatedAt: "2024-08-21T09:00:00Z",
  },
      {
    _id: "10",
    firstName: "Ras Al Khaimah Port",
    phoneNumber: "+971500000005",
    email: "rak.port@example.com",
    createdAt: "2024-06-12T14:00:00Z",
    updatedAt: "2024-08-21T09:00:00Z",
  },
];


const Port = () => {
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

  // const {
  //   fetchEmployee,
  //   employees,
  //   addEmployee,
  //   updateEmployee,
  //   deleteEmployee,
  //   isBeingUpdated,
  //   totalEmployeeCount,
  //   isLoading,
  // } = useEmployeeReducer((state) => state);
  // const { fetchPermission, designations } = usePermissionReducer(
  //   (state) => state,
  // );

  const { showAddModal } = state;

  // useEffect(() => {
  //   fetchEmployee({ params });
  //   fetchPermission({ params });
  // }, [params]);

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
      onEditClick: (row) => {
        setState({ ...state, editData: row, showAddModal: true });
      },
      onDeleteClick: (row) => setState({ ...state, selectedIdForDelete: row }),
      cell: RenderAction,
      width: '200',
    },
  ];

  // const handlePatch = ({ id, value }) => {
  //   updateEmployee({
  //     id,
  //     formData: value,
  //     cb: () => {
  //       setState({ ...state, editData: null, showAddModal: false });
  //       fetchEmployee({ params });
  //     },
  //   });
  // };

  // const handlePost = ({ value }) => {
  //   addEmployee({
  //     formData: value,
  //     cb: () => {
  //       setState({ ...state, showAddModal: false });
  //       fetchEmployee({ params });
  //     },
  //   });
  // };

  // const closeDeleteModal = () =>
  //   setState({ ...state, selectedIdForDelete: null });

  // const confirmDelete = () => {
  //   deleteEmployee({
  //     id: selectedIdForDelete._id,
  //     cb: () => {
  //       closeDeleteModal();
  //       fetchEmployee({ params });
  //     },
  //   });
  // };

  return (
    <>
      {/* <DeleteConfirmationModal
        show={selectedIdForDelete}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        deleteText={`Are you sure you want to delete the employee ${selectedIdForDelete?.firstName} ${selectedIdForDelete?.lastName}?`}
        isLoading={isBeingUpdated}
      /> */}
      <div className="page-body">
        <div className="prospect employee">
          <div className="container-fluid">
            <CommonHeader
              tableTitle="Port List"
              isAddEnabled
              addModalLabel="Add Port"
              setSearch={(e) =>
                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
              }
              onAddModalClick={() => setState({ ...state, showAddModal: true })}
              exportTitle="Export"
              exportLoader={false}
            />
            <AddEditModal
              show={showAddModal}
              formConfig={formConfig}
              // handlePost={handlePost}
              // handlePatch={handlePatch}
              // editData={editData}
              closeModal={() =>
                setState({ ...state, showAddModal: false, editData: null })
              }
              // isLoading={isBeingUpdated}
              // ModalHeading={`${editData ? 'Update' : 'Create'} Port`}
            />
          </div>

          <CustomTable
            Sl
            pagination={{ currentPage: params?.page, limit: params?.limit }}
            tableClasses="px-start"
            // count={totalEmployeeCount ?? 10}
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
        </div>
      </div>
    </>
  );
};

export default Port;
