/**
 * @param {object} ctx — output of buildChecklistDataContext
 */
export const getPrerequisiteStateFromContext = (ctx) => {
  if (ctx?.useChecklistMock) {
    return { ready: true, key: "ready", canLoadChecklists: true };
  }
  if (ctx?.callDetailLoading) {
    return { ready: false, key: "callDetailLoading", canLoadChecklists: false };
  }

  const hasCall = !isEmptyValue(ctx?.calltypePayload);
  const hasPort = !isEmptyValue(ctx?.portIdForApi);
  const hasVessel = !!ctx?.hasVessel;
  const hasBarge = !!ctx?.hasBarge;

  if (!hasCall) {
    return { ready: false, key: "calltype", canLoadChecklists: false };
  }
  if (!hasPort) {
    return { ready: false, key: "port", canLoadChecklists: false };
  }
  if (!hasVessel && !hasBarge) {
    return { ready: false, key: "vesselBarge", canLoadChecklists: false };
  }
  return { ready: true, key: "ready", canLoadChecklists: true };
};

function isEmptyValue(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  return false;
}

/** @deprecated use getPrerequisiteStateFromContext with buildChecklistDataContext */
export const getPrerequisiteState = (formValues) => {
  const callRaw = formValues?.typeOfCall;
  const hasCall = callRaw != null && String(callRaw).trim() !== "";
  const portRaw = formValues?.port;
  const hasPort = portRaw != null && String(portRaw).trim() !== "";
  const vesselTypeId = Number(formValues?.vesselType);
  const bargeTypeId = Number(formValues?.bargeType);
  const hasVessel = vesselTypeId && !Number.isNaN(vesselTypeId);
  const hasBarge = bargeTypeId && !Number.isNaN(bargeTypeId);

  if (!hasCall) {
    return { ready: false, key: "calltype", canLoadChecklists: false };
  }
  if (!hasPort) {
    return { ready: false, key: "port", canLoadChecklists: false };
  }
  if (!hasVessel && !hasBarge) {
    return { ready: false, key: "vesselBarge", canLoadChecklists: false };
  }
  return { ready: true, key: "ready", canLoadChecklists: true };
};

export const getChecklistInfoHelper = (ps) => {
  if (ps.key === "calltype") return "Call type ID is required to load checklists";
  if (ps.key === "port") return "Select Port first";
  if (ps.key === "vesselBarge") return "Select Vessel Type or Barge Type first";
  if (ps.key === "callDetailLoading") return "Loading call data…";
  if (ps.key === "ready") return;
  return;
};
