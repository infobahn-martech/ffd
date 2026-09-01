import PropTypes from "prop-types";
import { hasText, isValidProgress } from "../../../../../utils/cardDisplayHelpers";
import AssigneeAvatar from "./AssigneeAvatar";
import ProgressIndicator from "./ProgressIndicator";

/**
 * Card footer: due status (left), assignee avatar, progress indicator (right).
 * `timeLeft` is a backend-formatted string (e.g. "5d left", "Overdue by 2 days") —
 * this only adds a coral tint when it reads as overdue, it doesn't compute
 * or alter the due-date logic itself.
 */
function CardFooter({ timeLeft, assigneeInitial, assigneeName, progress }) {
  const hasTimeline = hasText(timeLeft);
  const hasProgress = isValidProgress(progress);

  if (!hasTimeline && !assigneeInitial && !hasProgress) return null;

  const isOverdue = hasTimeline && /overdue/i.test(timeLeft);

  return (
    <div className="card-footer-row">
      <div className="card-footer-left">
        {hasTimeline && (
          <span className={`card-due-status ${isOverdue ? "card-due-status--overdue" : ""}`}>
            {timeLeft}
          </span>
        )}
      </div>
      <div className="card-footer-right">
        <AssigneeAvatar initial={assigneeInitial} username={assigneeName} />
        {hasProgress && <ProgressIndicator progress={progress} />}
      </div>
    </div>
  );
}

CardFooter.propTypes = {
  timeLeft: PropTypes.string,
  assigneeInitial: PropTypes.string,
  assigneeName: PropTypes.string,
  progress: PropTypes.number,
};

export default CardFooter;
