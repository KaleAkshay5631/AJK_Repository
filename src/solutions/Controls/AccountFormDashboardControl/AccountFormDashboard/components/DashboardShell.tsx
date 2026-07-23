import * as React from "react";
import { Body1Strong, FluentProvider, MessageBar, MessageBarBody, MessageBarTitle, Title2, makeStyles, tokens } from "@fluentui/react-components";
import type { DashboardLoadState } from "../types";
import { salesMobileTheme } from "../styles/theme";
import { AccountSummarySection } from "./AccountSummarySection";
import { AlertsSection } from "./AlertsSection";
import { CasesSection } from "./CasesSection";
import { CustomerHealthScoreSection } from "./CustomerHealthScoreSection";
import { KpiCardsSection } from "./KpiCardsSection";
import { RelationshipHealthSection } from "./RelationshipHealthSection";
import { RecentActivitiesSection } from "./RecentActivitiesSection";

interface DashboardShellProps {
  entityName: string;
  isSupported: boolean;
  state: DashboardLoadState;
  onRefresh: () => Promise<void>;
}

type SectionKey = "accountSummary" | "alerts" | "customerHealthScore" | "kpis" | "cases" | "relationshipHealth" | "recentActivities";

const INITIAL_SECTION_STATE: Record<SectionKey, boolean> = {
  accountSummary: true,
  alerts: false,
  customerHealthScore: false,
  kpis: false,
  cases: false,
  relationshipHealth: false,
  recentActivities: false,
};

const useStyles = makeStyles({
  provider: {
    width: "100%",
    height: "100%",
    maxHeight: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: tokens.colorNeutralBackground4,
  },
  root: {
    width: "100%",
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalM,
    boxSizing: "border-box",
    background: "linear-gradient(160deg, #f7fbff 0%, #edf3fa 100%)",
    "@media screen and (min-width: 768px)": {
      padding: tokens.spacingHorizontalL,
    },
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  title: {
    color: "#0f4c81",
  },
  subtitle: {
    color: tokens.colorNeutralForeground3,
  },
});

export const DashboardShell: React.FC<DashboardShellProps> = ({
  entityName,
  isSupported,
  state,
  onRefresh,
}) => {
  const styles = useStyles();
  const [expandedSections, setExpandedSections] = React.useState<Record<SectionKey, boolean>>(INITIAL_SECTION_STATE);

  const toggleSection = React.useCallback((sectionKey: SectionKey) => {
    setExpandedSections((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }));
  }, []);

  return (
    <FluentProvider className={styles.provider} theme={salesMobileTheme}>
      <div className={styles.root}>
        <div className={styles.titleBlock}>
          <Title2 className={styles.title}>Account Relationship Dashboard</Title2>
          <Body1Strong className={styles.subtitle}>Mobile-first account intelligence for sellers</Body1Strong>
        </div>

        {!isSupported ? (
          <MessageBar intent="warning">
            <MessageBarBody>
              <MessageBarTitle>Unsupported form context</MessageBarTitle>
              This control is designed for the Account form. Current entity: {entityName || "unknown"}.
            </MessageBarBody>
          </MessageBar>
        ) : null}

        {state.errorMessage ? (
          <MessageBar intent="warning">
            <MessageBarBody>
              <MessageBarTitle>Some data could not be loaded</MessageBarTitle>
              {state.errorMessage}
            </MessageBarBody>
          </MessageBar>
        ) : null}

        <AccountSummarySection
          account={state.data.accountSummary}
          isLoading={state.isLoading}
          isExpanded={expandedSections.accountSummary}
          onToggleExpand={() => toggleSection("accountSummary")}
        />

        <AlertsSection
          alerts={state.data.alerts}
          isLoading={state.isLoading}
          isExpanded={expandedSections.alerts}
          onToggleExpand={() => toggleSection("alerts")}
        />

        <CustomerHealthScoreSection
          health={state.data.relationshipHealth}
          kpis={state.data.kpis}
          isLoading={state.isLoading}
          isExpanded={expandedSections.customerHealthScore}
          onToggleExpand={() => toggleSection("customerHealthScore")}
        />

        <KpiCardsSection
          kpis={state.data.kpis}
          isLoading={state.isLoading}
          isExpanded={expandedSections.kpis}
          onToggleExpand={() => toggleSection("kpis")}
        />

        <CasesSection
          cases={state.data.cases}
          isLoading={state.isLoading}
          isExpanded={expandedSections.cases}
          onToggleExpand={() => toggleSection("cases")}
        />

        <RelationshipHealthSection
          health={state.data.relationshipHealth}
          isLoading={state.isLoading}
          isExpanded={expandedSections.relationshipHealth}
          onToggleExpand={() => toggleSection("relationshipHealth")}
        />

        <RecentActivitiesSection
          activities={state.data.recentActivities}
          isLoading={state.isLoading}
          onRefresh={onRefresh}
          isExpanded={expandedSections.recentActivities}
          onToggleExpand={() => toggleSection("recentActivities")}
        />
      </div>
    </FluentProvider>
  );
};
