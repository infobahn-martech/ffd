import Gateway from '../gateway/gateway';

const getCompanyId = () =>
  localStorage.getItem('vendor_id') ||
  localStorage.getItem('company_id') ||
  localStorage.getItem('userid');

const getVendorDashboard = () =>
  Gateway.get(`transport/company_dashboard/${getCompanyId()}`);

const getVendorOrders = () =>
  Gateway.get(`transport/company_orders/${getCompanyId()}`);

export default {
  getVendorDashboard,
  getVendorOrders,
};
