import type { IInputs } from "../generated/ManifestTypes";
import type { AccountSummary, Appointment, DashboardData, PagedCollection, RevenueAnalytics } from "../types";

interface DataverseCollectionResponse<TRecord> {
  entities: TRecord[];
  nextLink?: string;
}

type DataverseRecord = Record<string, unknown>;

const EMPTY_REVENUE: RevenueAnalytics = {
  openOpportunityCount: 0,
  openPipelineValue: 0,
  closedWonValue: 0,
  quotaAttainmentPercent: 0,
  topOpportunityName: "No open opportunities",
};

export class DataverseService {
  private readonly context: ComponentFramework.Context<IInputs>;
  private readonly pageSize: number;

  constructor(context: ComponentFramework.Context<IInputs>, pageSize = 20) {
    this.context = context;
    this.pageSize = pageSize;
  }

  public async loadDashboardData(recordLimit: number, lookAheadDays: number): Promise<DashboardData> {
    const [appointmentsResult, accountsResult, revenue] = await Promise.all([
      this.getAppointments(recordLimit, lookAheadDays),
      this.getAccounts(recordLimit),
      this.getRevenueAnalytics(),
    ]);

    return {
      appointments: appointmentsResult.records,
      accounts: accountsResult.records,
      revenue,
      hasMoreAppointments: appointmentsResult.hasMore,
      hasMoreAccounts: accountsResult.hasMore,
    };
  }

  private async getAppointments(limit: number, lookAheadDays: number): Promise<PagedCollection<Appointment>> {
    const range = this.getDateRange(lookAheadDays);
    // const query = [
    //   "?$select=activityid,subject,scheduledstart,scheduledend,_regardingobjectid_value",
    //   `&$filter=statecode eq 0 and scheduledstart ge ${range.startIso} and scheduledstart lt ${range.endIso}`,
    //   "&$orderby=scheduledstart asc",
    // ].join("");
    const query = [
      "?$select=activityid,subject,scheduledstart,scheduledend,_regardingobjectid_value",
      `&$filter=statecode eq 0`,
      "&$orderby=scheduledstart asc",
    ].join("");

    const paged = await this.retrievePaged("appointment", query, limit);

    return {
      records: paged.records.map((record) => ({
        id: String(record["activityid"] ?? ""),
        subject: String(record["subject"] ?? "Untitled appointment"),
        startUtc: String(record["scheduledstart"] ?? ""),
        endUtc: String(record["scheduledend"] ?? ""),
        regardingName: String(
          record["_regardingobjectid_value@OData.Community.Display.V1.FormattedValue"] ?? "No related record"
        ),
      })),
      hasMore: paged.hasMore,
    };
  }

  private async getAccounts(limit: number): Promise<PagedCollection<AccountSummary>> {
    const query = [
      "?$select=accountid,name,revenue,address1_city,modifiedon",
      "&$filter=statecode eq 0",
      "&$orderby=modifiedon desc",
    ].join("");

    const paged = await this.retrievePaged("account", query, limit);

    return {
      records: paged.records.map((record) => ({
        id: String(record["accountid"] ?? ""),
        name: String(record["name"] ?? "Unnamed account"),
        annualRevenue: Number(record["revenue"] ?? 0),
        city: String(record["address1_city"] ?? "Unknown city"),
        lastActivityUtc: String(record["modifiedon"] ?? ""),
      })),
      hasMore: paged.hasMore,
    };
  }

  private async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    try {
      const openQuery = "?$select=kls_opportunityid,kls_name,kls_estimatedvalue,statecode&$filter=statecode eq 0 &$orderby=kls_estimatedvalue desc";
      const closedWonQuery = "?$select=kls_estimatedvalue,statecode,statuscode&$filter=statecode eq 0 and statuscode eq 845140001";

      const [openResult, closedWonResult] = await Promise.all([
        this.context.webAPI.retrieveMultipleRecords("kls_opportunity", openQuery, this.pageSize),
        this.context.webAPI.retrieveMultipleRecords("kls_opportunity", closedWonQuery, this.pageSize),
      ]);

      const openOpportunities = (openResult as DataverseCollectionResponse<DataverseRecord>).entities;
      const closedWonOpportunities = (closedWonResult as DataverseCollectionResponse<DataverseRecord>).entities;

      const openPipelineValue = openOpportunities.reduce((sum, opportunity) => {
        return sum + Number(opportunity["kls_estimatedvalue"] ?? 0);
      }, 0);

      const closedWonValue = closedWonOpportunities.reduce((sum, opportunity) => {
        return sum + Number(opportunity["kls_estimatedvalue"] ?? 0);
      }, 0);

      const quotaTarget = Math.max(openPipelineValue, 1);
      const quotaAttainmentPercent = Math.min(Math.round((closedWonValue / quotaTarget) * 100), 100);

      return {
        openOpportunityCount: openOpportunities.length,
        openPipelineValue,
        closedWonValue,
        quotaAttainmentPercent,
        topOpportunityName: String(openOpportunities[0]?.["kls_name"] ?? "No open opportunities"),
      };
    } catch {
      return EMPTY_REVENUE;
    }
  }

  private async retrievePaged(
    entityLogicalName: string,
    initialQuery: string,
    maxRecords: number
  ): Promise<PagedCollection<DataverseRecord>> {
    const records: DataverseRecord[] = [];
    let hasMore = false;
    let query = initialQuery;

    try {
      while (query && records.length < maxRecords) {
        const response = (await this.context.webAPI.retrieveMultipleRecords(
          entityLogicalName,
          query,
          this.pageSize
        )) as DataverseCollectionResponse<DataverseRecord>;

        records.push(...response.entities);

        if (response.nextLink) {
          query = this.normalizeQueryOptions(response.nextLink);
          hasMore = true;
        } else {
          query = "";
        }
      }

    }
    catch (error) {
      console.error(`Error retrieving records for ${entityLogicalName}:`, error);
    }

    return {
      records: records.slice(0, maxRecords),
      hasMore,
    };
  }

  private normalizeQueryOptions(nextLink: string): string {
    if (!nextLink) {
      return "";
    }

    if (nextLink.startsWith("?")) {
      return nextLink;
    }

    const queryIndex = nextLink.indexOf("?");
    if (queryIndex >= 0) {
      return nextLink.slice(queryIndex);
    }

    return `?${nextLink}`;
  }

  private getDateRange(lookAheadDays: number): { startIso: string; endIso: string } {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + Math.max(lookAheadDays, 1));

    return {
      startIso: start.toISOString(),
      endIso: end.toISOString(),
    };
  }
}
