import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { FiNavigation, FiCheckCircle, FiClock, FiMapPin, FiList } from 'react-icons/fi';
import PortalDashboard from '../../../components/PortalDashboard';
import useInhouseDriverReducer from '../../../store/InhouseDriverReducer';

const formatDateTime = (value) => {
    if (!value) return '—';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD MMM YYYY, HH:mm') : value;
};

const quickActions = [
    { label: 'View My Trips', icon: <FiList />, onClick: () => {} },
    { label: 'View Route Map', icon: <FiMapPin />, onClick: () => {} },
];

const tableColumns = [
    { label: 'Trip No', key: 'tripNo' },
    { label: 'From', key: 'from' },
    { label: 'To', key: 'to' },
    { label: 'Pickup', key: 'pickup' },
    { label: 'Drop-off', key: 'dropOff' },
    { label: 'Status', key: 'status', isStatus: true },
];

function InhouseDriverDashboard() {
    const {
        isTripStatsLoading,
        tripStatsData,
        isRequestsLoading,
        requestsData,
        getDriverTripStats,
        getLatestRequestsByDriver,
    } = useInhouseDriverReducer();

    useEffect(() => {
        getDriverTripStats();
        getLatestRequestsByDriver();
    }, [getDriverTripStats, getLatestRequestsByDriver]);

    const summaryCards = useMemo(
        () => [
            { title: 'Total Trips', value: String(tripStatsData?.total ?? 0), icon: <FiNavigation />, color: '#00368c' },
            { title: 'Completed Trips', value: String(tripStatsData?.completed ?? 0), icon: <FiCheckCircle />, color: '#10b981' },
            { title: 'Pending Trips', value: String(tripStatsData?.pending ?? 0), icon: <FiClock />, color: '#f59e0b' },
            { title: 'In Progress Trips', value: String(tripStatsData?.in_progress ?? 0), icon: <FiMapPin />, color: '#3b82f6' },
        ],
        [tripStatsData]
    );

    const statusCards = useMemo(
        () => [
            { label: 'Pending', value: tripStatsData?.pending ?? 0, statusClass: 'status-pending' },
            { label: 'In Progress', value: tripStatsData?.in_progress ?? 0, statusClass: 'status-open' },
            { label: 'Completed', value: tripStatsData?.completed ?? 0, statusClass: 'status-completed' },
        ],
        [tripStatsData]
    );

    const tableRows = useMemo(
        () =>
            (requestsData || []).map((req) => ({
                id: req.transport_request_id,
                tripNo: `TR-${req.transport_request_id}`,
                from: req.from_location,
                to: req.to_location,
                pickup: formatDateTime(req.pickup_datetime),
                dropOff: formatDateTime(req.drop_offdatetime),
                status: req.status,
                fromDet: req.from_location_det,
                toDet: req.to_location_det,
                remarks: req.remarks,
                crew: req.crew || [],
                attachments: req.attachments || [],
            })),
        [requestsData]
    );

    return (
        <PortalDashboard
            title="Inhouse Driver Dashboard"
            subtitle="Overview of your assigned, completed, and pending trips."
            summaryCards={summaryCards}
            statusTitle="Trip Status Overview"
            statusCards={statusCards}
            quickActions={quickActions}
            tableTitle="Recent Trips"
            tableColumns={tableColumns}
            tableRows={tableRows}
            isTableLoading={isTripStatsLoading || isRequestsLoading}
            emptyMessage="No trips found"
            expandable
            rowKey={(row) => row.id}
            renderExpandedRow={(row) => (
                <div className="vendor-table-scroll">
                    {(row.fromDet || row.toDet || row.remarks) && (
                        <p style={{ marginBottom: 12 }}>
                            {row.fromDet && <span><strong>From details:</strong> {row.fromDet}</span>}
                            {row.fromDet && (row.toDet || row.remarks) && ' — '}
                            {row.toDet && <span><strong>To details:</strong> {row.toDet}</span>}
                            {row.toDet && row.remarks && ' — '}
                            {row.remarks && <span><strong>Remarks:</strong> {row.remarks}</span>}
                        </p>
                    )}
                    <table className="vendor-table" style={{ marginBottom: 0, minWidth: 720 }}>
                        <thead>
                            <tr>
                                <th>Crew Name</th>
                                <th>Rank</th>
                                <th>Passport No</th>
                                <th>Nationality</th>
                            </tr>
                        </thead>
                        <tbody>
                            {row.crew.length ? (
                                row.crew.map((crew, i) => (
                                    <tr key={`${row.id}-crew-${i}`}>
                                        <td>{crew.crew_name}</td>
                                        <td>{crew.rank ?? '—'}</td>
                                        <td>{crew.passport_no}</td>
                                        <td>{crew.nationality}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ color: '#6b7280' }}>
                                        No crew details available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {!!row.attachments.length && (
                        <div style={{ marginTop: 12 }}>
                            <strong>Attachments:</strong>{' '}
                            {row.attachments.map((att, i) => {
                                const url = typeof att === 'string' ? att : att?.url || att?.file_url || att?.path;
                                const label = typeof att === 'string' ? `Attachment ${i + 1}` : att?.name || att?.file_name || `Attachment ${i + 1}`;
                                return url ? (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ marginRight: 12 }}>
                                        {label}
                                    </a>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
            )}
        />
    );
}

export default InhouseDriverDashboard;
