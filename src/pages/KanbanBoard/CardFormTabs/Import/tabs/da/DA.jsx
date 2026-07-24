import PropTypes from "prop-types";

function DA({ card }) {
  return (
    <div className="cardform-body" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          gap: "8px",
          color: "#6b7280",
          textAlign: "center",
        }}
      >
        <h3 style={{ margin: 0, color: "#33364a" }}>DA</h3>
        <p style={{ margin: 0 }}>
          {card?.title ? `No DA details added yet for ${card.title}.` : "No DA details added yet."}
        </p>
      </div>
    </div>
  );
}

DA.propTypes = {
  card: PropTypes.object,
};

export default DA;
