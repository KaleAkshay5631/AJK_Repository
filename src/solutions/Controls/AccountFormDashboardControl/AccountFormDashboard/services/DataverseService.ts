import type { IInputs } from "../generated/ManifestTypes";
import type { AccountCase, AccountSummary, AlertItem, DashboardData, KpiData, RecentActivity, RelationshipHealth } from "../types";

interface DataverseCollectionResponse<TRecord> {
  entities: TRecord[];
}

type DataverseRecord = Record<string, unknown>;

const EMPTY_SUMMARY: AccountSummary = {
  name: "Unknown account",
  accountNumber: "Not set",
  industry: "Not set",
  annualRevenue: 0,
  owner: "Not set",
  phone: "Not set",
  email: "Not set",
};

const EMPTY_KPIS: KpiData = {
  openOpportunities: 0,
  openPipelineValue: 0,
  openCases: 0,
  daysSinceLastActivity: null,
};

const EMPTY_RELATIONSHIP_HEALTH: RelationshipHealth = {
  score: 0,
  status: "Unavailable",
  rationale: "No account context was found.",
};

export class DataverseService {
  private readonly context: ComponentFramework.Context<IInputs>;

  constructor(context: ComponentFramework.Context<IInputs>) {
    this.context = context;
  }

  public async loadDashboardData(accountId: string, activityLimit: number): Promise<DashboardData> {
    if (!accountId) {
      return {
        accountSummary: EMPTY_SUMMARY,
        alerts: [
          {
            id: "missing-record",
            title: "No account record context",
            message: "Place this control on the Account main form and bind it to a text field.",
            intent: "warning",
          },
        ],
        kpis: EMPTY_KPIS,
        cases: [],
        relationshipHealth: EMPTY_RELATIONSHIP_HEALTH,
        recentActivities: [],
      };
    }

    const [accountSummary, opportunities, openCases, recentActivities] = await Promise.all([
      this.getAccountSummary(accountId),
      this.getOpenOpportunities(accountId),
      this.getOpenCases(accountId),
      this.getRecentActivities(accountId, activityLimit),
    ]);

    const kpis = this.getKpis(opportunities, openCases, recentActivities);
    const relationshipHealth = this.getRelationshipHealth(accountSummary, kpis);
    const alerts = this.getAlerts(accountSummary, kpis, recentActivities, relationshipHealth);

    return {
      accountSummary,
      alerts,
      kpis,
      cases: openCases,
      relationshipHealth,
      recentActivities,
    };
  }

  private async getAccountSummary(accountId: string): Promise<AccountSummary> {
    try {
      const record = (await this.context.webAPI.retrieveRecord(
        "account",
        accountId,
        "?$select=name,accountnumber,industrycode,revenue,telephone1,emailaddress1,_ownerid_value"
      )) as DataverseRecord;

      return {
        name: String(record["name"] ?? EMPTY_SUMMARY.name),
        accountNumber: String(record["accountnumber"] ?? EMPTY_SUMMARY.accountNumber),
        industry: String(
          record["industrycode@OData.Community.Display.V1.FormattedValue"] ?? EMPTY_SUMMARY.industry
        ),
        annualRevenue: Number(record["revenue"] ?? EMPTY_SUMMARY.annualRevenue),
        owner: String(
          record["_ownerid_value@OData.Community.Display.V1.FormattedValue"] ?? EMPTY_SUMMARY.owner
        ),
        phone: String(record["telephone1"] ?? EMPTY_SUMMARY.phone),
        email: String(record["emailaddress1"] ?? EMPTY_SUMMARY.email),
      };
    } catch (error) {
      console.error("Unable to retrieve account summary", error);
      return EMPTY_SUMMARY;
    }
  }

  private async getOpenOpportunities(accountId: string): Promise<DataverseRecord[]> {
    const query = [
      "?$select=kls_opportunityid,kls_estimatedvalue,statecode",
      `&$filter=_parentaccountid_value eq ${accountId} and statecode eq 0`,
    ].join("");

    try {
      const result = (await this.context.webAPI.retrieveMultipleRecords(
        "kls_opportunity",
        query
      )) as DataverseCollectionResponse<DataverseRecord>;
      return result.entities;
    } catch (error) {
      console.error("Unable to retrieve opportunities", error);
      return [];
    }
  }

  private async getOpenCases(accountId: string): Promise<AccountCase[]> {
    const query = [
      "?$select=incidentid,title,ticketnumber,prioritycode,statecode,statuscode,createdon",
      `&$filter=_customerid_value eq ${accountId} and statecode eq 0`,
      "&$orderby=createdon desc",
      "&$top=15",
    ].join("");

    try {
      const result = (await this.context.webAPI.retrieveMultipleRecords(
        "incident",
        query
      )) as DataverseCollectionResponse<DataverseRecord>;

      return result.entities.map((record) => ({
        id: String(record["incidentid"] ?? ""),
        title: String(record["title"] ?? "Untitled case"),
        ticketNumber: String(record["ticketnumber"] ?? "No ticket"),
        priority: String(
          record["prioritycode@OData.Community.Display.V1.FormattedValue"] ??
          record["prioritycode"] ??
          "Unknown"
        ),
        status: String(
          record["statuscode@OData.Community.Display.V1.FormattedValue"] ??
          record["statecode@OData.Community.Display.V1.FormattedValue"] ??
          "Open"
        ),
        createdOnUtc: String(record["createdon"] ?? ""),
      }));
    } catch (error) {
      console.error("Unable to retrieve open cases", error);
      return [];
    }
  }

