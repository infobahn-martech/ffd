import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { StatusModal } from "./Modals/AddEditStatus";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { STATUS_OPTIONS, getStatusDescription } from "../../shared/constants/statuses";
import { STATUS_MODULE_OPTIONS } from "../../shared/constants/statuses";
import "../../design/scss/status.scss";


const COLORS = ["#F2994A", "#27AE60", "#F2C94C", "#2F80ED", "#EB5757", "#9B51E0"];

const dummyStatuses = STATUS_OPTIONS.map((status, index) => ({
    _id: `${index + 1}`,
    name: status,
    code: `ST-${index + 1}`,
    description: getStatusDescription(status),
    module: STATUS_MODULE_OPTIONS[0],
    order: index + 1,
    color: COLORS[index] || "#000000",
}));

const StatusManagement = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Status Name",
            selector: "name",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Status Code",
            selector: "code",
            sort: true,
            width: "150",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Description",
            selector: "description",
            sort: true,
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Type / Module",
            selector: "module",
            sort: true,
            width: "250",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Display Order",
            selector: "order",
            sort: true,
            width: "200",
            thclass: "tb-head text-center",
            contentClass: "table-content text-center",
        },
        {
            name: "Status Color",
            selector: "color",
            sort: false,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (row) => (
                <div className="d-flex align-items-center gap-2">
                    {/* Color dot */}
                    <span
                        className="status-color-dot"
                        style={{ "--status-color": row.color || "#000000" }}
                    />
                    {/* Keep text readable (don’t color it same as bg) */}
                    <span className="status-color-text">{row.color}</span>
                </div>
            ),
        }
        ,
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            onEditClick: (row) => {
                setShowStatusModal(row); // pass full row to modal for edit
            },
            onDeleteClick: () => {
                setShowDeleteModal(true);
            },
            cell: RenderAction,
            width: "250",
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Statuses"
                            isAddEnabled
                            addModalLabel="Add Status"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowStatusModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={dummyStatuses.length}
                        columns={cols}
                        data={dummyStatuses}
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

                    {!!showStatusModal && (
                        <StatusModal
                            showModal={showStatusModal}
                            closeModal={() => setShowStatusModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this status?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default StatusManagement;
