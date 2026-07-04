import { useState, useEffect, useMemo } from "react";
import { RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { AddEditCustomerPricingInfobhan } from "./Modals/AddEditCustomerPricingInfobhan";
import useCustomerPricingInfobhanReducer from "../../store/CustomerPricingInfobhanReducer";

const CustomerPricingInfobhan = () => {
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        searchTerm: "",
        sortOrder: -1,
        sortBy: "item_code",
    });

    const [showCustomerPricingModal, setShowCustomerPricingModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const {
        getCustomerPriceList,
        customerPriceList,
        totalCount,
        isLoading,
    } = useCustomerPricingInfobhanReducer((state) => state);

    const fetchList = () => {
        const apiParams = {
            ...(params.searchTerm && { searchTerm: params.searchTerm }),
            ...(params.sortBy && { sortBy: params.sortBy }),
            ...(params.sortOrder != null && { sortOrder: params.sortOrder }),
        };
        getCustomerPriceList({ params: apiParams });
    };

    useEffect(() => {
        fetchList();
    }, [params.searchTerm, params.sortBy, params.sortOrder]);

    const pagedData = useMemo(() => {
        const start = (params.page - 1) * params.limit;
        return (customerPriceList ?? []).slice(start, start + params.limit);
    }, [customerPriceList, params.page, params.limit]);

    const cols = [
        {
            name: "Item Code",
            selector: "item_code",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "150",
        },
        {
            name: "Item Name",
            selector: "item_name",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "300",
        },
        {
            name: "Billing Entity",
            selector: "billingEntity",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "200",
        },
        {
            name: "Price",
            selector: "price",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "150",
        },
        // {
        //     name: "Actions",
        //     selector: "linksInfo",
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
                            tableTitle="Customer Pricing Infobhan"
                            isAddEnabled={true}
                            addModalLabel="Add Customer Pricing"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => {
                                setShowCustomerPricingModal(true);
                            }}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={totalCount}
                        columns={cols}
                        isLoading={isLoading}
                        data={pagedData}
                        onPageChange={(currentPage) =>
                            setParams({ ...params, page: currentPage })
                        }
                        setLimit={(newlimit) =>
                            setParams({ ...params, limit: newlimit, page: 1 })
                        }
                        onSorting={(sortBy) => {
                            setParams({
                                ...params,
                                sortBy,
                                sortOrder: params.sortOrder === -1 ? 1 : -1,
                                page: 1,
                            });
                        }}
                    />

                    {!!showCustomerPricingModal && (
                        <AddEditCustomerPricingInfobhan
                            showModal={showCustomerPricingModal}
                            closeModal={() => setShowCustomerPricingModal(false)}
                            onSuccess={() => fetchList()}
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

export default CustomerPricingInfobhan;
