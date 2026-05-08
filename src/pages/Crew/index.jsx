import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { ViewCrewModal } from "./Modals/ViewCrew";
import "./Crew.scss";

// ✅ Change this to your actual store
import useCrewReducer from "../../store/CrewReducer";

const Crew = () => {
    const { fetchAllCrews, crews, isLoadingGet } = useCrewReducer((state) => state);

    const [viewModal, setViewModal] = useState(null);

    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        search: "",
        // sortOrder: -1,
        // sortBy: "createdAt",
    });

    // ✅ fetch crew list (dynamic)
    useEffect(() => {
        fetchAllCrews({
            params: {
                page: params.page,
                limit: params.limit,
                search: params.search,
                sort_by: params.sortBy,
                sort_order: params.sortOrder,
            },
        });
    }, [params.page, params.limit, params.search, params.sortBy, params.sortOrder]);

    // ✅ normalize API response safely
    const tableData = useMemo(() => {
        if (!crews) return { rows: [], total: 0 };

        const rows = Array.isArray(crews)
            ? crews
            : crews?.data || crews?.docs || crews?.results || [];
        const total =
            crews?.pagination?.total ||
            crews?.total ||
            crews?.count ||
            crews?.totalDocs ||
            rows.length;

        return { rows, total };
    }, [crews]);
    const cols = [
        {
            name: "Crew Name",
            selector: "crew_name",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "200",
        },
        {
            name: "Vessel Name",
            selector: "vessel_name",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "200",
        },
        {
            name: "Billing Entity",
            selector: "billing_entity",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "200",
        },
        {
            name: "Nationality",
            selector: "country",
            tableClasses: "table-striped",
            sort: true,
            contentClass: "table-content",
            thclass: "tb-head",
            width: "150",
        },
        {
            name: "Rank",
            selector: "rank",
            tableClasses: "table-striped",
            sort: true,
            contentClass: "table-content",
            thclass: "tb-head",
            width: "150",
        },
        {
            name: "Passport",
            selector: "passport_no",
            tableClasses: "table-striped",
            sort: true,
            contentClass: "table-content",
            thclass: "tb-head",
            width: "120",
        },

        // {
        //     name: "Passport Expiry",
        //     selector: "passport_expiry",
        //     tableClasses: "table-striped",
        //     sort: true,
        //     contentClass: "table-content",
        //     thclass: "tb-head",
        //     width: "120",
        // },
        {
            name: "Visa",
            selector: "visa_no",
            tableClasses: "table-striped",
            sort: true,
            contentClass: "table-content",
            thclass: "tb-head",
            width: "120",
        },
        // {
        //     name: "Visa Expiry",
        //     selector: "visa_expiry",
        //     tableClasses: "table-striped",
        //     sort: true,
        //     contentClass: "table-content",
        //     thclass: "tb-head",
        //     width: "120",
        // },
        {
            name: "IQAMA",
            selector: "iqama_no",
            tableClasses: "table-striped",
            sort: true,
            contentClass: "table-content",
            thclass: "tb-head",
            width: "120",
        },
        // {
        //     name: "IQAMA Expiry",
        //     selector: "iqama_expiry",
        //     tableClasses: "table-striped",
        //     sort: true,
        //     contentClass: "table-content",
        //     thclass: "tb-head",
        //     width: "120",
        // },
    ];

    const handleViewClick = (row) => {
        setViewModal(row);
    };

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Crew Management"
                            isAddEnabled={false}
                            addModalLabel="Add Crew"
                            setSearch={(e) =>
                                setParams({ ...params, search: e, page: 1, limit: 10 })
                            }
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={tableData.total}
                        columns={cols}
                        data={tableData.rows}
                        onPageChange={(currentPage) =>
                            setParams({ ...params, page: currentPage })
                        }
                        setLimit={(newLimit) =>
                            setParams({ ...params, limit: newLimit, page: 1 })
                        }
                        onSorting={(sortBy) =>
                            setParams({
                                ...params,
                                sortBy,
                                sortOrder: params.sortOrder === -1 ? 1 : -1,
                                page: 1,
                            })
                        }
                        onView={handleViewClick}
                    />
                </div>
            </div>

            {!!viewModal && (
                <ViewCrewModal showModal={viewModal} closeModal={() => setViewModal(null)} />
            )}
        </>
    );
};

export default Crew;