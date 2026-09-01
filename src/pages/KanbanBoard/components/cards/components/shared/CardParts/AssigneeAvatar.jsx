import PropTypes from "prop-types";

/** Footer assignee avatar: username initial in a circle. Renders nothing when there's no resolvable initial. */
function AssigneeAvatar({ initial, username }) {
  if (!initial) return null;

  return (
    <span
      className="card-assignee-avatar"
      title={username || undefined}
      aria-hidden
    >
      {initial}
    </span>
  );
}

AssigneeAvatar.propTypes = {
  initial: PropTypes.string,
  username: PropTypes.string,
};

export default AssigneeAvatar;
