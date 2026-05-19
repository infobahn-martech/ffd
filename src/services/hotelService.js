import Gateway from '../gateway/gateway';

const addHotel = (data) => Gateway.post('/hotel/add_hotel', data);
const getHotelData = ({ params }) => Gateway.get('/hotel/get_all_hotel', { params });
/** List for dropdowns: { hotel_id, hotel_name } */
const getHotels = () => Gateway.get('/hotel/get_hotels');
const updateHotel = (data) => Gateway.post(`/hotel/update_hotel`, data);
const deleteHotel = (id) => Gateway.delete(`/hotel/delete_hotel/${id}`);

const createHotelRequest = (formData) =>
  Gateway.post('/hotel/create_hotel_request', formData);

const getHotelRequests = (callId) =>
  Gateway.get(`/hotel/get_hotel_requests/${encodeURIComponent(String(callId))}`);

/**
 * Normalize hotel requests from axios response.
 */
export const extractHotelRequestsFromEnvelope = (responseEnvelope) => {
  const envelope =
    responseEnvelope?.data?.data ?? responseEnvelope?.data ?? [];
  if (Array.isArray(envelope)) return envelope;
  if (Array.isArray(envelope?.data)) return envelope.data;
  if (envelope && typeof envelope === 'object') return [envelope];
  return [];
};

/**
 * Flatten work-order hotel requests (each with nested `crew[]`) into table rows.
 */
export const flattenHotelRequestRows = (workOrders) => {
  if (!Array.isArray(workOrders) || workOrders.length === 0) return [];

  const hasNestedCrew = workOrders.some((item) => Array.isArray(item?.crew));
  if (!hasNestedCrew) return workOrders;

  const rows = [];
  workOrders.forEach((wo) => {
    const woNumber = wo?.wo_number ?? wo?.woNumber ?? '';
    const hotelRequestId = wo?.hotel_request_id ?? wo?.id;
    const hotelName = wo?.hotel_name ?? wo?.hotelName ?? '';
    const checkIn = wo?.checkin_datetime ?? wo?.check_in ?? wo?.check_in_date ?? '';
    const checkOut = wo?.checkout_datetime ?? wo?.check_out ?? wo?.check_out_date ?? '';
    const crewList = Array.isArray(wo?.crew) ? wo.crew : [];

    if (crewList.length === 0) {
      rows.push({
        wo_number: woNumber,
        hotel_request_id: hotelRequestId,
        hotel_name: hotelName,
        check_in: checkIn,
        check_out: checkOut,
        status: wo?.status ?? '',
      });
      return;
    }

    crewList.forEach((crew) => {
      rows.push({
        ...crew,
        wo_number: woNumber || crew?.wo_number,
        hotel_request_id: hotelRequestId ?? crew?.hotel_request_id,
        hotel_request_crew_id: crew?.hotel_request_crew_id ?? crew?.id,
        hotel_name: hotelName || crew?.hotel_name,
        check_in: checkIn || crew?.check_in,
        check_out: checkOut || crew?.check_out,
        status: crew?.stay_status ?? crew?.status ?? wo?.status,
        crew_name: crew?.crew_name ?? crew?.crewName,
        id:
          crew?.hotel_request_crew_id ??
          `${hotelRequestId}-${crew?.crew_change_id}`,
      });
    });
  });

  return rows;
};

export default {
  addHotel,
  getHotelData,
  getHotels,
  updateHotel,
  deleteHotel,
  createHotelRequest,
  getHotelRequests,
};
