import PropTypes from "prop-types";

const MISSING = "Not set";

const formatPillValue = (value) => {
  if (value == null) return MISSING;
  const s = String(value).trim();
  return s === "" ? MISSING : s;
};

const Pill = ({ label, value, isMissing }) => (
  <span className={`cl-context-pill ${isMissing ? "cl-context-pill--missing" : ""}`}>
    <span className="cl-context-pill__k">{label}</span>
    <span className="cl-context-pill__v">{value}</span>
  </span>
);

Pill.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  isMissing: PropTypes.bool,
};

const ChecklistContextBar = ({ callType, port, vesselType, bargeType }) => {
  const ct = formatPillValue(callType);
  const pt = formatPillValue(port);
  const vt = formatPillValue(vesselType);
  const bt = formatPillValue(bargeType);

  const items = [
    { key: "ct", label: "Call Type", value: ct, isMissing: ct === MISSING },
    { key: "port", label: "Port", value: pt, isMissing: pt === MISSING },
    { key: "v", label: "Vessel Type", value: vt, isMissing: vt === MISSING },
    { key: "b", label: "Barge Type", value: bt, isMissing: bt === MISSING },
  ];

  return (
    <div className="cl-context-bar" role="status">
      {items.map((p) => (
        <Pill key={p.key} label={p.label} value={p.value} isMissing={p.isMissing} />
      ))}
    </div>
  );
};

ChecklistContextBar.propTypes = {
  callType: PropTypes.string,
  port: PropTypes.string,
  vesselType: PropTypes.string,
  bargeType: PropTypes.string,
};

export default ChecklistContextBar;
