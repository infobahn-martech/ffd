import { useState, useEffect } from "react";
import { RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { AddEditCustomerPricing } from "./Modals/AddEditCustomerPricing";
import useCustomerPricingReducer from "../../store/CustomerPricingReducer";

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

    const {
        getCustomerPriceList,
        customerPriceList,
        totalCount,
        isLoading,
    } = useCustomerPricingReducer((state) => state);

    useEffect(() => {
        const apiParams = {
            page: params.page,
            limit: params.limit,
            ...(params.searchTerm && { searchTerm: params.searchTerm }),
            ...(params.sortBy && { sortBy: params.sortBy }),
            ...(params.sortOrder != null && { sortOrder: params.sortOrder }),
        };
        getCustomerPriceList({ params: apiParams });
    }, [params]);

    const cols = [
        {
            name: "Item Code",
            selector: "item_code",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "150",
        },
        {
            name: "Item Name",
            selector: "item_name",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "300",
        },
        {
            name: "Billing Entity",
            selector: "billingEntity",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "200",
        },
        {
            name: "Price",
            selector: "price",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "150",
        },
        // {
        //     name: "Actions",
        //     selector: "linksInfo",
        //     tableClasses: "table-striped",
        //     contentClass: "table-content",
        //     thclass: "tb-head",
        //     onEditClick: (row) => {
        //         setShowCustomerPricingModal(row);
        //     },
        //     onDeleteClick: () => {
        //         setShowDeleteModal(true);
        //     },
        //     cell: RenderAction,
        //     width: "200",
        // },
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
                        count={totalCount}
                        columns={cols}
                        isLoading={isLoading}
                        data={customerPriceList ?? []}
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
                            onSuccess={() => {
                                const apiParams = {
                                    page: params.page,
                                    limit: params.limit,
                                    ...(params.searchTerm && { searchTerm: params.searchTerm }),
                                    ...(params.sortBy && { sortBy: params.sortBy }),
                                    ...(params.sortOrder != null && { sortOrder: params.sortOrder }),
                                };
                                getCustomerPriceList({ params: apiParams });
                            }}
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
