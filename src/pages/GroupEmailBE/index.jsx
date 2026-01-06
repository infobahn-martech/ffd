import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { GroupEmailBEModal } from "./Modals/AddEditGroupEmail";
import { RenderAction } from "./renderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const dummyGroupEmailsBE = [
    {
        _id: "1",
        name: "Finance Team",
        code: "FIN_TEAM",
        emails: ["finance@sedres.com", "accounts@sedres.com"],
        description: "Primary finance & billing communication group.",
        isActive: true,
    },
    {
        _id: "2",
        name: "Billing Approvers",
        code: "BILLING_APPROVERS",
        emails: ["billing.head@sedres.com", "manager@sedres.com"],
        description: "Approvers for billing and invoice related actions.",
        isActive: true,
    },
    {
        _id: "3",
        name: "Payment Reminder",
        code: "PAYMENT_REMINDER",
        emails: ["reminder@sedres.com"],
        description: "Group used for payment reminder notifications.",
        isActive: true,
    },
];

const GroupEmailBE = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showGroupEmailModal, setShowGroupEmailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    // const [selectedRow, setSelectedRow] = useState(null);

    const cols = [
        {
            name: "Group Name",
            selector: "name",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Group Code",
            selector: "code",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Email Count",
            selector: "emails",
            sort: false,
            width: "140",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (row) => row?.emails?.length || 0,
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
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            onEditClick: (row) => {
                setShowGroupEmailModal(row);
            },
            onDeleteClick: (row) => {
                // setSelectedRow(row);
                setShowDeleteModal(true);
            },
            cell: RenderAction,
            width: "180",
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Billing Entity Group Email"
                            isAddEnabled
                            addModalLabel="Add Group Email"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowGroupEmailModal({})}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={dummyGroupEmailsBE.length}
                        columns={cols}
                        data={dummyGroupEmailsBE}
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

                    {!!showGroupEmailModal && (
                        <GroupEmailBEModal
                            showModal={showGroupEmailModal}
                            closeModal={() => setShowGroupEmailModal(false)}
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
                            deleteText="Are you sure you want to delete this group email?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default GroupEmailBE;
