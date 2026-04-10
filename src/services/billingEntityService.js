import Gateway from '../gateway/gateway';

const getBillingEntities = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.sortOrder != null) apiParams.sort_order = params.sortOrder;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get('/billingentity', { params: apiParams });
};

const getCustomerPriceList = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.sortOrder != null) apiParams.sort_order = params.sortOrder;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get('/billingentity/get_customer_price_list', { params: apiParams });
};

export default { getBillingEntities, getCustomerPriceList };
