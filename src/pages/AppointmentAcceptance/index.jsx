import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { AppointmentAcceptanceModal } from "./Modals/AddEditAppointmentAcceptance";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

import useAppointmentAcceptanceReducer from "../../store/AppointmentAcceptanceReducer";
import useCommonReducer from "../../store/CommonReducer";
import usePortReducer from "../../store/PortReducer";
// ex: "../../stores/AppointmentAcceptanceReducer"

const AppointmentAcceptance = () => {
  const {
    getAppointmentAcceptanceData,
    appointmentAcceptanceData,
    isLoading,
    deleteAppointmentAcceptance,
    isBeingUpdated,
  } = useAppointmentAcceptanceReducer((state) => state);

  const { getCallTypes, callTypes } = useCommonReducer((state) => state);
  const { getPorts, ports } = usePortReducer((state) => state);

  const [params, setParams] = useState({
    page: 1,
    searchTerm: "",
    limit: 10,
    sortBy: "port",
    sortOrder: 1,
  });

  const [showModal, setShowModal] = useState(false); // boolean OR row object
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  // ✅ Strip HTML tags for display in table (safe for browser)
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  useEffect(() => {
    getCallTypes?.();
    getPorts?.({ params: {} });
  }, [getCallTypes, getPorts]);

  useEffect(() => {
    getAppointmentAcceptanceData?.({
      search: params.searchTerm || "",
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
  }, [
    params.page,
    params.limit,
    params.searchTerm,
    params.sortBy,
    params.sortOrder,
    getAppointmentAcceptanceData,
  ]);

  // ✅ Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setParams((prev) => ({ ...prev, searchTerm: value, page: 1 }));
      }, 500),
    []
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // ✅ Support common API response shapes:
  // A) { data: [...], total: number }
  // B) { data: { data: [...], total: number } }
  const tableRows =
    appointmentAcceptanceData?.data?.data ||
    appointmentAcceptanceData?.data ||
    [];
  const totalCount =
    appointmentAcceptanceData?.total ||
    appointmentAcceptanceData?.data?.total ||
    appointmentAcceptanceData?.count ||
    appointmentAcceptanceData?.data?.count ||
    tableRows?.length ||
    0;

  const cols = [
    {
      name: "Port",
      selector: "port",
      sort: true,
      width: "250",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Call Type",
      selector: "callType",
      sort: true,
      width: "200",
      thclass: "tb-head",
      contentClass: "table-content",
    },
    {
      name: "Subject",
      selector: "subject",
      sort: true,
      width: "300",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => (
        <div
          style={{
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={stripHtml(row.subject)}
        >
          {stripHtml(row.subject) || "-"}
        </div>
      ),
    },
    {
      name: "Body",
      selector: "body",
      sort: true,
      width: "400",
      thclass: "tb-head",
      contentClass: "table-content",
      cell: (row) => (
        <div
          style={{
            maxWidth: "400px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={stripHtml(row.body)}
        >
          {stripHtml(row.body) || "-"}
        </div>
      ),
    },
    {
      name: "Actions",
      selector: "linksInfo",
      tableClasses: "table-striped",
      contentClass: "table-content",
      thclass: "tb-head",
      width: "200",
      cell: (props) =>
        RenderAction({
          ...props,
          onEditClick: (row) => {
            setSelectedRow(row);
            setShowModal(row);
          },
          onDeleteClick: (row) => {
            setSelectedRow(row);
            setShowDeleteModal(true);
          },
        }),
    },
  ];

  const refreshList = () => {
    getAppointmentAcceptanceData?.({
      search: params.searchTerm || "",
      page: params.page,
      limit: params.limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
  };

  const handleDelete = async () => {
    const templateId = selectedRow?.template_id ?? selectedRow?._id;
    if (!templateId) return;

    const payload = { template_id: templateId };

    // If your deleteData expects only id:
    // await deleteData(selectedRow._id);
    await deleteAppointmentAcceptance?.(payload);

    setShowDeleteModal(false);
    setSelectedRow(null);
    refreshList();
  };

  return (
    <div className="page-body">
      <div className="prospect employee">
        <div className="container-fluid">
          <CommonHeader
            tableTitle="Appointment Acceptance"
            isAddEnabled
            addModalLabel="Add Appointment Acceptance"
            setSearch={(value) => debouncedSearch(value)}
            onAddModalClick={() => {
              setSelectedRow(null);
              setShowModal(true);
            }}
            exportTitle="Export"
            exportLoader={false}
          />
        </div>

        <CustomTable
          Sl
          loading={isLoading}
          pagination={{ currentPage: params.page, limit: params.limit }}
          tableClasses="px-start"
          count={totalCount}
          columns={cols}
          data={tableRows}
          onPageChange={(currentPage) =>
            setParams((prev) => ({ ...prev, page: currentPage }))
          }
          setLimit={(newLimit) =>
            setParams((prev) => ({ ...prev, limit: newLimit, page: 1 }))
          }
          onSorting={(sortBy) =>
            setParams((prev) => ({
              ...prev,
              sortBy,
              sortOrder: prev.sortOrder === 1 ? -1 : 1,
              page: 1,
            }))
          }
        />

        {!!showModal && (
          <AppointmentAcceptanceModal
            showModal={showModal}
            closeModal={() => {
              setShowModal(false);
              setSelectedRow(null);
            }}
            onSuccess={() => {
              setShowModal(false);
              setSelectedRow(null);
              refreshList();
            }}
            callTypesOptions={callTypes ?? []}
            portOptions={ports ?? []}
          />
        )}

        {!!showDeleteModal && (
          <DeleteConfirmationModal
            show={showDeleteModal}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedRow(null);
            }}
            onConfirm={handleDelete}
            isLoading={isBeingUpdated}
            deleteText="Are you sure you want to delete this appointment acceptance?"
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentAcceptance;