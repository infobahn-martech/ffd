import { useState } from "react";
import { RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { AddEditCustomerPricing } from "./Modals/AddEditCustomerPricing";
import { PORT_DETAILS } from "../../constants/ports";

const billingTimeline = [
    { createdAt: "2024-10-12T10:15:00Z", updatedAt: "2024-11-03T08:45:00Z" },
    { createdAt: "2024-09-20T12:30:00Z", updatedAt: "2024-10-15T14:20:00Z" },
    { createdAt: "2024-08-05T09:00:00Z", updatedAt: "2024-10-02T11:40:00Z" },
    { createdAt: "2024-07-18T16:00:00Z", updatedAt: "2024-09-28T10:10:00Z" },
    { createdAt: "2024-06-12T14:00:00Z", updatedAt: "2024-08-21T09:00:00Z" },
];

// 🔹 Dummy Customer Pricing data (per port) – only fields we care about in table
const dummyCustomerPricing = PORT_DETAILS.map((port, index) => ({
    _id: `${index + 1}`,
    customerName: `${port.name} Main Customer`,
    billingEntity: `${port.name} Billing Entity`,
    portName: port.name,
    currency: "AED",
    createdAt: billingTimeline[index]?.createdAt ?? "2024-06-01T10:00:00Z",
    updatedAt: billingTimeline[index]?.updatedAt ?? "2024-08-01T10:00:00Z",
}));

const CustomerPricing = () => {
    const [params, setParams] = useState({
        page: 1,
        total: 0,
        limit: 10,
        searchTerm: "",
        sortOrder: -1,
        sortBy: "customerName", // 👈 default sort based on visible field
    });

    const [showCustomerPricingModal, setShowCustomerPricingModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Customer",
            selector: "customerName",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "260",
        },
        {
            name: "Port",
            selector: "portName",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "200",
        },
        {
            name: "Billing Entity",
            selector: "billingEntity",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "260",
        },
        {
            name: "Currency",
            selector: "currency",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "140",
        },
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            onEditClick: (row) => {
                setShowCustomerPricingModal(row);
            },
            onDeleteClick: () => {
                setShowDeleteModal(true);
            },
            cell: RenderAction,
            width: "200",
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            showFilter
                            tableTitle="Customer Pricing"
                            isAddEnabled
                            addModalLabel="Add Customer Pricing"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
                            }
                            onAddModalClick={() => {
                                setShowCustomerPricingModal(true);
                            }}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params?.page, limit: params?.limit }}
                        tableClasses="px-start"
                        count={dummyCustomerPricing.length}
                        columns={cols}
                        data={dummyCustomerPricing ?? []}
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

                    {!!showCustomerPricingModal && (
                        <AddEditCustomerPricing
                            showModal={showCustomerPricingModal}
                            closeModal={() => setShowCustomerPricingModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this customer pricing?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default CustomerPricing;
