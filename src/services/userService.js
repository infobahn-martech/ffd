import Gateway from '../gateway/gateway';

const getUsers = ({ params }) => {
  // Map component params to API params
  const apiParams = {};
  
  if (params?.searchTerm) {
    apiParams.search = params.searchTerm;
  }
  
  if (params?.sortBy) {
    apiParams.sort_by = params.sortBy;
  }
  
  if (params?.page) {
    apiParams.page = params.page;
  }
  
  if (params?.limit) {
    apiParams.limit = params.limit;
  }
  
  return Gateway.get('/users', { params: apiParams });
};

const createUser = (formData) => Gateway.post('/users/create', formData);

const updateUser = (userId, formData) => Gateway.post(`/users/update/${userId}`, formData);

export default { getUsers, createUser, updateUser };
