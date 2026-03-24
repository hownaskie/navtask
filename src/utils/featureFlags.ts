export const isDashboardStatusCardEnabled = (): boolean => {
  return import.meta.env.VITE_FEATURE_DASHBOARD_STATUS_CARD !== "false";
};
