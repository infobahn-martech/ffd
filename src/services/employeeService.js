import Gateway from '../gateway/gateway';

const addEmployee = (data) => Gateway.post('/employee', data);
const fetchEmployee = ({ params }) => Gateway.get('/employee', { params });
const updateEmployee = (id, data) => Gateway.patch(`/employee/${id}`, data);
const deleteEmployee = (id) => Gateway.delete(`/employee/${id}`);

export default { addEmployee, fetchEmployee, updateEmployee, deleteEmployee };
