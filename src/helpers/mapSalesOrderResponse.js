/**
 * Maps GET sales_order/get_so_items_by_call/{call_id} `data` payload into the FE shape used by SalesOrderList.
 * @param {object} apiData - `response.data.data` from the API envelope
 * @returns {object} Fields merged into card form state
 */
export function mapSalesOrderResponse(apiData) {
  if (!apiData || typeof apiData !== "object") {
    return {
      soCustomerCode: "",
      soCustomerName: "",
      soContactPerson: "",
      email: "",
      soBpCurrency: "",
      soEuroRate: "",
      soPort: "",
      branch: "",
      soSoNo: "",
      soPostingDate: "",
      soDeliveryDate: "",
      soDocumentDate: "",
      soShipName: "",
      soProjectName: "",
      soStatus: "",
      soPoNo: "",
      salesOrderId: "",
      srtNumber: "",
      billingEntity: "",
      lineItemTotal: 0,
      salesOrderList: [],
    };
  }

  const normalizeDate = (d) => {
    if (d == null || d === "" || String(d).trim() === "0000-00-00") return "";
    return String(d).trim();
  };

  const items = Array.isArray(apiData.items) ? apiData.items : [];
  const salesOrderList = items.map((item, idx) => {
    const rawId = Number(item.so_item_id);
    const id = Number.isFinite(rawId) && rawId > 0 ? rawId : idx + 1;
    return {
    id,
    itemNo: item.item_code || "",
    itemDescription: item.item_name || "",
    qty: Number(item.quantity) || 0,
    unitPrice: Number(item.unit_price) || 0,
    totalAmount: Number(item.total_price) || 0,
    discount: 0,
    taxCode: "15%",
    typeOfPo: "",
    supplierCode: "",
    supplierName: "",
    callFile: null,
    poStatus: "Draft",
  };
  });

  const lineItemTotal = salesOrderList.reduce((sum, row) => sum + (Number(row.totalAmount) || 0), 0);

  const soCustomerName = apiData.billing_entity != null ? String(apiData.billing_entity) : "";

  return {
    soCustomerCode: apiData.customer_code != null ? String(apiData.customer_code) : "",
    soCustomerName,
    soContactPerson: apiData.service_requestor_name != null ? String(apiData.service_requestor_name) : "",
    email: apiData.service_requestor_email != null ? String(apiData.service_requestor_email) : "",
    soBpCurrency: apiData.currency != null ? String(apiData.currency) : "",
    soEuroRate: apiData.conversion_rate != null && String(apiData.conversion_rate).trim() !== "" ? String(apiData.conversion_rate) : "",
    soPort: apiData.port != null ? String(apiData.port) : "",
    branch: apiData.branch != null ? String(apiData.branch) : "",
    soSoNo: apiData.sales_order_no != null ? String(apiData.sales_order_no) : "",
    soPostingDate: normalizeDate(apiData.sales_order_date),
    soDeliveryDate: normalizeDate(apiData.delivery_date),
    soDocumentDate: normalizeDate(apiData.document_date),
    soShipName: apiData.vessel_name != null ? String(apiData.vessel_name) : "",
    soProjectName: apiData.project_name != null ? String(apiData.project_name) : "",
    soStatus: apiData.so_status != null ? String(apiData.so_status).trim() : "",
    soPoNo: apiData.po_number != null ? String(apiData.po_number) : "",
    salesOrderId: apiData.sales_order_id != null ? String(apiData.sales_order_id) : "",
    srtNumber: apiData.srt_number != null ? String(apiData.srt_number) : "",
    billingEntity: soCustomerName,
    lineItemTotal,
    salesOrderList,
  };
}
