import * as React from "react";
import type { DashboardData, DashboardLoadState } from "../types";
import { DataverseService } from "../services/DataverseService";

const EMPTY_DATA: DashboardData = {
  appointments: [],
  accounts: [],
  revenue: {
    openOpportunityCount: 0,
    openPipelineValue: 0,
    closedWonValue: 0,
    quotaAttainmentPercent: 0,
    topOpportunityName: "No open opportunities",
  },
  hasMoreAppointments: false,
  hasMoreAccounts: false,
};

export const useDashboardData = (
  service: DataverseService,
  recordLimit: number,
  lookAheadDays: number
): {
  state: DashboardLoadState;
  reload: () => Promise<void>;
} => {
  const [state, setState] = React.useState<DashboardLoadState>({
    isLoading: true,
    errorMessage: "",
    data: EMPTY_DATA,
  });

  const loadData = React.useCallback(async (): Promise<void> => {
    setState((previous) => ({
      ...previous,
      isLoading: true,
      errorMessage: "",
    }));

    try {
      const data = await service.loadDashboardData(recordLimit, lookAheadDays);
      setState({
        isLoading: false,
        errorMessage: "",
        data,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load dashboard data.";
      setState((previous) => ({
        ...previous,
        isLoading: false,
        errorMessage: message,
      }));
    }
  }, [lookAheadDays, recordLimit, service]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    state,
    reload: loadData,
  };
};
