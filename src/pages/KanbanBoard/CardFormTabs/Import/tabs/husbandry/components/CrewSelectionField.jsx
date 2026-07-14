import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  getCrewListForPass,
  mapAxiosResponseToCrewOptions,
} from "../../../../../../../services/cgAndZwailpassService";
import { FormGroup, FormField } from "./Husbandry.components";
import ChecklistMultiSelect from "../../appointment/checklistTab/ChecklistMultiSelect";
import "../../../../../../../design/scss/checklist.scss";

/** Multi-select of crew for a call, auto-populated from the crew roster. Reports selected crew_change_ids via onChange. */
const CrewSelectionField = ({ callId, selected, onChange, accent = "purple" }) => {
  const [crewOptions, setCrewOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!callId) {
      setCrewOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await getCrewListForPass(callId);
        const options = mapAxiosResponseToCrewOptions(response);
        if (!cancelled) setCrewOptions(options);
      } catch {
        if (!cancelled) setCrewOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [callId]);

  const selectedIds = Array.isArray(selected) ? selected.map(String) : [];

  return (
    <FormGroup icon="crew" label="Crew Selection" accent={accent}>
      <FormField className="cf-field-full">
        <ChecklistMultiSelect
          className="husb-crew-multiselect"
          value={selectedIds}
          onChange={(e) => onChange(e.target.value)}
          options={crewOptions}
          placeholder={
            loading
              ? "Loading crew..."
              : crewOptions.length === 0
                ? "No crew found for this call"
                : "Select crew..."
          }
          disabled={loading || crewOptions.length === 0}
        />
      </FormField>
    </FormGroup>
  );
};

CrewSelectionField.propTypes = {
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  accent: PropTypes.oneOf(["blue", "teal", "purple", "amber", "rose", "slate", "green", "pink"]),
};

export default CrewSelectionField;
