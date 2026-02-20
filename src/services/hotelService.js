import Gateway from '../gateway/gateway';

const addHotel = (data) => Gateway.post('/hotel/add_hotel', data);
const getHotelData = ({ params }) => Gateway.get('/hotel/get_all_hotel', { params });
const updateHotel = (data) => Gateway.post(`/hotel/update_hotel`, data);
const deleteHotel = (id) => Gateway.delete(`/hotel/delete_hotel/${id}`);

export default { addHotel, getHotelData, updateHotel, deleteHotel };
