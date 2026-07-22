export interface Appointment {
  id: string;
  subject: string;
  startUtc: string;
  endUtc: string;
  regardingName: string;
}

export interface AccountSummary {
  id: string;
  name: string;
  annualRevenue: number;
  city: string;
  lastActivityUtc: string;
}

export interface RevenueAnalytics {
  openOpportunityCount: number;
  openPipelineValue: number;
  closedWonValue: number;
  quotaAttainmentPercent: number;
  topOpportunityName: string;
}

export interface DashboardData {
  appointments: Appointment[];
  accounts: AccountSummary[];
  revenue: RevenueAnalytics;
  hasMoreAppointments: boolean;
  hasMoreAccounts: boolean;
}

export interface DashboardLoadState {
  isLoading: boolean;
  errorMessage: string;
  data: DashboardData;
}

export interface PagedCollection<T> {
  records: T[];
  hasMore: boolean;
}
