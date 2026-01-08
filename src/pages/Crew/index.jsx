import { useState } from "react";
import { RenderAction } from "./RenderCells";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { ViewCrewModal } from "./Modals/ViewCrew";
import "./Crew.scss";

const initialCrews = [
    {
        _id: "1",
        crewName: "John Smith",
        nationality: "American",
        rank: "Captain",
        passport: "P123456",
        visa: "V789012",
        transport: "Airport Pickup",
        cgPass: "CG001",
        zawilPass: "ZW001",
        hotel: "Grand Hotel",
        medicalService: "Completed",
    },
    {
        _id: "2",
        crewName: "Ahmed Al-Rashid",
        nationality: "Saudi",
        rank: "Chief Engineer",
        passport: "P234567",
        visa: "V890123",
        transport: "Taxi Service",
        cgPass: "CG002",
        zawilPass: "ZW002",
        hotel: "Marina Hotel",
        medicalService: "Pending",
    },
    {
        _id: "3",
        crewName: "Maria Garcia",
        nationality: "Spanish",
        rank: "First Officer",
        passport: "P345678",
        visa: "V901234",
        transport: "Company Vehicle",
        cgPass: "CG003",
        zawilPass: "ZW003",
        hotel: "Port View Hotel",
        medicalService: "Completed",
    },
    {
        _id: "4",
        crewName: "David Chen",
        nationality: "Chinese",
        rank: "Second Engineer",
        passport: "P456789",
        visa: "V012345",
        transport: "Airport Pickup",
        cgPass: "CG004",
        zawilPass: "ZW004",
        hotel: "Harbor Inn",
        medicalService: "In Progress",
    },
    {
        _id: "5",
        crewName: "James Wilson",
        nationality: "British",
        rank: "Chief Cook",
        passport: "P567890",
        visa: "V123456",
        transport: "Taxi Service",
        cgPass: "CG005",
        zawilPass: "ZW005",
        hotel: "Seaside Resort",
        medicalService: "Completed",
    },
    {
        _id: "6",
        crewName: "Fatima Hassan",
        nationality: "Egyptian",
        rank: "Deck Officer",
        passport: "P678901",
        visa: "V234567",
        transport: "Company Vehicle",
        cgPass: "CG006",
        zawilPass: "ZW006",
        hotel: "Ocean Breeze Hotel",
        medicalService: "Pending",
    },
    {
        _id: "7",
        crewName: "Roberto Silva",
        nationality: "Brazilian",
        rank: "Electrician",
        passport: "P789012",
        visa: "V345678",
        transport: "Airport Pickup",
        cgPass: "CG007",
        zawilPass: "ZW007",
        hotel: "Portside Hotel",
        medicalService: "Completed",
    },
    {
        _id: "8",
        crewName: "Yuki Tanaka",
        nationality: "Japanese",
        rank: "Bosun",
        passport: "P890123",
        visa: "V456789",
        transport: "Taxi Service",
        cgPass: "CG008",
        zawilPass: "ZW008",
        hotel: "Maritime Hotel",
        medicalService: "In Progress",
    },
];

const Crew = () => {
    const [crews, setCrews] = useState(initialCrews);
    const [viewModal, setViewModal] = useState(null);

    const [params, setParams] = useState({
        page: 1,
        total: 0,
        limit: 10,
        searchTerm: '',
        sortOrder: -1,
        sortBy: 'crewName',
    });

    const cols = [
        {
            name: 'Crew Name',
            selector: 'crewName',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            sort: true,
            thclass: 'tb-head',
            width: '200',
        },
        {
            name: 'Nationality',
            selector: 'nationality',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '150',
        },
        {
            name: 'Rank',
            selector: 'rank',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '150',
        },
        {
            name: 'Passport',
            selector: 'passport',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '120',
        },
        {
            name: 'Visa',
            selector: 'visa',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '120',
        },
        {
            name: 'Transport',
            selector: 'transport',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '150',
        },
        {
            name: 'CG Pass',
            selector: 'cgPass',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '120',
        },
        {
            name: 'Zawil Pass',
            selector: 'zawilPass',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '120',
        },
        {
            name: 'Hotel',
            selector: 'hotel',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '150',
        },
        {
            name: 'Medical',
            selector: 'medicalService',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '150',
        },
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
                                setParams({ ...params, searchTerm: e, page: 1, limit: 10 })
                            }
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params?.page, limit: params?.limit }}
                        tableClasses="px-start"
                        count={crews.length}
                        columns={cols}
                        data={crews ?? []}
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
                        onView={handleViewClick}
                    />
                </div>
            </div>

            {!!viewModal && (
                <ViewCrewModal
                    showModal={viewModal}
                    closeModal={() => setViewModal(null)}
                />
            )}
        </>
    );
};

export default Crew;

