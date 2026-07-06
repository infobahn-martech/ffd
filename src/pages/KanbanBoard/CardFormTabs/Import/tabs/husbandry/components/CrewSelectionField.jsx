import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  getCrewListForPass,
  mapAxiosResponseToCrewOptions,
} from "../../../../../../../services/cgAndZwailpassService";
import { FormGroup, FormField } from "./Husbandry.components";

/** Checkbox list of crew for a call, auto-populated from the crew roster. Reports checked crew_change_ids via onChange. */
const CrewSelectionField = ({ callId, selected, onChange, accent }) => {
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

  const toggleCrew = (id) => {
    const idStr = String(id);
    const next = selectedIds.includes(idStr)
      ? selectedIds.filter((v) => v !== idStr)
      : [...selectedIds, idStr];
    onChange(next);
  };

  return (
    <FormGroup icon="crew" label="Crew Selection" accent={accent}>
      <FormField label="Select Crew" className="cf-field-full">
        <div className="husb-crew-select-list">
          {loading ? (
            <div className="husb-crew-select-empty">Loading crew...</div>
          ) : crewOptions.length === 0 ? (
            <div className="husb-crew-select-empty">No crew found for this call.</div>
          ) : (
            crewOptions.map((crew) => (
              <label key={crew.value} className="husb-crew-select-row">
                <input
                  type="checkbox"
                  className="crew-list-checkbox"
                  checked={selectedIds.includes(crew.value)}
                  onChange={() => toggleCrew(crew.value)}
                />
                <span className="husb-crew-select-name">{crew.label}</span>
                {crew.rank && <span className="husb-crew-select-meta">{crew.rank}</span>}
              </label>
            ))
          )}
        </div>
      </FormField>
    </FormGroup>
  );
};

CrewSelectionField.propTypes = {
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  accent: PropTypes.oneOf(["blue", "teal", "purple", "amber", "rose", "slate"]),
};

export default CrewSelectionField;
