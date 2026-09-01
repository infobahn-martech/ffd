import PropTypes from "prop-types";
import { FiMoreHorizontal } from "react-icons/fi";
import { resolveIconComponentStrict } from "../../../../../../../structure/SideNav/components/DynamicIcon";
import PriorityBadge from "./PriorityBadge";

/**
 * Card header row: type icon (left) + category badge, priority badge and the
 * "more" affordance (right). The "more" button's visibility is unchanged
 * from the pre-redesign behavior (gated by isModernLayout, not a permission
 * check) — no real per-card permission exists in the Kanban role config to
 * hook into (see rolePermissions.js, all roles get the same stub flags), so
 * this preserves exactly what was there before rather than inventing one.
 */
function CardHeader({ card, setSelectedCard, isModernLayout }) {
  const TypeIcon = resolveIconComponentStrict(card.cardTypeIcon);
  const hasCategory = typeof card.cardTypeName === "string" && card.cardTypeName.trim().length > 0;

  if (!TypeIcon && !hasCategory && !card.priority && !isModernLayout) return null;

  return (
    <div className="card-header-row">
      <div className="card-header-row-left">
        {TypeIcon && (
          <span
            className="card-type-icon-badge"
            title={card.cardTypeName}
            style={{ backgroundColor: card.cardTypeColor || "var(--ffd-navy)" }}
          >
            <TypeIcon size={12} />
          </span>
        )}
        {hasCategory && <span className="card-category-badge">{card.cardTypeName}</span>}
      </div>
      <div className="card-header-row-right">
        <PriorityBadge priority={card.priority} />
        {isModernLayout && (
          <button
            type="button"
            className="card-action-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCard(card);
            }}
            aria-label="Card actions"
          >
            <FiMoreHorizontal size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

CardHeader.propTypes = {
  card: PropTypes.shape({
    cardTypeIcon: PropTypes.string,
    cardTypeColor: PropTypes.string,
    cardTypeName: PropTypes.string,
    priority: PropTypes.bool,
  }).isRequired,
  setSelectedCard: PropTypes.func.isRequired,
  isModernLayout: PropTypes.bool,
};

export default CardHeader;
