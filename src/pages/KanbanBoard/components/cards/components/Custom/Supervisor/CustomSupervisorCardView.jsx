import PropTypes from "prop-types";
import GROSupervisorCardView from "../../GRO/Supervisor/GROSupervisorCardView";

/** Custom clearance supervisor desk — shared supervisor document library. */
function CustomSupervisorCardView({ card, selectedTask = null }) {
  return <GROSupervisorCardView card={card} selectedTask={selectedTask} />;
}

CustomSupervisorCardView.propTypes = {
  card: PropTypes.object,
  selectedTask: PropTypes.shape({
    task_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    task_name: PropTypes.string,
    taskName: PropTypes.string,
  }),
};

export default CustomSupervisorCardView;
