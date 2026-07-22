export interface RecentActivity {
  id: string;
  subject: string;
  activityType: string;
  dueUtc: string;
  modifiedOnUtc: string;
  status: string;
}

export interface AccountSummary {
  name: string;
  accountNumber: string;
  industry: string;
  annualRevenue: number;
  owner: string;
  phone: string;
  email: string;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  intent: "error" | "warning" | "success" | "info";
}

export interface KpiData {
  openOpportunities: number;
  openPipelineValue: number;
  openCases: number;
  daysSinceLastActivity: number | null;
}

export interface RelationshipHealth {
  score: number;
  status: string;
  rationale: string;
}

export interface DashboardData {
  accountSummary: AccountSummary;
  alerts: AlertItem[];
  kpis: KpiData;
  relationshipHealth: RelationshipHealth;
  recentActivities: RecentActivity[];
}

export interface DashboardLoadState {
  isLoading: boolean;
  errorMessage: string;
  data: DashboardData;
}
