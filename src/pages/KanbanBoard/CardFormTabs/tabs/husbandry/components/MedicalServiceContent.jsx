import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, FormSelect, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import hospitalService from "../../../../../../services/hospitalService";

const MedicalServiceContent = ({ formValues, handleChange, cardColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [hospitals, setHospitals] = useState([]);
  const [hospitalServices, setHospitalServices] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

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

  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("medicalServiceSelectedCrew")(syntheticEvent);
  };

  const selectedCrewValues =
    formValues.medicalServiceSelectedCrew
      ?.map((crewId) =>
        crewOptions.find((opt) => opt.value === crewId?.toString() || opt.value === crewId)
      )
      .filter(Boolean) || [];

  const customSelectStyles = getCrewMultiSelectStyles(cardColor, { transportCompact: true });

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
          <div className="transport-request-layout">
            <div className="transport-request-left transport-panel-card">
              <div className="transport-panel-header">
                <h3 className="transport-panel-header__title">Request Details</h3>
              </div>

              <div className="transport-request-left__scroll transport-panel-scroll">
                <FormField label="Select Crew">
                  <div className="cf-select react-select-container crew-multi-select">
                    <Select
                      isMulti
                      value={selectedCrewValues}
                      onChange={handleCrewChange}
                      options={crewOptions}
                      placeholder="Select crew members..."
                      classNamePrefix="react-select"
                      styles={customSelectStyles}
                      formatOptionLabel={formatCrewOptionLabel}
                      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                      menuPosition="fixed"
                      menuShouldBlockScroll={true}
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
                  <div className="transport-upload-box">
                    <AttachmentsList
                      attachments={formValues.medicalServiceDocuments || []}
                      onAdd={() => {}}
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
              </div>

              <div className="transport-save-footer">
                <button type="button" className="form-save-button" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>

            <div className="transport-request-right transport-panel-card">
              <div className="transport-panel-header">
                <h3 className="transport-panel-header__title">Remarks</h3>
              </div>
              <div className="transport-request-right__body transport-panel-scroll">
                <ReactQuillEditor
                  value={formValues?.medicalServiceDescription || ""}
                  onChange={handleChange("medicalServiceDescription")}
                  placeholder="Enter remarks..."
                  name="medicalServiceDescription"
                  className="transport-remarks-quill"
                />
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
