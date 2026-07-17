import { useEffect } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";
import { FormSection } from "./Husbandry.components";
import HusbandryServiceRequestsTable from "./HusbandryServiceRequestsTable";
import useLaunchHireServiceReducer from "../../../../../../../store/LaunchHireServiceReducer";
import { SERVICE_ACCENT } from "./Husbandry.constants";

const LAUNCH_HIRE_ACCENT = SERVICE_ACCENT.LAUNCH_HIRE;

const LAUNCH_HIRE_REQUEST_COLUMNS = [
  { key: "location", header: "Location", accessor: (r) => r?.location },
  { key: "type_of_service", header: "Type of Service", accessor: (r) => r?.type_of_service ?? r?.service_type },
  { key: "status", header: "Status", accessor: (r) => r?.status, type: "status" },
  { key: "requested_date", header: "Requested", accessor: (r) => r?.created_date, type: "date" },
  { key: "document", header: "Document", accessor: (r) => r?.document_url, type: "document" },
];

const LaunchHireContent = ({ formValues, cardColor }) => {
  const callId = formValues.call_id || formValues.callId || formValues.card_call_id;
  const { launchHireRequests, isLoadingRequests, getLaunchHireRequests } = useLaunchHireServiceReducer();

  useEffect(() => {
    void getLaunchHireRequests(callId);
  }, [callId, getLaunchHireRequests]);

  const launchHireRequestRows = launchHireRequests.map((row) => ({
    ...row,
    document_url: row?.request_email_url || row?.documents?.[0]?.file_url || "",
  }));

  return (
    <div className="cardform-left-full launchhire-booking" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form launchhire-form">
          <HusbandryServiceRequestsTable
            title="Launch Hire Requests"
            requests={launchHireRequestRows}
            loading={isLoadingRequests}
            columns={LAUNCH_HIRE_REQUEST_COLUMNS}
            serviceType="LAUNCH_HIRE"
            emptyMessage="No launch hire requests found"
            accent={LAUNCH_HIRE_ACCENT}
          />
        </div>
      </FormSection>
    </div>
  );
};

LaunchHireContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  cardColor: PropTypes.string,
};

export default LaunchHireContent;
