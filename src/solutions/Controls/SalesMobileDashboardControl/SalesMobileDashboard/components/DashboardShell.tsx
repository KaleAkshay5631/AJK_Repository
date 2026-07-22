import * as React from "react";
import { Body1Strong, FluentProvider, MessageBar, MessageBarBody, MessageBarTitle, makeStyles, tokens } from "@fluentui/react-components";
import type { DashboardLoadState } from "../types";
import { salesMobileTheme } from "../styles/theme";
import { AccountsSection } from "./AccountsSection";
import { AppointmentsSection } from "./AppointmentsSection";
import { QuickActionsSection } from "./QuickActionsSection";
import { RevenueAnalyticsSection } from "./RevenueAnalyticsSection";

interface DashboardShellProps {
  state: DashboardLoadState;
  onRefresh: () => Promise<void>;
  onCreateAccount: () => Promise<void>;
  onCreateOpportunity: () => Promise<void>;
  onCreateAppointment: () => Promise<void>;
}

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
    "@media screen and (min-width: 768px)": {
      padding: tokens.spacingHorizontalL,
    },
  },
  heading: {
    color: tokens.colorBrandForeground1,
  },
});

export const DashboardShell: React.FC<DashboardShellProps> = ({
  state,
  onRefresh,
  onCreateAccount,
  onCreateOpportunity,
  onCreateAppointment,
}) => {
  const styles = useStyles();

  return (
    <FluentProvider className={styles.provider} theme={salesMobileTheme}>
      <div className={styles.root}>
        <Body1Strong className={styles.heading}>Sales Mobile Dashboard</Body1Strong>

        {state.errorMessage ? (
          <MessageBar intent="warning">
            <MessageBarBody>
              <MessageBarTitle>Some data could not be loaded</MessageBarTitle>
              {state.errorMessage}
            </MessageBarBody>
          </MessageBar>
        ) : null}

        <AppointmentsSection
          items={state.data.appointments}
          isLoading={state.isLoading}
          errorMessage={state.errorMessage}
          hasMore={state.data.hasMoreAppointments}
          onRetry={onRefresh}
        />

        <AccountsSection
          items={state.data.accounts}
          isLoading={state.isLoading}
          errorMessage={state.errorMessage}
          hasMore={state.data.hasMoreAccounts}
          onRetry={onRefresh}
        />

        <RevenueAnalyticsSection item={state.data.revenue} isLoading={state.isLoading} />

        <QuickActionsSection
          onCreateAccount={onCreateAccount}
          onCreateOpportunity={onCreateOpportunity}
          onCreateAppointment={onCreateAppointment}
          onRefresh={onRefresh}
        />
      </div>
    </FluentProvider>
  );
};
