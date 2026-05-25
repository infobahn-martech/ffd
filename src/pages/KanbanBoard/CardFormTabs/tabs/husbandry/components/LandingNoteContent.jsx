import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import CustomModal from "../../../../../../components/CustomModal";
import { FormField, FormInput, FormSelect } from "./Husbandry.components";
import MaterialTablePagination from "./MaterialTablePagination";
import DateTimePickerField from "../../../components/DateTimePickerField";
import {
  buildApiDateTime,
  formatDisplayDateTime,
  splitApiDateTimeParts,
} from "../../../../../../helpers/dateTimeFieldUtils";
import useLandingNoteReducer from "../../../../../../store/LandingNoteReducer";
import editIcon from "../../../../../../assets/images/edit.svg";
import deleteIcon from "../../../../../../assets/images/delete.svg";
import eyeIcon from "../../../../../../assets/images/eye.svg";


// AttachmentsList Component (from Operation.jsx)
const AttachmentsList = ({ attachments = [], onAdd, onRemove, cardColor, isDragging, onDragEnter, onDragLeave, onDragOver, onDrop, fileInputRef, onFileInputChange }) => {
  return (
    <div className="document-upload-wrapper">
      <div
        className={`document-upload-zone ${isDragging ? "dragging" : ""}`}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{ "--card-color": cardColor || "#00368c" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input-hidden"
          accept="*/*"
          multiple
          onChange={onFileInputChange}
        />
        <div className="upload-zone-content">
          <div className="upload-icon-wrapper"></div>
          <div className="upload-text-content">
            <p className="upload-main-text">
              Drag and drop your files here, or{" "}
              <span className="upload-link">click to browse</span>
            </p>
          </div>
        </div>
      </div>
      {attachments.length > 0 && (
        <div className="document-file-preview-list">
          {attachments.map((item, index) => (
            <div key={index} className="document-file-preview-item">
              <div className="document-file-preview-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="document-file-preview-info">
                <span className="document-file-preview-name">{item.name || item}</span>
                {item.size != null && (
                  <span className="document-file-preview-size">
                    {item.size < 1024 * 1024
                      ? `${(item.size / 1024).toFixed(1)} KB`
                      : `${(item.size / 1024 / 1024).toFixed(2)} MB`}
                  </span>
                )}
              </div>
              <button
                className="document-file-preview-remove"
                onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                type="button"
                title="Remove file"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ReactQuillEditor Component (from Operation.jsx)
const ReactQuillEditor = ({ value, onChange, placeholder, name = "remarks", className = "" }) => {
  const quillRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "link",
    "image",
  ];

  const handleChange = (content) => {
    const syntheticEvent = { target: { value: content, name: name } };
    onChange(syntheticEvent);
  };

  return (
    <div className={`react-quill-wrapper ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Enter remarks..."}
      />
    </div>
  );
};

const LandingNoteContent = ({ formValues, handleChange, cardColor }) => {
  const {
    getAllLandingNotes,
    getLandingNoteById,
    updateLandingNote,
    landingNotes,
    landingNoteTotal,
    landingNoteDetail,
    clearLandingNoteDetail,
    isLoadingList,
    isLoadingView,
    isBeingUpdated,
  } = useLandingNoteReducer((state) => state);

  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [convertingNote, setConvertingNote] = useState(null);
  const [viewingNote, setViewingNote] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);
  const documentsFileInputRef = useRef(null);
  const [expandedConvertOrders, setExpandedConvertOrders] = useState({ 1: true });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [landingPage, setLandingPage] = useState(1);
  const LANDING_LIMIT = 10;
  const dropdownButtonRefs = useRef({});

  // Form state
  const [formData, setFormData] = useState({
    landingNoteNo: "",
    date: "",
    time: "",
    receivedFrom: "",
    location: "",
    signature: "",
    landingProof: [],
    remarks: "",
  });

  useEffect(() => {
    const callId = Number(formValues?.call_id || formValues?.callId || formValues?.card_call_id || 0);
    if (!callId) return;
    getAllLandingNotes({ call_id: callId, page: landingPage, limit: LANDING_LIMIT });
  }, [formValues?.call_id, formValues?.callId, formValues?.card_call_id, landingPage]);

  useEffect(() => {
    if (!showModal || !editingNote || !landingNoteDetail) return;
    const detailId = landingNoteDetail.landing_note_id ?? landingNoteDetail.id;
    const editingId = editingNote.landing_note_id ?? editingNote.id;
    if (detailId !== editingId) return;
    const { date, time } = splitApiDateTimeParts(landingNoteDetail.landing_date || "", "");
    setFormData((prev) => ({
      ...prev,
      date: date || prev.date,
      time: time || prev.time,
      receivedFrom: landingNoteDetail.received_from || prev.receivedFrom,
      location: landingNoteDetail.location || prev.location,
      signature: landingNoteDetail.signature || prev.signature,
      remarks: landingNoteDetail.remarks || prev.remarks,
    }));
  }, [landingNoteDetail]);

  const handleOpenModal = (note = null) => {
    setFormErrors({});
    if (note) {
      const { date, time } = splitApiDateTimeParts(note.landing_date || "", "");
      setEditingNote(note);
      setFormData({
        landingNoteNo: note.landing_note_no || "",
        date,
        time,
        receivedFrom: note.received_from || "",
        location: note.location || "",
        signature: note.signature || "",
        landingProof: [],
        remarks: note.remarks || "",
      });
      setSelectedFiles([]);
      getLandingNoteById({ landingNoteId: note.landing_note_id ?? note.id });
    } else {
      setEditingNote(null);
      setFormData({
        landingNoteNo: "",
        date: "",
        time: "",
        receivedFrom: "",
        location: "",
        signature: "",
        landingProof: [],
        remarks: "",
      });
      setSelectedFiles([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormErrors({});
    setFormData({
      landingNoteNo: "",
      date: "",
      time: "",
      receivedFrom: "",
      location: "",
      signature: "",
      landingProof: [],
      remarks: "",
    });
    setSelectedFiles([]);
    clearLandingNoteDetail();
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.date) errors.date = "Date is required";
    else if (!formData.time) errors.date = "Time is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const callId = Number(formValues?.call_id || formValues?.callId || formValues?.card_call_id || 0);
    const landingDateTime = buildApiDateTime(formData.date, formData.time);

    const noteItems = landingNoteDetail?.items || editingNote?.items || [];
    const items = noteItems.map((item) => {
      const entry = {
        quantity: Number(item.quantity) || 0,
        slot_no_id: Number(item.slot_no_id) || 0,
        reason_id: Number(item.reason_id) || 0,
        dispatch_date: item.dispatch_date || "",
        transportation_required: Number(item.transportation_required) || 0,
      };
      if (item.landing_note_item_id) entry.landing_note_item_id = item.landing_note_item_id;
      if (Number(item.transportation_required) === 1 && item.transportation) {
        entry.transportation = {
          vehicle_type_id: item.transportation.vehicle_type_id || null,
          from_location_id: item.transportation.from_location_id || null,
          pickup_location: item.transportation.pickup_location || "",
          to_location_id: item.transportation.to_location_id || null,
          driver_id: item.transportation.driver_id || null,
        };
      }
      return entry;
    });

    const fd = new FormData();
    fd.append("landing_date", landingDateTime);
    fd.append("inbound_id", String(editingNote?.inbound_id || landingNoteDetail?.inbound_id || ""));
    fd.append("warehouse_id", String(editingNote?.warehouse_id || landingNoteDetail?.warehouse_id || ""));
    fd.append("received_from", formData.receivedFrom || "");
    fd.append("location", formData.location || "");
    fd.append("signature", formData.signature || "");
    fd.append("remarks", formData.remarks || "");
    fd.append("items", JSON.stringify(items));
    if (selectedFiles.length > 0 && selectedFiles[0] instanceof File) {
      fd.append("file", selectedFiles[0]);
    }

    if (editingNote) {
      const landingNoteId = editingNote.landing_note_id ?? editingNote.id;
      updateLandingNote({
        landingNoteId,
        data: fd,
        cb: () => {
          handleCloseModal();
          getAllLandingNotes({ call_id: callId, page: landingPage, limit: LANDING_LIMIT });
        },
      });
    }
  };

  // File upload handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter((file) => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
      const fileExtension = "." + file.name.split(".").pop().toLowerCase();
      return file.size <= maxSize && validTypes.includes(fileExtension);
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    if (validFiles.length > 0) {
      setFormErrors((prev) => {
        if (!prev.landingProof) return prev;
        const next = { ...prev };
        delete next.landingProof;
        return next;
      });
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    return formatDisplayDateTime(dateString);
  };

  const handleDelete = (_noteId) => {
    // Delete API wiring handled in T12
  };

  // Form state for Convert to Dispatch modal
  const [convertFormData, setConvertFormData] = useState({
    date: "",
    warehouse: "",
    signature: "",
    deliveryLocation: "",
    deliverTo: "",
    documents: [],
    remarks: "",
    orders: [{
      id: 1,
      orderNo: "",
      poDo: "",
      quantity: "",
      packageType: "",
      description: "",
      transportation: false,
      typeOfVehicle: "",
      fromLocation: "",
      pickUpFrom: "",
      toLocation: "",
      driverName: "",
      isPackingRequired: false,
      repackingPallets: "",
      repackingRolls: ""
    }],
  });

  // Dummy options for dropdowns
  const warehouseOptions = [
    { value: "warehouse1", label: "Warehouse 1" },
    { value: "warehouse2", label: "Warehouse 2" },
    { value: "warehouse3", label: "Warehouse 3" },
    { value: "warehouse4", label: "Warehouse 4" },
  ];

  const locationOptions = [
    { value: "Rastanura", label: "Rastanura" },
    { value: "Dammam", label: "Dammam" },
    { value: "Al Jubail", label: "Al Jubail" },
    { value: "Al Khafji", label: "Al Khafji" },
    { value: "As Safaniya", label: "As Safaniya" },
  ];

  const vehicleTypeOptions = [
    { value: "Car", label: "Car" },
    { value: "Truck", label: "Truck" },
    { value: "Van", label: "Van" },
    { value: "Bus", label: "Bus" },
    { value: "Motorcycle", label: "Motorcycle" },
  ];

  const driverNameOptions = [
    { value: "ABDUL", label: "ABDUL" },
    { value: "AHMED", label: "AHMED" },
    { value: "MOHAMMED", label: "MOHAMMED" },
    { value: "ALI", label: "ALI" },
    { value: "HASSAN", label: "HASSAN" },
  ];

  const handleConvertToDispatch = (note) => {
    handleCloseDropdown();
    setConvertingNote(note);
    // Pre-fill form with note data
    setConvertFormData({
      date: note.landing_date || "",
      warehouse: "",
      signature: "",
      deliveryLocation: "",
      deliverTo: "",
      documents: [],
      remarks: "",
      orders: [{
        id: 1,
        orderNo: note.landing_note_no || "",
        poDo: note.items?.[0]?.po_no || "",
        quantity: note.items?.[0]?.quantity || "",
        packageType: note.items?.[0]?.package_type || "",
        description: note.items?.[0]?.description || "",
        transportation: false,
        typeOfVehicle: "",
        fromLocation: "",
        pickUpFrom: "",
        toLocation: "",
        driverName: "",
        isPackingRequired: false,
        repackingPallets: "",
        repackingRolls: ""
      }],
    });
    setExpandedConvertOrders({ 1: true });
    setShowConvertModal(true);
  };

  const handleCloseConvertModal = () => {
    setShowConvertModal(false);
    setConvertingNote(null);
    setConvertFormData({
      date: "",
      warehouse: "",
      signature: "",
      deliveryLocation: "",
      deliverTo: "",
      documents: [],
      remarks: "",
      orders: [{
        id: 1,
        orderNo: "",
        poDo: "",
        quantity: "",
        packageType: "",
        description: "",
        transportation: false,
        typeOfVehicle: "",
        fromLocation: "",
        pickUpFrom: "",
        toLocation: "",
        driverName: "",
        isPackingRequired: false,
        repackingPallets: "",
        repackingRolls: ""
      }],
    });
  };

  const handleConvertFormChange = (field, value) => {
    setConvertFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConvertOrderChange = (orderId, field, value) => {
    setConvertFormData((prev) => ({
      ...prev,
      orders: prev.orders.map((order) =>
        order.id === orderId ? { ...order, [field]: value } : order
      ),
    }));
  };

  const handleAddNewConvertOrder = () => {
    const newOrderId = convertFormData.orders.length > 0
      ? Math.max(...convertFormData.orders.map((o) => o.id)) + 1
      : 1;
    setConvertFormData((prev) => ({
      ...prev,
      orders: [
        ...prev.orders,
        {
          id: newOrderId,
          orderNo: "",
          poDo: "",
          quantity: "",
          packageType: "",
          description: "",
          transportation: false,
          typeOfVehicle: "",
          fromLocation: "",
          pickUpFrom: "",
          toLocation: "",
          driverName: "",
          isPackingRequired: false,
          repackingPallets: "",
          repackingRolls: ""
        },
      ],
    }));
    setExpandedConvertOrders((prev) => ({
      ...prev,
      [newOrderId]: true,
    }));
  };

  const handleRemoveConvertOrder = (orderId) => {
    if (convertFormData.orders.length > 1) {
      setConvertFormData((prev) => ({
        ...prev,
        orders: prev.orders.filter((order) => order.id !== orderId),
      }));
      setExpandedConvertOrders((prev) => {
        const newExpanded = { ...prev };
        delete newExpanded[orderId];
        return newExpanded;
      });
    }
  };

  const toggleConvertOrderExpand = (orderId) => {
    setExpandedConvertOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Handle documents drag and drop
  const handleDocumentsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(true);
  };

  const handleDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(false);
  };

  const handleDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const currentAttachments = convertFormData.documents || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      setConvertFormData((prev) => ({
        ...prev,
        documents: updatedAttachments,
      }));
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentAttachments = convertFormData.documents || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      setConvertFormData((prev) => ({
        ...prev,
        documents: updatedAttachments,
      }));
    }
    if (documentsFileInputRef.current) {
      documentsFileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemove = (index) => {
    const currentAttachments = convertFormData.documents || [];
    const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
    setConvertFormData((prev) => ({
      ...prev,
      documents: updatedAttachments,
    }));
  };

  const handleConvertSubmit = (e) => {
    e.preventDefault();
    console.log("Convert to Dispatch form submitted:", convertFormData);
    // Here you can implement the logic to save/convert the note to dispatch note
    handleCloseConvertModal();
  };

  const handleToggleDropdown = (noteId, e) => {
    e.stopPropagation();
    if (openDropdownId === noteId) {
      setOpenDropdownId(null);
    } else {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
      dropdownButtonRefs.current[noteId] = button;
      setOpenDropdownId(noteId);
    }
  };

  const handleCloseDropdown = () => {
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the dropdown button or inside the portal dropdown menu
      const isDropdownButton = event.target.closest('.action-dropdown-wrapper');
      const isDropdownMenu = event.target.closest('[data-dropdown-menu]');

      if (!isDropdownButton && !isDropdownMenu) {
        setOpenDropdownId(null);
      }
    };

    const handleScroll = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [openDropdownId]);

  const handleViewNote = (note) => {
    handleCloseDropdown();
    setViewingNote(note);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingNote(null);
  };

  const handlePrintNote = (note) => {
    handleCloseDropdown();
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print - Landing Note ${note.landing_note_no || ''}</title>
          <style>
            body {
              font-family: "Open Sans", sans-serif;
              padding: 20px;
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #00368c;
              padding-bottom: 15px;
            }
            .print-header h1 {
              color: #00368c;
              margin: 0;
              font-size: 24px;
            }
            .print-section {
              margin-bottom: 25px;
            }
            .print-section-title {
              font-size: 18px;
              font-weight: bold;
              color: #00368c;
              margin-bottom: 15px;
              border-bottom: 1px solid #e2e2ea;
              padding-bottom: 8px;
            }
            .print-row {
              display: flex;
              margin-bottom: 12px;
            }
            .print-label {
              font-weight: 600;
              width: 200px;
              color: #666;
            }
            .print-value {
              flex: 1;
              color: #1a1a1a;
            }
            .print-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e2ea;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              .print-footer { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Landing Note Details</h1>
          </div>
          
          <div class="print-section">
            <div class="print-section-title">Note Information</div>
            <div class="print-row">
              <div class="print-label">Landing Note No:</div>
              <div class="print-value">${note.landing_note_no || "-"}</div>
            </div>
            <div class="print-row">
              <div class="print-label">Date:</div>
              <div class="print-value">${formatDate(note.landing_date) || "-"}</div>
            </div>
            <div class="print-row">
              <div class="print-label">PO/DO:</div>
              <div class="print-value">${note.items?.[0]?.po_no || "-"}</div>
            </div>
            <div class="print-row">
              <div class="print-label">Quantity:</div>
              <div class="print-value">${note.items?.[0]?.quantity || "-"}</div>
            </div>
            <div class="print-row">
              <div class="print-label">Package Type:</div>
              <div class="print-value">${note.items?.[0]?.package_type || "-"}</div>
            </div>
            <div class="print-row">
              <div class="print-label">Description:</div>
              <div class="print-value">${note.items?.[0]?.description || "-"}</div>
            </div>
            <div class="print-row">
              <div class="print-label">Landing Proof:</div>
              <div class="print-value">${note.document ? note.document.file_name || "1 file" : "No files"}</div>
            </div>
          </div>

          <div class="print-footer">
            <p>Printed on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">Edit Landing Note</h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="landingNoteForm" onSubmit={handleSubmit}>
          <div className="permInputs row mb-lg-3">
            <div className="col-12 mb-3">
              <FormField label="Landing Note No">
                <div className="cf-input" style={{ backgroundColor: "#ececec", cursor: "not-allowed" }}>
                  <input
                    type="text"
                    value={formData.landingNoteNo}
                    readOnly
                    style={{ backgroundColor: "transparent", cursor: "not-allowed", color: "#666" }}
                  />
                </div>
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Date and Time *">
                <DateTimePickerField
                  dateValue={formData.date}
                  timeValue={formData.time}
                  onDateTimeChange={(nextValues) => {
                    setFormData((prev) => ({
                      ...prev,
                      date: nextValues.date,
                      time: nextValues.time,
                    }));
                    setFormErrors((prev) => {
                      if (!prev.date) return prev;
                      const next = { ...prev };
                      delete next.date;
                      return next;
                    });
                  }}
                  dateFieldName="date"
                  timeFieldName="time"
                  placeholder="YYYY-MM-DD HH:mm"
                  hasError={!!formErrors.date}
                />
              </FormField>
              {formErrors.date && <span style={{ color: "#dc3545", fontSize: "12px", display: "block", marginTop: "-12px", marginBottom: "4px" }}>{formErrors.date}</span>}
            </div>

            <div className="col-md-6 mb-3">
              <FormField label="Received From">
                <FormInput
                  type="text"
                  value={formData.receivedFrom}
                  onChange={(e) => handleFormChange("receivedFrom", e.target.value)}
                  placeholder="Enter received from..."
                />
              </FormField>
            </div>

            <div className="col-md-6 mb-3">
              <FormField label="Location">
                <FormInput
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                  placeholder="Enter location..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Signature">
                <FormInput
                  type="text"
                  value={formData.signature}
                  onChange={(e) => handleFormChange("signature", e.target.value)}
                  placeholder="Enter signature..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Landing Proof">
                <div className="document-upload-wrapper">
                  <div
                    className={`document-upload-zone ${isDragging ? "dragging" : ""}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleBrowseClick}
                    style={{
                      "--card-color": cardColor || "#00368c",
                      minHeight: "56px",
                      padding: "10px 16px",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="landingProofDocuments"
                      multiple
                      onChange={handleFileChange}
                      className="file-input-hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <div className="upload-zone-content">
                      <div className="upload-text-content">
                        <p className="upload-main-text">
                          Drag and drop or{" "}
                          <span className="upload-link">click to browse</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  {selectedFiles.length > 0 && (
                    <div className="document-file-preview-list">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="document-file-preview-item">
                          <div className="document-file-preview-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div className="document-file-preview-info">
                            <span className="document-file-preview-name">{file.name}</span>
                            {file.size != null && (
                              <span className="document-file-preview-size">
                                {file.size < 1024 * 1024
                                  ? `${(file.size / 1024).toFixed(1)} KB`
                                  : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                              </span>
                            )}
                          </div>
                          <button
                            className="document-file-preview-remove"
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(index); }}
                            type="button"
                            title="Remove file"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <div className="card-description-wrapper">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formData.remarks || ""}
                    onChange={(e) => handleFormChange("remarks", e.target.value)}
                    placeholder="Enter remarks..."
                    name="remarks"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleCloseModal}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="landingNoteForm"
        className="btn btn-primary"
        style={{ backgroundColor: "#00368c" }}
        disabled={isBeingUpdated || isLoadingView}
      >
        {isBeingUpdated ? "Updating..." : isLoadingView ? "Loading..." : "Update Note"}
      </button>
    </div>
  );

  // Convert to Dispatch Modal Render Functions
  const renderConvertHeader = () => (
    <>
      <h1 className="modal-title">Convert to Dispatch Note</h1>
    </>
  );

  const renderConvertBody = () => {
    const packageTypeOptions = [
      { value: "Box", label: "Box" },
      { value: "Pallet", label: "Pallet" },
      { value: "Crate", label: "Crate" },
      { value: "Bag", label: "Bag" },
      { value: "Container", label: "Container" },
      { value: "Loose", label: "Loose" },
    ];

    return (
      <div className="modal-body">
        <div className="lead-form">
          <form id="convertToDispatchForm" onSubmit={handleConvertSubmit}>
            {/* Basic Details Section */}
            <div style={{ marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid #e2e2ea" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1a1a1a" }}>
                Basic Details
              </h3>
              <div className="row mb-lg-3">
                <div className="col-md-6 mb-3">
                  <FormField label="Date">
                    <div className="cf-select cf-date-input">
                      <input
                        type="date"
                        value={convertFormData.date}
                        onChange={(e) => handleConvertFormChange("date", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontSize: "14px",
                          color: "#1a1a1a",
                          fontFamily: "inherit",
                          padding: 0,
                          flex: 1,
                          cursor: "pointer",
                        }}
                      />
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          flexShrink: 0,
                          marginLeft: "8px",
                          color: "#666",
                          pointerEvents: "none",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                  </FormField>
                </div>

                <div className="col-md-6 mb-3">
                  <FormField label="Warehouse">
                    <FormSelect
                      value={convertFormData.warehouse}
                      onChange={(e) => handleConvertFormChange("warehouse", e.target.value)}
                      options={warehouseOptions}
                      placeholder="Select warehouse"
                    />
                  </FormField>
                </div>
              </div>

              {/* Dispatch Details Section */}
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e2e2ea" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1a1a1a" }}>
                  Dispatch Details
                </h3>
                <div className="row mb-lg-3">
                  <div className="col-md-4 mb-3">
                    <FormField label="Signature">
                      <FormInput
                        type="text"
                        value={convertFormData.signature}
                        onChange={(e) => handleConvertFormChange("signature", e.target.value)}
                        placeholder="Enter signature..."
                      />
                    </FormField>
                  </div>

                  <div className="col-md-4 mb-3">
                    <FormField label="Delivery Location">
                      <FormInput
                        type="text"
                        value={convertFormData.deliveryLocation}
                        onChange={(e) => handleConvertFormChange("deliveryLocation", e.target.value)}
                        placeholder="Enter delivery location..."
                      />
                    </FormField>
                  </div>

                  <div className="col-md-4 mb-3">
                    <FormField label="Deliver to (Person Name)">
                      <FormInput
                        type="text"
                        value={convertFormData.deliverTo}
                        onChange={(e) => handleConvertFormChange("deliverTo", e.target.value)}
                        placeholder="Enter person name..."
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0, color: "#1a1a1a" }}>
                  Order Details
                </h3>
                <button
                  type="button"
                  onClick={handleAddNewConvertOrder}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    backgroundColor: "#00368c",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 4px rgba(0, 54, 140, 0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#002d6b";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 54, 140, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#00368c";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 54, 140, 0.2)";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add New Order
                </button>
              </div>

              {convertFormData.orders.map((order, index) => (
                <div
                  key={order.id}
                  style={{
                    marginBottom: "16px",
                    border: "1px solid #e2e2ea",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#f8f9fa",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#00368c";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 54, 140, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e2e2ea";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                  }}
                >
                  <div
                    onClick={() => toggleConvertOrderExpand(order.id)}
                    style={{
                      padding: "16px 20px",
                      backgroundColor: "#f8f9fa",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f1f5";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                  >
                    <span style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a" }}>
                      Order {index + 1}
                    </span>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      {convertFormData.orders.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveConvertOrder(order.id);
                          }}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "500",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#c82333";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#dc3545";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          Remove
                        </button>
                      )}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          transform: expandedConvertOrders[order.id] ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.3s ease",
                          color: "#666",
                        }}
                      >
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {expandedConvertOrders[order.id] && (
                    <div style={{ padding: "24px", backgroundColor: "white" }}>
                      <div className="row mb-lg-3">
                        <div className="col-md-6 mb-3">
                          <FormField label="Order No">
                            <FormInput
                              type="text"
                              value={order.orderNo}
                              onChange={(e) => handleConvertOrderChange(order.id, "orderNo", e.target.value)}
                              placeholder="Enter order number..."
                            />
                          </FormField>
                        </div>

                        <div className="col-md-6 mb-3">
                          <FormField label="PO/DO">
                            <FormInput
                              type="text"
                              value={order.poDo}
                              onChange={(e) => handleConvertOrderChange(order.id, "poDo", e.target.value)}
                              placeholder="Enter PO/DO number..."
                            />
                          </FormField>
                        </div>

                        <div className="col-md-6 mb-3">
                          <FormField label="Description">
                            <FormInput
                              type="text"
                              value={order.description}
                              onChange={(e) => handleConvertOrderChange(order.id, "description", e.target.value)}
                              placeholder="Enter description..."
                            />
                          </FormField>
                        </div>

                        <div className="col-md-6 mb-3">
                          <FormField label="Package Type">
                            <FormSelect
                              value={order.packageType}
                              onChange={(e) => handleConvertOrderChange(order.id, "packageType", e.target.value)}
                              options={packageTypeOptions}
                              placeholder="Select package type..."
                            />
                          </FormField>
                        </div>

                        <div className="col-md-6 mb-3">
                          <FormField label="Quantity">
                            <FormInput
                              type="number"
                              value={order.quantity}
                              onChange={(e) => handleConvertOrderChange(order.id, "quantity", e.target.value)}
                              placeholder="Enter quantity..."
                            />
                          </FormField>
                        </div>
                      </div>

                      {/* Transportation Section */}
                      <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e2e2ea" }}>
                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={order.transportation || false}
                              onChange={(e) => handleConvertOrderChange(order.id, "transportation", e.target.checked)}
                              style={{ cursor: "pointer", width: "18px", height: "18px" }}
                            />
                            <span style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a" }}>Transportation</span>
                          </label>
                        </div>

                        {order.transportation && (
                          <div className="row mb-lg-3">
                            <div className="col-md-6 mb-3">
                              <FormField label="Type of Vehicle">
                                <FormSelect
                                  value={order.typeOfVehicle}
                                  onChange={(e) => handleConvertOrderChange(order.id, "typeOfVehicle", e.target.value)}
                                  options={vehicleTypeOptions}
                                  placeholder="Select type of vehicle..."
                                />
                              </FormField>
                            </div>

                            <div className="col-md-6 mb-3">
                              <FormField label="From Location">
                                <FormSelect
                                  value={order.fromLocation}
                                  onChange={(e) => handleConvertOrderChange(order.id, "fromLocation", e.target.value)}
                                  options={locationOptions}
                                  placeholder="Select from location..."
                                />
                              </FormField>
                            </div>

                            <div className="col-md-6 mb-3">
                              <FormField label="Pick-Up From">
                                <FormInput
                                  type="text"
                                  value={order.pickUpFrom}
                                  onChange={(e) => handleConvertOrderChange(order.id, "pickUpFrom", e.target.value)}
                                  placeholder="Enter pick-up location..."
                                />
                              </FormField>
                            </div>

                            <div className="col-md-6 mb-3">
                              <FormField label="To Location">
                                <FormSelect
                                  value={order.toLocation}
                                  onChange={(e) => handleConvertOrderChange(order.id, "toLocation", e.target.value)}
                                  options={locationOptions}
                                  placeholder="Select to location..."
                                />
                              </FormField>
                            </div>

                            <div className="col-md-6 mb-3">
                              <FormField label="Driver Name">
                                <FormSelect
                                  value={order.driverName}
                                  onChange={(e) => handleConvertOrderChange(order.id, "driverName", e.target.value)}
                                  options={driverNameOptions}
                                  placeholder="Select driver name..."
                                />
                              </FormField>
                            </div>
                          </div>
                        )}

                        {/* Is Packing Required, Repacking Pallets, Repacking Rolls - After Transportation */}
                        <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e2e2ea" }}>
                          <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={order.isPackingRequired || false}
                                onChange={(e) => handleConvertOrderChange(order.id, "isPackingRequired", e.target.checked)}
                                style={{ cursor: "pointer", width: "18px", height: "18px" }}
                              />
                              <span style={{ fontSize: "15px", fontWeight: "600", color: "#1a1a1a" }}>Is Packing Required?</span>
                            </label>
                          </div>

                          {order.isPackingRequired && (
                            <div className="row mb-lg-3">
                              <div className="col-md-6 mb-3">
                                <FormField label="Repacking Pallets">
                                  <FormInput
                                    type="text"
                                    value={order.repackingPallets}
                                    onChange={(e) => handleConvertOrderChange(order.id, "repackingPallets", e.target.value)}
                                    placeholder="Enter repacking pallets..."
                                  />
                                </FormField>
                              </div>

                              <div className="col-md-6 mb-3">
                                <FormField label="Repacking Rolls">
                                  <FormInput
                                    type="text"
                                    value={order.repackingRolls}
                                    onChange={(e) => handleConvertOrderChange(order.id, "repackingRolls", e.target.value)}
                                    placeholder="Enter repacking rolls..."
                                  />
                                </FormField>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Documents & Remarks Section - Outside Order Details */}
            <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "2px solid #e2e2ea" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px", color: "#1a1a1a" }}>
                Documents & Remarks
              </h3>

              {/* Document Upload - Full Width */}
              <div className="mb-lg-3 mb-sm-0" style={{ marginBottom: "24px" }}>
                <FormField label="Document Upload">
                  <div style={{ marginTop: "8px" }}>
                    <AttachmentsList
                      attachments={convertFormData.documents || []}
                      onAdd={() => { }}
                      onRemove={handleDocumentsRemove}
                      cardColor={cardColor}
                      isDragging={isDraggingDocuments}
                      onDragEnter={handleDocumentsDragEnter}
                      onDragLeave={handleDocumentsDragLeave}
                      onDragOver={handleDocumentsDragOver}
                      onDrop={handleDocumentsDrop}
                      fileInputRef={documentsFileInputRef}
                      onFileInputChange={handleDocumentsFileInputChange}
                    />
                  </div>
                </FormField>
              </div>

              {/* Remarks - Full Width, Below Document Upload */}
              <div className="mb-lg-3 mb-sm-0">
                <div className="card-description-wrapper">
                  <FormField label="Remarks">
                    <ReactQuillEditor
                      value={convertFormData.remarks || ""}
                      onChange={(e) => handleConvertFormChange("remarks", e.target.value)}
                      placeholder="Enter remarks..."
                      name="remarks"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderConvertFooter = () => (
    <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px" }}>
      <button
        type="button"
        onClick={handleCloseConvertModal}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
          color: "#333",
          border: "1px solid #e2e2ea",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Cancel
      </button>
      <button
        type="submit"
        form="convertToDispatchForm"
        style={{
          padding: "10px 20px",
          backgroundColor: "#00368c",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Convert
      </button>
    </div>
  );

  // View Note Modal Render Functions
  const renderViewHeader = () => (
    <>
      <h1 className="modal-title">View Landing Note Details</h1>
    </>
  );

  const renderViewBody = () => {
    if (!viewingNote) return null;

    return (
      <div className="modal-body">
        <div className="view-vessel-container" style={{ padding: "20px" }}>
          {/* Note Information */}
          <div className="view-row" style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "20px" }}>
            <div className="view-item" style={{ flex: "1", minWidth: "200px" }}>
              <div className="view-label" style={{ fontWeight: "600", color: "#666", marginBottom: "8px", fontSize: "14px" }}>Landing Note No</div>
              <div className="view-value" style={{ color: "#1a1a1a", fontSize: "15px" }}>{viewingNote.landing_note_no || "-"}</div>
            </div>
            <div className="view-item" style={{ flex: "1", minWidth: "200px" }}>
              <div className="view-label" style={{ fontWeight: "600", color: "#666", marginBottom: "8px", fontSize: "14px" }}>Date</div>
              <div className="view-value" style={{ color: "#1a1a1a", fontSize: "15px" }}>{formatDate(viewingNote.landing_date) || "-"}</div>
            </div>
            <div className="view-item" style={{ flex: "1", minWidth: "200px" }}>
              <div className="view-label" style={{ fontWeight: "600", color: "#666", marginBottom: "8px", fontSize: "14px" }}>PO/DO</div>
              <div className="view-value" style={{ color: "#1a1a1a", fontSize: "15px" }}>{viewingNote.items?.[0]?.po_no || "-"}</div>
            </div>
          </div>

          <div className="view-row" style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "20px" }}>
            <div className="view-item" style={{ flex: "1", minWidth: "200px" }}>
              <div className="view-label" style={{ fontWeight: "600", color: "#666", marginBottom: "8px", fontSize: "14px" }}>Quantity</div>
              <div className="view-value" style={{ color: "#1a1a1a", fontSize: "15px" }}>{viewingNote.items?.[0]?.quantity || "-"}</div>
            </div>
            <div className="view-item" style={{ flex: "1", minWidth: "200px" }}>
              <div className="view-label" style={{ fontWeight: "600", color: "#666", marginBottom: "8px", fontSize: "14px" }}>Package Type</div>
              <div className="view-value" style={{ color: "#1a1a1a", fontSize: "15px" }}>{viewingNote.items?.[0]?.package_type || "-"}</div>
            </div>
            <div className="view-item" style={{ flex: "1", minWidth: "200px" }}>
              <div className="view-label" style={{ fontWeight: "600", color: "#666", marginBottom: "8px", fontSize: "14px" }}>Landing Proof</div>
              <div className="view-value" style={{ color: "#1a1a1a", fontSize: "15px" }}>
                {viewingNote.document ? viewingNote.document.file_name || "1 file" : "No files"}
              </div>
            </div>
          </div>

          <div className="view-row" style={{ marginBottom: "20px" }}>
            <div className="view-item" style={{ width: "100%" }}>
              <div className="view-label" style={{ fontWeight: "600", color: "#666", marginBottom: "8px", fontSize: "14px" }}>Description</div>
              <div className="view-value" style={{ color: "#1a1a1a", fontSize: "15px" }}>{viewingNote.items?.[0]?.description || "-"}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderViewFooter = () => (
    <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "12px", padding: "16px 24px" }}>
      <button
        type="button"
        onClick={handleCloseViewModal}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f5f5f5",
          color: "#333",
          border: "1px solid #e2e2ea",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Close
      </button>
      {viewingNote && (
        <button
          type="button"
          onClick={() => handlePrintNote(viewingNote)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#00368c",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Print
        </button>
      )}
    </div>
  );

  return (
    <div className="cardform-left-full material-management-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="material-list-header">
        <h3 className="material-list-title">
          <span className="material-list-title-bar"></span>
          Landing Note
        </h3>
      </div>
      <div className="table-wrapper table-responsive material-table-container" style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 330px)", minHeight: 0 }}>
        <table className="table table-striped material-table sub-note-table" style={{ "--card-color": "#e2e6ff", tableLayout: "fixed" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#fff" }}>
            <tr>
              <th>Order No</th>
              <th>Date</th>
              <th>PO/DO</th>
              <th>Landing Proof</th>
              <th>Quantity</th>
              <th>Package Type</th>
              <th>Description</th>
              <th style={{ paddingLeft: "28px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingList ? (
              <tr><td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>Loading...</td></tr>
            ) : landingNotes.length > 0 ? (
              landingNotes.map((note) => (
                <tr key={note.landing_note_id}>
                  <td>
                    <div className="material-table-cell">{note.landing_note_no || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      {formatDate(note.landing_date)}
                    </div>
                  </td>
                  <td>
                    <div className="material-table-cell">{note.items?.[0]?.po_no || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      {note.document ? (
                        <span style={{ color: "#00368c", cursor: "pointer" }}>
                          {note.document.file_name || "1 file"}
                        </span>
                      ) : (
                        <span style={{ color: "#999" }}>No files</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="material-table-cell">{note.items?.[0]?.quantity || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">{note.items?.[0]?.package_type || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      {(() => {
                        const desc = note.items?.[0]?.description || "";
                        return desc.length > 13 ? (
                          <>
                            <Tooltip
                              id={`description-tooltip-${note.landing_note_id}`}
                              place="right"
                              content={desc}
                              className="material-table-tooltip"
                            />
                            <span
                              data-tooltip-id={`description-tooltip-${note.landing_note_id}`}
                              style={{ cursor: "help" }}
                            >
                              {desc.substring(0, 13)}...
                            </span>
                          </>
                        ) : (
                          <span>{desc}</span>
                        );
                      })()}
                    </div>
                  </td>
                  <td style={{ position: "relative", whiteSpace: "nowrap", overflow: "visible" }}>
                    <div className="material-table-cell" style={{ position: "relative", overflow: "visible", display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-start", flexWrap: "nowrap" }}>
                      <Tooltip id={`view-note-${note.landing_note_id}`} place="left" content="View" />
                      <button
                        type="button"
                        onClick={() => handleViewNote(note)}
                        data-tooltip-id={`view-note-${note.landing_note_id}`}
                        style={{
                          padding: "6px 8px",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#00368c",
                          transition: "background-color 0.2s",
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <img src={eyeIcon} alt="view" style={{ width: "18px", height: "18px" }} />
                      </button>
                      <Tooltip id={`print-note-${note.landing_note_id}`} place="left" content="Print" />
                      <button
                        type="button"
                        onClick={() => handlePrintNote(note)}
                        data-tooltip-id={`print-note-${note.landing_note_id}`}
                        style={{
                          padding: "6px 8px",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#00368c",
                          transition: "background-color 0.2s",
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9V2H18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18 14H6V22H18V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M18 9H6V14H18V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <Tooltip id={`convert-note-${note.landing_note_id}`} place="left" content=" Convert" />
                      <button
                        type="button"
                        onClick={() => handleConvertToDispatch(note)}
                        data-tooltip-id={`convert-note-${note.landing_note_id}`}
                        style={{
                          padding: "6px 8px",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#00368c",
                          transition: "background-color 0.2s",
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f0f0f0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 4H10V12H1V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M10 6H16L19 9V12H10V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="4" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                          <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2" />
                          <path d="M19 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <div className="action-dropdown-wrapper" style={{ position: "relative", display: "inline-block", zIndex: openDropdownId === note.landing_note_id ? 9999 : "auto", flexShrink: 0 }}>
                        <Tooltip id={`more-actions-${note.landing_note_id}`} place="left" content="More actions" />
                        <button
                          type="button"
                          onClick={(e) => handleToggleDropdown(note.landing_note_id, e)}
                          data-tooltip-id={`more-actions-${note.landing_note_id}`}
                          style={{
                            padding: "6px 8px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#00368c"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f0f0";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                            <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                          </svg>
                        </button>
                        {openDropdownId === note.landing_note_id && createPortal(
                          <div
                            data-dropdown-menu
                            style={{
                              position: "fixed",
                              top: `${dropdownPosition.top}px`,
                              right: `${dropdownPosition.right}px`,
                              backgroundColor: "white",
                              border: "1px solid #e2e2ea",
                              borderRadius: "6px",
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              zIndex: 99999,
                              minWidth: "180px",
                              padding: "4px 0"
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                handleCloseDropdown();
                                handleOpenModal(note);
                              }}
                              style={{
                                width: "100%",
                                padding: "10px 16px",
                                backgroundColor: "transparent",
                                border: "none",
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "14px",
                                color: "#1a1a1a",
                                transition: "background-color 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f5f5f5";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <img src={editIcon} alt="edit" style={{ width: "16px", height: "16px" }} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                handleCloseDropdown();
                                handleDelete(note.landing_note_id);
                              }}
                              style={{
                                width: "100%",
                                padding: "10px 16px",
                                backgroundColor: "transparent",
                                border: "none",
                                textAlign: "left",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                fontSize: "14px",
                                color: "#dc3545",
                                transition: "background-color 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f5f5f5";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <img src={deleteIcon} alt="delete" style={{ width: "16px", height: "16px" }} />
                              <span>Delete</span>
                            </button>
                          </div>,
                          document.body
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No landing notes added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        <MaterialTablePagination
          page={landingPage}
          total={landingNoteTotal}
          limit={LANDING_LIMIT}
          onPageChange={setLandingPage}
        />
      </div>

      <CustomModal
        className="material-management-modal"
        show={showModal}
        closeModal={handleCloseModal}
        header={renderHeader()}
        body={renderBody()}
        footer={renderFooter()}
      />

      <CustomModal
        className="material-management-modal"
        show={showConvertModal}
        closeModal={handleCloseConvertModal}
        header={renderConvertHeader()}
        body={renderConvertBody()}
        footer={renderConvertFooter()}
        dialgName="modal-dialog modal-dialog-centered"
      />

      <CustomModal
        className="material-management-modal"
        show={showViewModal}
        closeModal={handleCloseViewModal}
        header={renderViewHeader()}
        body={renderViewBody()}
        footer={renderViewFooter()}
        dialgName="modal-dialog modal-dialog-centered"
      />
    </div>
  );
};

LandingNoteContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default LandingNoteContent;
