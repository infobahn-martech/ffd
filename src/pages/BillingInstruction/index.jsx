import { useState } from "react";
import { DateFormat, RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { BillingInstructionModal } from "./Modals/AddEditBillingInstruction";

// Dummy Billing Instructions
const dummyBillingInstructions = [
    {
        _id: "1",
        name: "Invoice must be reviewed",
        code: "REVIEW_REQUIRED",
        appliesTo: "GLOBAL",
        type: "MANDATORY",
        description: "Invoice must be reviewed by finance before sending to client.",
        isActive: true,
        createdAt: "2024-09-12T10:15:00Z",
        updatedAt: "2024-10-03T08:45:00Z",
    },
    {
        _id: "2",
        name: "Attach supporting documents",
        code: "ATTACH_DOCS",
        appliesTo: "BILLING_ENTITY",
        description: "Attach PO, contract and job completion report with invoice.",
        type: "INFO",
        isActive: true,
        createdAt: "2024-08-20T12:30:00Z",
        updatedAt: "2024-09-15T14:20:00Z",
    },
    {
        _id: "3",
        name: "Late payment surcharge note",
        code: "LATE_SURCHARGE",
        appliesTo: "GLOBAL",
        description: "Include note about late payment surcharge in the invoice.",
        type: "WARNING",
        isActive: false,
        createdAt: "2024-07-05T09:00:00Z",
        updatedAt: "2024-09-02T11:40:00Z",
    },
];

const BillingInstruction = () => {
    const [params, setParams] = useState({
        page: 1,
        total: 0,
        limit: 10,
        searchTerm: "",
        sortOrder: -1,
        sortBy: "createdAt",
    });

    const [showBillingInstructionModal, setShowBillingInstructionModal] =
        useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // const [selectedRow, setSelectedRow] = useState(null);

    const cols = [
        {
            name: "Title",
            selector: "name",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Code",
            selector: "code",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Applies To",
            selector: "appliesTo",
            sort: true,
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (row) =>
                row?.appliesTo === "BILLING_ENTITY"
                    ? "Specific Billing Entity"
                    : "Global",
        },
        {
            name: "Type",
            selector: "type",
            sort: true,
            width: "150",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (row) => {
                const t = row?.type;
                if (t === "MANDATORY") return "Mandatory";
                if (t === "WARNING") return "Warning";
                return "Info";
            },
        },
        {
            name: "Active",
            selector: "isActive",
            sort: true,
            width: "120",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (row) => (row?.isActive ? "Yes" : "No"),
        },
        {
            name: "Description",
            selector: "description",
            sort: true,
            width: "350",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Created At",
            selector: "createdAt",
            sort: true,
            width: "200",
            cell: DateFormat,
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Updated At",
            selector: "updatedAt",
            sort: true,
            width: "200",
            cell: DateFormat,
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Actions",
            selector: "actions",
            width: "150",
            cell: RenderAction,
            thclass: "tb-head",
            onEditClick: (row) => setShowBillingInstructionModal(row),
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
                            tableTitle="Billing Instructions"
                            isAddEnabled
                            addModalLabel="Add Billing Instruction"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
                            }
                            onAddModalClick={() => {
                                // pass {} so modal runs in ADD mode (showModal?._id will be undefined)
                                setShowBillingInstructionModal({});
                            }}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params?.page, limit: params?.limit }}
                        tableClasses="px-start"
                        count={dummyBillingInstructions.length}
                        columns={cols}
                        data={dummyBillingInstructions ?? []}
                        onPageChange={(currentPage) =>
                            setParams({ ...params, page: currentPage })
                        }
                        setLimit={(newlimit) =>
                            setParams({ ...params, limit: newlimit })
                        }
                        onSorting={(sortBy) => {
                            setParams({
                                ...params,
                                sortBy,
                                sortOrder: params?.sortOrder === -1 ? 1 : -1,
                                page: 1,
                            });
                        }}
                    />

                    {!!showBillingInstructionModal && (
                        <BillingInstructionModal
                            showModal={showBillingInstructionModal}
                            closeModal={() => setShowBillingInstructionModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => {
                                // handle delete here using selectedRow if you track it
                                setShowDeleteModal(false);
                            }}
                            deleteText="Are you sure you want to delete this billing instruction?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default BillingInstruction;