  private async getRecentActivities(accountId: string, activityLimit: number): Promise<RecentActivity[]> {
    const safeLimit = Math.max(activityLimit, 1);
    const query = [
      "?$select=activityid,subject,activitytypecode,scheduledend,modifiedon,statecode,statuscode",
      `&$filter=_regardingobjectid_value eq ${accountId}`,
      "&$orderby=modifiedon desc",
      `&$top=${safeLimit}`,
    ].join("");

    try {
      const result = (await this.context.webAPI.retrieveMultipleRecords(
        "activitypointer",
        query
      )) as DataverseCollectionResponse<DataverseRecord>;

      return result.entities.map((record) => ({
        id: String(record["activityid"] ?? ""),
        subject: String(record["subject"] ?? "Untitled activity"),
        activityType: String(
          record["activitytypecode@OData.Community.Display.V1.FormattedValue"] ??
          record["activitytypecode"] ??
          "Activity"
        ),
        dueUtc: String(record["scheduledend"] ?? ""),
        modifiedOnUtc: String(record["modifiedon"] ?? ""),
        status: String(
          record["statecode@OData.Community.Display.V1.FormattedValue"] ??
          record["statuscode@OData.Community.Display.V1.FormattedValue"] ??
          "Unknown"
        ),
      }));
    } catch (error) {
      console.error("Unable to retrieve recent activities", error);
      return [];
    }
  }

  private getKpis(opportunities: DataverseRecord[], openCases: AccountCase[], activities: RecentActivity[]): KpiData {
    const openPipelineValue = opportunities.reduce((sum, opportunity) => {
      return sum + Number(opportunity["estimatedvalue"] ?? 0);
    }, 0);

    const latestActivity = activities[0]?.modifiedOnUtc;
    const daysSinceLastActivity = latestActivity ? this.getDaysSince(latestActivity) : null;

    return {
      openOpportunities: opportunities.length,
      openPipelineValue,
      openCases: openCases.length,
      daysSinceLastActivity,
    };
  }

  private getRelationshipHealth(summary: AccountSummary, kpis: KpiData): RelationshipHealth {
    let score = 100;

    if (!summary.email || summary.email === "Not set") {
      score -= 12;
    }

    if (!summary.phone || summary.phone === "Not set") {
      score -= 12;
    }

    if (kpis.openCases >= 3) {
      score -= 15;
    }

    if ((kpis.daysSinceLastActivity ?? 0) > 30) {
      score -= 20;
    }

    if (kpis.openPipelineValue <= 0) {
      score -= 10;
    }

    const boundedScore = Math.max(0, Math.min(100, score));

    if (boundedScore >= 80) {
      return {
        score: boundedScore,
        status: "Strong",
        rationale: "Engagement is healthy with active commercial momentum.",
      };
    }

    if (boundedScore >= 55) {
      return {
        score: boundedScore,
        status: "Watch",
        rationale: "Relationship is stable but has signals that need attention.",
      };
    }

    return {
      score: boundedScore,
      status: "At Risk",
      rationale: "Relationship needs focused follow-up to avoid revenue risk.",
    };
  }

  private getAlerts(
    summary: AccountSummary,
    kpis: KpiData,
    activities: RecentActivity[],
    relationshipHealth: RelationshipHealth
  ): AlertItem[] {
    const alerts: AlertItem[] = [];

    if (!summary.email || summary.email === "Not set") {
      alerts.push({
        id: "missing-email",
        title: "Contact email missing",
        message: "Add a primary email to improve engagement and campaign reach.",
        intent: "warning",
      });
    }

    if (!summary.phone || summary.phone === "Not set") {
      alerts.push({
        id: "missing-phone",
        title: "Phone number missing",
        message: "Capture a direct phone number for faster relationship follow-up.",
        intent: "warning",
      });
    }

    if (kpis.openCases >= 5) {
      alerts.push({
        id: "cases-spike",
        title: "High support case volume",
        message: `${kpis.openCases} open cases may impact account satisfaction and renewal health.`,
        intent: "error",
      });
    }

    if ((kpis.daysSinceLastActivity ?? 0) > 30) {
      alerts.push({
        id: "stale-activity",
        title: "No recent engagement",
        message: "No logged activity in the last 30 days. Consider a check-in touchpoint.",
        intent: "warning",
      });
    }

    if (activities.length === 0) {
      alerts.push({
        id: "no-activity",
        title: "No activities found",
        message: "No recent account activities were found for this record.",
        intent: "info",
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: "all-clear",
        title: "No critical alerts",
        message: `Relationship health is ${relationshipHealth.status.toLowerCase()} with no immediate blockers.`,
        intent: "success",
      });
    }

    return alerts;
  }

  private getDaysSince(isoUtc: string): number {
    const utcDate = new Date(isoUtc);
    if (Number.isNaN(utcDate.getTime())) {
      return 0;
    }

    const elapsedMilliseconds = Date.now() - utcDate.getTime();
    return Math.max(0, Math.floor(elapsedMilliseconds / (1000 * 60 * 60 * 24)));
  }
}
