import { Draggable } from "@hello-pangea/dnd";
import { KANBAN_DND_DISABLED } from "../../../../../../shared/constants/kanbanConfig";
import PropTypes from "prop-types";
import "../../../../../../design/scss/pages/kanban-board/taxi-boat-small-card.scss";
import saudimarcapLogo from "../../../../../../assets/images/saudimarcap.png";
import saipemLogo      from "../../../../../../assets/images/saipem.png";
import lamprellLogo    from "../../../../../../assets/images/lamprell.png";
import gulfmarineLogo  from "../../../../../../assets/images/gulfmarine.png";

const COMPANY_LOGO_MAP = {
  "gulf marine":  gulfmarineLogo,
  "gulfmarine":   gulfmarineLogo,
  "saudi marcap": saudimarcapLogo,
  "saudimarcap":  saudimarcapLogo,
  "snamprogetti": saipemLogo,
  "saipem":       saipemLogo,
  "lamprell":     lamprellLogo,
};

function getCompanyLogo(name, entityLogo) {
  if (entityLogo) return entityLogo;
  if (!name) return null;
  return COMPANY_LOGO_MAP[name.toLowerCase().trim()] ?? null;
}

function avatarColor(name = "") {
  const palette = ["#16a34a", "#0284c7", "#7c3aed", "#b45309", "#0f766e", "#2666be", "#dc2626"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export default function DASmallCard({ card, index, setSelectedCard }) {
  const serviceType = card?.typeOfService ?? "";
  const vesselName  = card?.vesselName || card?.title || "—";
  const custName    = card?.name || "";
  const timeLeft    = card?.timeLeft || "";
  const progress    = card?.progress ?? 0;
  const custInitial = custName.charAt(0).toUpperCase();
  const svcInitial  = serviceType.charAt(0).toUpperCase();
  const avatarBg    = avatarColor(custName);
  const logoSrc     = getCompanyLogo(custName, card?.entityLogo);

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={KANBAN_DND_DISABLED}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="da-sc"
          style={provided.draggableProps.style}
          onClick={() => setSelectedCard(card)}
        >
          {/* Top: accent line + logo merged in the same row */}
          <div className="da-sc-top">
            <div className="da-sc-accent-line" />
            {logoSrc ? (
              <img src={logoSrc} alt={custName} className="da-sc-avatar-img" />
            ) : (
              <div className="da-sc-avatar" style={{ background: avatarBg }}>
                {custInitial}
              </div>
            )}
          </div>

          {/* Text content */}
          <div className="da-sc-content">
            <div className="da-sc-title-row">
              <span className="da-sc-vessel">{vesselName}</span>
              {svcInitial && (
                <span className="da-sc-svc-badge">{svcInitial}</span>
              )}
            </div>
            {custName    && <div className="da-sc-customer">{custName}</div>}
            {serviceType && <div className="da-sc-service">{serviceType}</div>}
          </div>

          {/* Footer: time left | circular progress */}
          <div className="da-sc-footer">
            {timeLeft && <span className="da-sc-time">{timeLeft}</span>}
            <div className="da-sc-progress-wrap">
              <svg className="da-sc-svg" viewBox="0 0 26 26">
                <circle className="da-sc-svg-bg" cx="13" cy="13" r="11" />
                <circle
                  className="da-sc-svg-fill"
                  cx="13" cy="13" r="11"
                  style={{ strokeDashoffset: `calc(72 - (72 * ${progress}) / 100)` }}
                />
              </svg>
              <span className="da-sc-progress-text">{progress}%</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

DASmallCard.propTypes = {
  card: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  setSelectedCard: PropTypes.func.isRequired,
};