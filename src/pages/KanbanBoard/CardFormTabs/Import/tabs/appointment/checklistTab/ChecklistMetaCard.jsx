import PropTypes from "prop-types";

const Row = ({ k, v }) => (
  <div className="cl-meta-row">
    <span className="cl-meta-k">{k}</span>
    <span className="cl-meta-v">{v || "—"}</span>
  </div>
);

Row.propTypes = { k: PropTypes.string.isRequired, v: PropTypes.string };

const formatDate = (raw) => {
  if (raw == null || raw === "") return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const ChecklistMetaCard = ({ title, callType, port, vesselType, bargeType, createdAt, cardColor }) => (
  <div className="cl-meta-card" style={{ "--card-color": cardColor }}>
    <div className="cl-meta-card__head">
      <h4 className="cl-meta-card__title">{title || "Checklist"}</h4>
    </div>
    <div className="cl-meta-card__body">
      <Row k="Call Type" v={callType} />
      <Row k="Port" v={port} />
      {vesselType ? <Row k="Vessel Type" v={vesselType} /> : null}
      {bargeType ? <Row k="Barge Type" v={bargeType} /> : null}
      {createdAt ? <Row k="Created" v={formatDate(createdAt)} /> : null}
    </div>
  </div>
);

ChecklistMetaCard.propTypes = {
  title: PropTypes.string,
  callType: PropTypes.string,
  port: PropTypes.string,
  vesselType: PropTypes.string,
  bargeType: PropTypes.string,
  createdAt: PropTypes.string,
  cardColor: PropTypes.string,
};

export default ChecklistMetaCard;
