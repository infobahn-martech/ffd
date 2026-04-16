import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, FormSelect, ReactQuillEditor } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import hospitalService from "../../../../../../services/hospitalService";

const MedicalServiceContent = ({ formValues, handleChange, cardColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [hospitals, setHospitals] = useState([]);
  const [hospitalServices, setHospitalServices] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // Generate crew options from crewList
  const crewOptions = formValues.crewList?.map((crew) => ({
    value: crew.id?.toString() || crew.crewName,
    label: crew.crewName || `Crew Member ${crew.id}`,
  })) || [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingHospitals(true);
        const { data } = await hospitalService.getHospitalData({
          params: { page: 1, limit: 500, search: "" },
        });
        const list = data?.data ?? [];
        if (!cancelled) setHospitals(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setHospitals([]);
      } finally {
        if (!cancelled) setLoadingHospitals(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const hospitalId = formValues.medicalServiceSelectedHospital;
    if (!hospitalId) {
      setHospitalServices([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingServices(true);
        const { data } = await hospitalService.getServiceByHospital(hospitalId);
        const payload = data?.data ?? data;
        const list = payload?.services ?? [];
        if (!cancelled) setHospitalServices(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setHospitalServices([]);
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formValues.medicalServiceSelectedHospital]);

  const hospitalOptions = hospitals.map((h) => ({
    value: String(h.hospital_id ?? h._id ?? ""),
    label: h.hospital_name ?? "",
  }));

  const medicalServiceOptions = hospitalServices.map((s) => ({
    value: String(s.service_id ?? s._id ?? ""),
    label: s.service_name ?? "",
  }));

  const handleHospitalChange = (e) => {
    handleChange("medicalServiceSelectedHospital")(e);
    handleChange("medicalServiceSelectedService")({ target: { value: "" } });
  };

  // Handle multi-select crew change
  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("medicalServiceSelectedCrew")(syntheticEvent);
  };

  // Get selected crew values for react-select
  const selectedCrewValues = formValues.medicalServiceSelectedCrew?.map((crewId) =>
    crewOptions.find((opt) => opt.value === crewId?.toString() || opt.value === crewId)
  ).filter(Boolean) || [];

  // Custom styles for react-select multi-select (Select Crew)
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      border: 'none',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '2px 4px',
      '&:hover': {
        border: 'none',
        boxShadow: 'none',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px',
      minHeight: '38px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    }),
    multiValue: (base, state) => ({
      ...base,
      backgroundColor: "#00368c",
      borderRadius: '6px',
      padding: '2px 4px',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      minHeight: '28px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '500',
      padding: '4px 6px',
      paddingRight: '4px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#ffffff',
      borderRadius: '4px',
      padding: '2px 4px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: '#1a1a1a',
      fontSize: '13px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999',
      fontSize: '13px',
      marginLeft: '4px',
    }),
    input: (base) => ({
      ...base,
      color: '#1a1a1a',
      fontSize: '13px',
      margin: '0',
      padding: '0',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      paddingRight: '8px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#666',
      padding: '4px',
      '&:hover': {
        color: "#00368c",
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#999',
      padding: '4px',
      '&:hover': {
        color: '#ff0000',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e2e2ea',
      marginTop: '4px',
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '200px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#00368c"
        : state.isFocused
          ? 'rgba(0, 54, 140, 0.1)'
          : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#1a1a1a',
      fontSize: '13px',
      padding: '10px 12px',
      borderRadius: '6px',
      margin: '2px 0',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: "#00368c",
        color: '#ffffff',
      },
    }),
  };

  const fileToAttachment = (file) => ({
    name: file.name,
    file,
    size: file.size,
    type: file.type,
  });

  const handleDocumentsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const current = formValues.medicalServiceDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("medicalServiceDocuments")({ target: { value: [...current, ...added] } });
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const current = formValues.medicalServiceDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("medicalServiceDocuments")({ target: { value: [...current, ...added] } });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const current = formValues.medicalServiceDocuments || [];
    handleChange("medicalServiceDocuments")({ target: { value: current.filter((_, i) => i !== index) } });
  };

  // Handle save
  const handleSave = () => {
    console.log("Saving Medical Service data:", {
      medicalServiceSelectedCrew: formValues.medicalServiceSelectedCrew,
      medicalServiceSelectedHospital: formValues.medicalServiceSelectedHospital,
      medicalServiceSelectedService: formValues.medicalServiceSelectedService,
      medicalServiceDocuments: formValues.medicalServiceDocuments,
    });
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form medicalservice-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <FormField label="Select Crew">
                <div className="cf-select react-select-container crew-multi-select">
                  <Select
                    isMulti
                    value={selectedCrewValues}
                    onChange={handleCrewChange}
                    options={crewOptions}
                    placeholder={selectedCrewValues.length > 0 ? `${selectedCrewValues.length} crew selected` : "Select crew members..."}
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                </div>
              </FormField>

              <FormField label="Hospital">
                <FormSelect
                  value={formValues.medicalServiceSelectedHospital || ""}
                  onChange={handleHospitalChange}
                  options={hospitalOptions}
                  placeholder={loadingHospitals ? "Loading hospitals..." : "Select hospital..."}
                  disabled={loadingHospitals}
                />
              </FormField>

              <FormField label="Medical Service">
                <FormSelect
                  value={formValues.medicalServiceSelectedService || ""}
                  onChange={handleChange("medicalServiceSelectedService")}
                  options={medicalServiceOptions}
                  placeholder={
                    !formValues.medicalServiceSelectedHospital
                      ? "Select a hospital first..."
                      : loadingServices
                        ? "Loading services..."
                        : "Select medical service..."
                  }
                  disabled={!formValues.medicalServiceSelectedHospital || loadingServices}
                />
              </FormField>

              <FormField label="Documents" className="cf-field-full">
                <div style={{ marginTop: "8px" }}>
                  <AttachmentsList
                    attachments={formValues.medicalServiceDocuments || []}
                    onAdd={() => { }}
                    onRemove={handleDocumentsRemoveAttachment}
                    cardColor={cardColor}
                    isDragging={isDragging}
                    onDragEnter={handleDocumentsDragEnter}
                    onDragLeave={handleDocumentsDragLeave}
                    onDragOver={handleDocumentsDragOver}
                    onDrop={handleDocumentsDrop}
                    fileInputRef={fileInputRef}
                    onFileInputChange={handleDocumentsFileInputChange}
                  />
                </div>
              </FormField>

              <div className="form-save-button-wrapper">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="general-info-right">
              <div className="card-description-wrapper">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formValues?.medicalServiceDescription || ""}
                    onChange={handleChange("medicalServiceDescription")}
                    placeholder="Enter remarks..."
                    name="medicalServiceDescription"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

MedicalServiceContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default MedicalServiceContent;

