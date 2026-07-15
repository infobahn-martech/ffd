import Gateway from "../gateway/gateway";

const getOnStationList = ({ params }) => {
  const apiParams = {};
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  if (params?.search) apiParams.search = params.search;
  return Gateway.get("on_station/get_list", { params: apiParams });
};

const toggleOnStation = ({ call_id, is_enabled }) =>
  Gateway.post("on_station/toggle", { call_id, is_enabled });

const createSalesOrder = ({ on_station_id }) =>
  Gateway.post("on_station/create_sales_order", { on_station_id });

const convertToTaxInvoice = ({ sales_order_id }) =>
  Gateway.post("sales_order/convert_to_tax_invoice", { sales_order_id });

const sendTaxInvoice = ({ tax_invoice_id }) =>
  Gateway.post("sales_order/send_tax_invoice", { tax_invoice_id });

export default {
  getOnStationList,
  toggleOnStation,
  createSalesOrder,
  convertToTaxInvoice,
  sendTaxInvoice,
};
