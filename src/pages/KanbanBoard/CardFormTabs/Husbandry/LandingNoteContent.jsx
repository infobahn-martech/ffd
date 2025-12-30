import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import CustomModal from "../../../../components/CustomModal";
import { FormField, FormInput, FormSelect } from "./Husbandry.components";
import editIcon from "../../../../assets/images/edit.svg";
import deleteIcon from "../../../../assets/images/delete.svg";

// Generate dummy landing note data
const generateDummyLandingNotes = () => {
  const packageTypes = ["Box", "Pallet", "Crate", "Bag", "Container"];
  const descriptions = [
    "Spare parts for vessel maintenance",
    "Safety equipment and supplies",
    "Food and beverage items",
    "Technical equipment",
    "Cleaning supplies",
    "Medical supplies",
    "Office supplies",
    "Tools and hardware"
  ];

  const dummyNotes = [];
  for (let i = 1; i <= 10; i++) {
    const noteDate = new Date();
    noteDate.setDate(noteDate.getDate() - Math.floor(Math.random() * 30));

    dummyNotes.push({
      id: i,
      landingNoteNo: `LN-${String(i).padStart(5, '0')}`,
      date: noteDate.toISOString().split('T')[0],
      poDo: `PO-${String(i).padStart(4, '0')}`,
      landingProof: [],
      quantity: Math.floor(Math.random() * 100) + 1,
      packageType: packageTypes[Math.floor(Math.random() * packageTypes.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
    });
  }
  return dummyNotes;
};

const LandingNoteContent = ({ formValues, handleChange, cardColor }) => {
  const [showModal, setShowModal] = useState(false);
  const [notesList, setNotesList] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    landingNoteNo: "",
    date: "",
    poDo: "",
    landingProof: [],
    quantity: "",
    packageType: "",
    description: "",
  });

  // Initialize with dummy data on mount if empty
  useEffect(() => {
    const notes = formValues.landingNoteList || [];
    if (notes.length === 0) {
      const dummyData = generateDummyLandingNotes();
      const syntheticEvent = { target: { value: dummyData } };
      handleChange("landingNoteList")(syntheticEvent);
      setNotesList(dummyData);
    } else {
      setNotesList(notes);
    }
  }, [formValues.landingNoteList, handleChange]);

  // Update local list when formValues change
  useEffect(() => {
    if (formValues.landingNoteList) {
      setNotesList(formValues.landingNoteList);
    }
  }, [formValues.landingNoteList]);

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setFormData({
        landingNoteNo: note.landingNoteNo || "",
        date: note.date || "",
        poDo: note.poDo || "",
        landingProof: note.landingProof || [],
        quantity: note.quantity || "",
        packageType: note.packageType || "",
        description: note.description || "",
      });
      setSelectedFiles(note.landingProof || []);
    } else {
      setEditingNote(null);
      setFormData({
        landingNoteNo: "",
        date: "",
        poDo: "",
        landingProof: [],
        quantity: "",
        packageType: "",
        description: "",
      });
      setSelectedFiles([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setFormData({
      landingNoteNo: "",
      date: "",
      poDo: "",
      landingProof: [],
      quantity: "",
      packageType: "",
      description: "",
    });
    setSelectedFiles([]);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingNote) {
      // Update existing note
      const updatedList = notesList.map(note =>
        note.id === editingNote.id
          ? {
            ...note,
            landingNoteNo: formData.landingNoteNo || note.landingNoteNo,
            date: formData.date,
            poDo: formData.poDo,
            landingProof: selectedFiles,
            quantity: formData.quantity,
            packageType: formData.packageType,
            description: formData.description,
          }
          : note
      );
      setNotesList(updatedList);

      // Update formValues
      const syntheticEvent = { target: { value: updatedList } };
      handleChange("landingNoteList")(syntheticEvent);
    } else {
      // Create new note
      const newNote = {
        id: notesList.length > 0 ? Math.max(...notesList.map(m => m.id)) + 1 : 1,
        landingNoteNo: formData.landingNoteNo || `LN-${String(notesList.length + 1).padStart(5, '0')}`,
        date: formData.date,
        poDo: formData.poDo,
        landingProof: selectedFiles,
        quantity: formData.quantity,
        packageType: formData.packageType,
        description: formData.description,
      };

      const updatedList = [...notesList, newNote];
      setNotesList(updatedList);

      // Update formValues
      const syntheticEvent = { target: { value: updatedList } };
      handleChange("landingNoteList")(syntheticEvent);
    }

    handleCloseModal();
  };

  // File upload handlers
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
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const packageTypeOptions = [
    { value: "Box", label: "Box" },
    { value: "Pallet", label: "Pallet" },
    { value: "Crate", label: "Crate" },
    { value: "Bag", label: "Bag" },
    { value: "Container", label: "Container" },
  ];

  const handleDelete = (noteId) => {
    if (window.confirm("Are you sure you want to delete this landing note?")) {
      const updatedList = notesList.filter(note => note.id !== noteId);
      setNotesList(updatedList);

      // Update formValues
      const syntheticEvent = { target: { value: updatedList } };
      handleChange("landingNoteList")(syntheticEvent);
    }
  };

  const handleConvertToDispatch = (note) => {
    // Convert landing note to dispatch note
    if (window.confirm("Convert this landing note to Dispatch Note?")) {
      // You can implement the conversion logic here
      // For now, just show a confirmation
      console.log("Converting landing note to dispatch:", note);
    }
  };

  const renderHeader = () => (
    <>
      <h1 className="modal-title">{editingNote ? "Edit Landing Note" : "Add Landing Note"}</h1>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="lead-form">
        <form id="landingNoteForm" onSubmit={handleSubmit}>
          <div className="permInputs row mb-lg-3">
            <div className="col-12 mb-3">
              <FormField label="Landing Note No">
                <FormInput
                  type="text"
                  value={formData.landingNoteNo}
                  onChange={(e) => handleFormChange("landingNoteNo", e.target.value)}
                  placeholder="Enter landing note number..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Date">
                <div className="cf-input">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange("date", e.target.value)}
                    placeholder="Select date"
                  />
                </div>
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="PO/DO">
                <FormInput
                  type="text"
                  value={formData.poDo}
                  onChange={(e) => handleFormChange("poDo", e.target.value)}
                  placeholder="Enter PO/DO number..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Landing Proof">
                <div
                  className={`document-upload-zone ${isDragging ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
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

                  {selectedFiles.length === 0 ? (
                    <div className="upload-zone-content">
                      <div className="upload-icon-wrapper">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 48 48"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="4"
                            y="4"
                            width="40"
                            height="40"
                            rx="8"
                            stroke="#00368c"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            fill="none"
                          />
                          <path
                            d="M24 16V32M24 16L18 22M24 16L30 22M12 36H36"
                            stroke="#00368c"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="upload-text-content">
                        <p className="upload-main-text">
                          Drag & drop files here, or <span className="upload-link">browse</span>
                        </p>
                        <p className="upload-sub-text">
                          Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="uploaded-files-list">
                      <div className="files-header">
                        <span className="files-count">{selectedFiles.length} file(s) uploaded</span>
                        <div className="files-header-actions">
                          <button
                            type="button"
                            className="add-more-files-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBrowseClick();
                            }}
                            style={{ "--card-color": cardColor }}
                          >
                            + Add More
                          </button>
                          <button
                            type="button"
                            className="btn-remove-files"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFiles([]);
                            }}
                            style={{ "--card-color": cardColor }}
                          >
                            Remove All
                          </button>
                        </div>
                      </div>
                      <div className="files-list">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="file-item">
                            <div className="file-info">
                              <span className="file-name">{file.name}</span>
                              <span className="file-size">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            <button
                              type="button"
                              className="btn-remove-file"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFile(index);
                              }}
                              style={{ "--card-color": cardColor }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 4L4 12M4 4L12 12"
                                  stroke="#999"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Quantity">
                <FormInput
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange("quantity", e.target.value)}
                  placeholder="Enter quantity..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Package Type">
                <FormSelect
                  value={formData.packageType}
                  onChange={(e) => handleFormChange("packageType", e.target.value)}
                  options={packageTypeOptions}
                  placeholder="Select package type..."
                />
              </FormField>
            </div>

            <div className="col-12 mb-3">
              <FormField label="Description">
                <FormInput
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Enter description..."
                />
              </FormField>
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
      >
        {editingNote ? "Update Note" : "Add Note"}
      </button>
    </div>
  );

  return (
    <div className="cardform-left-full material-management-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="material-list-header">
        <h3 className="material-list-title">
          <span className="material-list-title-bar"></span>
          LANDING NOTE
        </h3>
        <button
          type="button"
          className="material-add-btn"
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: "#00368c" }}
        >
          + Add
        </button>
      </div>
      <div className="table-wrapper table-responsive material-table-container">
        <table className="table table-striped material-table" style={{ "--card-color": "#e2e6ff" }}>
          <thead>
            <tr>
              <th>Landing Note No</th>
              <th>Date</th>
              <th>PO/DO</th>
              <th>Landing Proof</th>
              <th>Quantity</th>
              <th>Package Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notesList.length > 0 ? (
              notesList.map((note) => (
                <tr key={note.id}>
                  <td>
                    <div className="material-table-cell">{note.landingNoteNo || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      {formatDate(note.date)}
                    </div>
                  </td>
                  <td>
                    <div className="material-table-cell">{note.poDo || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      {note.landingProof && note.landingProof.length > 0 ? (
                        <span style={{ color: "#00368c", cursor: "pointer" }}>
                          {note.landingProof.length} file(s)
                        </span>
                      ) : (
                        <span style={{ color: "#999" }}>No files</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="material-table-cell">{note.quantity || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">{note.packageType || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">{note.description || ""}</div>
                  </td>
                  <td>
                    <div className="material-table-cell">
                      <div className="table-actions" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <Tooltip id={`convert-dispatch-${note.id}`} place="top" content="Convert to Dispatch" />
                        <Tooltip id={`edit-landing-${note.id}`} place="top" content="Edit" />
                        <Tooltip id={`delete-landing-${note.id}`} place="top" content="Delete" />
                        <span
                          data-tooltip-id={`convert-dispatch-${note.id}`}
                          data-tooltip-content="Convert to Dispatch"
                          type="button"
                          className="btn-action btn-convert"
                          onClick={() => handleConvertToDispatch(note)}
                          style={{
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4H10V12H1V4Z" stroke="#00368c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 6H16L19 9V12H10V6Z" stroke="#00368c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="4" cy="17" r="2" stroke="#00368c" strokeWidth="2" />
                            <circle cx="17" cy="17" r="2" stroke="#00368c" strokeWidth="2" />
                            <path d="M19 9H16" stroke="#00368c" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </span>
                        <span
                          data-tooltip-id={`edit-landing-${note.id}`}
                          data-tooltip-content="Edit"
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => handleOpenModal(note)}
                          style={{
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img src={editIcon} alt="edit" style={{ width: "18px", height: "18px" }} />
                        </span>
                        <span
                          data-tooltip-id={`delete-landing-${note.id}`}
                          data-tooltip-content="Delete"
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(note.id)}
                          style={{
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <img src={deleteIcon} alt="delete" style={{ width: "18px", height: "18px" }} />
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                  No landing notes added yet. Click "Add" to add a new note.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CustomModal
        className="material-management-modal"
        show={showModal}
        closeModal={handleCloseModal}
        header={renderHeader()}
        body={renderBody()}
        footer={renderFooter()}
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
