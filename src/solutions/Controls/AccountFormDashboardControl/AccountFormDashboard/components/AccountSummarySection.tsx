import * as React from "react";
import { Body1Strong, Caption1, Subtitle1, makeStyles, tokens } from "@fluentui/react-components";
import type { AccountSummary } from "../types";
import { formatCurrency, formatPhone } from "../utils/format";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface AccountSummarySectionProps {
  account: AccountSummary;
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const useStyles = makeStyles({
  title: {
    fontSize: "1.45rem",
    lineHeight: "1.6rem",
    color: "#09365c",
  },
  grid: {
    display: "grid",
    gap: tokens.spacingVerticalS,
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  },
  tile: {
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: "#f8fbff",
    border: "1px solid #d7e8f8",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  label: {
    color: tokens.colorNeutralForeground3,
  },
});

const SummaryTile: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const styles = useStyles();

  return (
    <div className={styles.tile}>
      <Caption1 className={styles.label}>{label}</Caption1>
      <Body1Strong>{value || "Not set"}</Body1Strong>
    </div>
  );
};

export const AccountSummarySection: React.FC<AccountSummarySectionProps> = ({
  account,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  const styles = useStyles();

  return (
    <SectionCard
      title="Account Summary"
      subtitle="Core account details"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : (
        <>
          <Subtitle1 className={styles.title}>{account.name || "Unknown account"}</Subtitle1>
          <div className={styles.grid}>
            <SummaryTile label="Account Number" value={account.accountNumber} />
            <SummaryTile label="Industry" value={account.industry} />
            <SummaryTile label="Annual Revenue" value={formatCurrency(account.annualRevenue)} />
            <SummaryTile label="Owner" value={account.owner} />
            <SummaryTile label="Phone" value={formatPhone(account.phone)} />
            <SummaryTile label="Email" value={account.email || "Not set"} />
          </div>
        </>
      )}
    </SectionCard>
  );
};
