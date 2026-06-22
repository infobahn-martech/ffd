import PropTypes from "prop-types";
import NavTabButton from "../../../../../../../components/NavTabButton";
import { OPERATION_TABS } from "../operationConstants";

const OperationTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: OPERATION_TABS.PRE_ARRIVAL, label: "Pre Arrival" },
    { id: OPERATION_TABS.ARRIVAL, label: "Arrival" },
    { id: OPERATION_TABS.DEPARTURE, label: "Departure" },
    { id: OPERATION_TABS.CHECK_LIST, label: "Check List" },
  ];

  return (
    <div className="operation-left">
      {tabs.map((tab) => (
        <NavTabButton
          key={tab.id}
          className="op-tab"
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </NavTabButton>
      ))}
    </div>
  );
};

OperationTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default OperationTabs;
