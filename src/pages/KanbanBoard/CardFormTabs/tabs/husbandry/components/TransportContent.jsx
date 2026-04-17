import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, FormSelect, FormTextarea, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import LocationAutocomplete from "./LocationAutocomplete";
import vehicleService from "../../../../../../services/vehicleService";
import transportCompanyService from "../../../../../../services/transportCompanyService";

const unwrapApiList = (axiosData) => {
  const payload = axiosData?.data ?? axiosData;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const TransportContent = ({ formValues, handleChange, cardColor }) => {
  // Radio button state - default to "inhouse" if not set
  const [transportType, setTransportType] = useState(formValues.transportType || "inhouse");

  // Sync state with formValues when it changes
  useEffect(() => {
    if (formValues.transportType) {
      setTransportType(formValues.transportType);
    }
  }, [formValues.transportType]);
  // Generate crew options from crewList
  const crewOptions = formValues.crewList?.map((crew) => ({
    value: crew.id?.toString() || crew.crewName,
    label: crew.crewName || `Crew Member ${crew.id}`,
  })) || [];

  const [transportVehicles, setTransportVehicles] = useState([]);
  const [inhouseDrivers, setInhouseDrivers] = useState([]);
  const [transportCompanies, setTransportCompanies] = useState([]);
  const [thirdPartyDrivers, setThirdPartyDrivers] = useState([]);

  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingInhouseDrivers, setLoadingInhouseDrivers] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingThirdPartyDrivers, setLoadingThirdPartyDrivers] = useState(false);

  // Invoice Branch options
  const invoiceBranchOptions = [
    { value: "Branch 1", label: "Branch 1" },
    { value: "Branch 2", label: "Branch 2" },
    { value: "Branch 3", label: "Branch 3" },
    { value: "Main Office", label: "Main Office" },
  ];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingVehicles(true);
        const { data } = await vehicleService.getAllTransportVehicles();
        const list = unwrapApiList(data);
        if (!cancelled) setTransportVehicles(list);
      } catch {
        if (!cancelled) setTransportVehicles([]);
      } finally {
        if (!cancelled) setLoadingVehicles(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingCompanies(true);
        const { data } = await transportCompanyService.getTransportCompanyData({
          params: { page: 1, limit: 500, search: "" },
        });
        const list = data?.data ?? [];
        if (!cancelled) setTransportCompanies(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setTransportCompanies([]);
      } finally {
        if (!cancelled) setLoadingCompanies(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const vehicleTypeId = formValues.transportVehicleTypeId;
    if (!vehicleTypeId || transportType !== "inhouse") {
      setInhouseDrivers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingInhouseDrivers(true);
        const { data } = await vehicleService.getDriversByVehicleType(vehicleTypeId);
        const list = unwrapApiList(data);
        if (!cancelled) setInhouseDrivers(list);
      } catch {
        if (!cancelled) setInhouseDrivers([]);
      } finally {
        if (!cancelled) setLoadingInhouseDrivers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formValues.transportVehicleTypeId, transportType]);

  useEffect(() => {
    const companyId = formValues.transportCompanyId;
    if (!companyId || transportType !== "thirdparty") {
      setThirdPartyDrivers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingThirdPartyDrivers(true);
        const { data } = await transportCompanyService.getTransportCompanyById(companyId);
        const row = data?.data ?? data;
        const company = Array.isArray(row) ? row[0] : row;
        const drivers = company?.drivers;
        if (!cancelled) setThirdPartyDrivers(Array.isArray(drivers) ? drivers : []);
      } catch {
        if (!cancelled) setThirdPartyDrivers([]);
      } finally {
        if (!cancelled) setLoadingThirdPartyDrivers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formValues.transportCompanyId, transportType]);

  const vehicleOptions = transportVehicles.map((v) => ({
    value: String(v.vehicle_type_id ?? ""),
    label: [v.vehicle_type, v.seater != null ? `${v.seater} seater` : null]
      .filter(Boolean)
      .join(" · ") || `Vehicle ${v.vehicle_type_id}`,
  }));

  const inhouseDriverOptions = inhouseDrivers.map((d) => ({
    value: String(d.driver_id ?? ""),
    label: d.driver_name ?? "",
  }));

  const companyOptions = transportCompanies.map((c) => ({
    value: String(c.transport_company_id ?? c._id ?? ""),
    label: c.transport_company ?? "",
  }));

  const thirdPartyDriverOptions = thirdPartyDrivers.map((d) => ({
    value: String(d.transport_driver_id ?? ""),
    label: [
      d.driver_name,
      d.vehicle_type,
      d.seater != null ? `${d.seater} seater` : null,
      d.contact_no,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const clearTransportSelections = useCallback(() => {
    handleChange("transportVehicleTypeId")({ target: { value: "" } });
    handleChange("transportDriverId")({ target: { value: "" } });
    handleChange("transportCompanyId")({ target: { value: "" } });
    handleChange("transportThirdPartyDriverId")({ target: { value: "" } });
    handleChange("driverName")({ target: { value: "" } });
  }, [handleChange]);

  // Handle transport type radio button change
  const handleTransportTypeChange = (e) => {
    const value = e.target.value;
    setTransportType(value);
    const syntheticEvent = { target: { value: value } };
    handleChange("transportType")(syntheticEvent);
    clearTransportSelections();
  };

  const handleVehicleChange = (e) => {
    handleChange("transportVehicleTypeId")(e);
    handleChange("transportDriverId")({ target: { value: "" } });
    handleChange("driverName")({ target: { value: "" } });
  };

  const handleInhouseDriverChange = (e) => {
    handleChange("transportDriverId")(e);
    const id = e.target.value;
    const row = inhouseDrivers.find((d) => String(d.driver_id) === id);
    handleChange("driverName")({ target: { value: row?.driver_name ?? "" } });
  };

  const handleCompanyChange = (e) => {
    handleChange("transportCompanyId")(e);
    handleChange("transportThirdPartyDriverId")({ target: { value: "" } });
    handleChange("driverName")({ target: { value: "" } });
  };

  const handleThirdPartyDriverChange = (e) => {
    handleChange("transportThirdPartyDriverId")(e);
    const id = e.target.value;
    const row = thirdPartyDrivers.find((d) => String(d.transport_driver_id) === id);
    handleChange("driverName")({ target: { value: row?.driver_name ?? "" } });
  };

  // Handle multi-select crew change
  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("selectedCrew")(syntheticEvent);
  };

  // Get selected crew values for react-select
  const selectedCrewValues = formValues.selectedCrew?.map((crewId) =>
    crewOptions.find((opt) => opt.value === crewId?.toString() || opt.value === crewId)
  ).filter(Boolean) || [];

  const customSelectStyles = getCrewMultiSelectStyles(cardColor);

  // Handle save
  const handleSave = () => {
    console.log("Saving transport data:", {
      transportType: formValues.transportType,
      selectedCrew: formValues.selectedCrew,
      transportVehicleTypeId: formValues.transportVehicleTypeId,
      transportDriverId: formValues.transportDriverId,
      transportCompanyId: formValues.transportCompanyId,
      transportThirdPartyDriverId: formValues.transportThirdPartyDriverId,
      driverName: formValues.driverName,
      dateTime: formValues.transportDateTime,
      time: formValues.transportTime,
      from: formValues.transportFrom,
      fromNotes: formValues.transportFromNotes,
      to: formValues.transportTo,
      toNotes: formValues.transportToNotes,
      invoiceBranch: formValues.invoiceBranch,
      transportDescription: formValues.transportDescription,
    });
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form transport-form">
          <div className="general-info-two-column operation-section-form-layout">
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
                    formatOptionLabel={formatCrewOptionLabel}
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                </div>
              </FormField>

              <FormField label="">
                <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="transportType"
                      value="inhouse"
                      checked={transportType === "inhouse"}
                      onChange={handleTransportTypeChange}
                      style={{ cursor: "pointer" }}
                    />
                    <span>In house</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="transportType"
                      value="thirdparty"
                      checked={transportType === "thirdparty"}
                      onChange={handleTransportTypeChange}
                      style={{ cursor: "pointer" }}
                    />
                    <span>Third party</span>
                  </label>
                </div>
              </FormField>

              {transportType === "inhouse" && (
                <>
                  <FormField label="Vehicle">
                    <FormSelect
                      value={formValues.transportVehicleTypeId || ""}
                      onChange={handleVehicleChange}
                      options={vehicleOptions}
                      placeholder={
                        loadingVehicles ? "Loading vehicles..." : "Select vehicle..."
                      }
                      disabled={loadingVehicles}
                    />
                  </FormField>

                  <FormField label="Driver Name">
                    <FormSelect
                      value={formValues.transportDriverId || ""}
                      onChange={handleInhouseDriverChange}
                      options={inhouseDriverOptions}
                      placeholder={
                        !formValues.transportVehicleTypeId
                          ? "Select a vehicle first..."
                          : loadingInhouseDrivers
                            ? "Loading drivers..."
                            : "Select driver name..."
                      }
                      disabled={!formValues.transportVehicleTypeId || loadingInhouseDrivers}
                    />
                  </FormField>
                </>
              )}

              {transportType === "thirdparty" && (
                <>
                  <FormField label="Transport Company">
                    <FormSelect
                      value={formValues.transportCompanyId || ""}
                      onChange={handleCompanyChange}
                      options={companyOptions}
                      placeholder={
                        loadingCompanies ? "Loading companies..." : "Select transport company..."
                      }
                      disabled={loadingCompanies}
                    />
                  </FormField>

                  <FormField label="Driver Name">
                    <FormSelect
                      value={formValues.transportThirdPartyDriverId || ""}
                      onChange={handleThirdPartyDriverChange}
                      options={thirdPartyDriverOptions}
                      placeholder={
                        !formValues.transportCompanyId
                          ? "Select a company first..."
                          : loadingThirdPartyDrivers
                            ? "Loading drivers..."
                            : "Select driver..."
                      }
                      disabled={!formValues.transportCompanyId || loadingThirdPartyDrivers}
                    />
                  </FormField>

                  {/* {formValues.transportCompanyId &&
                    !loadingThirdPartyDrivers &&
                    thirdPartyDrivers.length > 0 && (
                      <FormField label="">
                        <div
                          className="third-party-drivers-detail"
                          style={{
                            marginTop: "4px",
                            padding: "12px",
                            background: "#f7f8fb",
                            borderRadius: "8px",
                            border: "1px solid #e2e2ea",
                            fontSize: "13px",
                          }}
                        >
                          <div style={{ fontWeight: 600, marginBottom: "8px", color: "#1a1a1a" }}>
                            Drivers and vehicles
                          </div>
                          <ul style={{ margin: 0, paddingLeft: "18px", color: "#333" }}>
                            {thirdPartyDrivers.map((d) => (
                              <li key={d.transport_driver_id ?? d.driver_name} style={{ marginBottom: "6px" }}>
                                <strong>{d.driver_name || "—"}</strong>
                                {d.contact_no ? ` · ${d.contact_no}` : ""}
                                {d.vehicle_type || d.seater != null
                                  ? ` · ${[d.vehicle_type, d.seater != null ? `${d.seater} seater` : null]
                                      .filter(Boolean)
                                      .join(" · ")}`
                                  : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </FormField>
                    )} */}
                </>
              )}

              <FormField label="Pickup Date Time">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.transportDateTime || ""}
                    onChange={handleChange("transportDateTime")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.transportTime || ""}
                    onChange={handleChange("transportTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>
              <FormField label="From">
                <LocationAutocomplete
                  value={formValues.transportFrom || ""}
                  onChange={handleChange("transportFrom")}
                  placeholder="Search for a location..."
                  onLocationSelect={(locationData) => {
                    // Optional: Store additional location data if needed
                    console.log("From location selected:", locationData);
                  }}
                />
                <FormTextarea
                  value={formValues.transportFromNotes || ""}
                  onChange={handleChange("transportFromNotes")}
                  placeholder="Additional notes (optional)..."
                  rows={2}
                  className="location-notes-textarea"
                />
              </FormField>

              <FormField label="To">
                <LocationAutocomplete
                  value={formValues.transportTo || ""}
                  onChange={handleChange("transportTo")}
                  placeholder="Search for a location..."
                  onLocationSelect={(locationData) => {
                    // Optional: Store additional location data if needed
                    console.log("To location selected:", locationData);
                  }}
                />
                <FormTextarea
                  value={formValues.transportToNotes || ""}
                  onChange={handleChange("transportToNotes")}
                  placeholder="Additional notes (optional)..."
                  rows={2}
                  className="location-notes-textarea"
                />
              </FormField>

              {transportType === "inhouse" && (
                <>
                  <FormField label="Invoice Branch">
                    <FormSelect
                      value={formValues.invoiceBranch || ""}
                      onChange={handleChange("invoiceBranch")}
                      options={invoiceBranchOptions}
                      placeholder="Select invoice branch..."
                    />
                  </FormField>
                </>
              )}

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
                    value={formValues?.transportDescription || ""}
                    onChange={handleChange("transportDescription")}
                    placeholder="Enter remarks..."
                    name="transportDescription"
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

TransportContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default TransportContent;

