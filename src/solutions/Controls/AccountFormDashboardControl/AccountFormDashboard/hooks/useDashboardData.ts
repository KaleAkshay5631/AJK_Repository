import * as React from "react";
import type { DashboardData, DashboardLoadState } from "../types";
import { DataverseService } from "../services/DataverseService";

const EMPTY_DATA: DashboardData = {
  accountSummary: {
    name: "",
    accountNumber: "",
    industry: "",
    annualRevenue: 0,
    owner: "",
    phone: "",
    email: "",
  },
  alerts: [],
  kpis: {
    openOpportunities: 0,
    openPipelineValue: 0,
    openCases: 0,
    daysSinceLastActivity: null,
  },
  cases: [],
  relationshipHealth: {
    score: 0,
    status: "Unavailable",
    rationale: "No account context was found.",
  },
  recentActivities: [],
};

export const useDashboardData = (
  service: DataverseService,
  accountId: string,
  activityLimit: number
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
      const data = await service.loadDashboardData(accountId, activityLimit);
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
  }, [accountId, activityLimit, service]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  return {
    state,
    reload: loadData,
  };
};
