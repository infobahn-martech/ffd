import { forwardRef } from "react";
import PropTypes from "prop-types";
import GROCardView from "../../GRO/User/GROCardView";

/** Custom clearance user desk — GRO document flow with custom mode. */
const CustomCardView = forwardRef(function CustomCardView(props, ref) {
  return <GROCardView {...props} ref={ref} mode="custom" />;
});

CustomCardView.propTypes = {
  card: PropTypes.object,
  userRoleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedTask: PropTypes.shape({
    task_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    taskId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    task_name: PropTypes.string,
    taskName: PropTypes.string,
  }),
};

CustomCardView.displayName = "CustomCardView";

export default CustomCardView;
