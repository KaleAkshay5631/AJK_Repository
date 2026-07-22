import * as React from "react";
import { Body1Strong, Caption1, makeStyles, tokens } from "@fluentui/react-components";
import type { KpiData } from "../types";
import { formatCurrency, formatDaysSince } from "../utils/format";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface KpiCardsSectionProps {
  kpis: KpiData;
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: tokens.spacingHorizontalS,
  },
  kpiCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #d9e6f4",
    borderRadius: tokens.borderRadiusLarge,
    padding: tokens.spacingHorizontalS,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  kpiLabel: {
    color: tokens.colorNeutralForeground3,
  },
  kpiValue: {
    color: "#0d5a92",
    fontSize: "1.2rem",
    lineHeight: "1.3rem",
  },
});

const KpiCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const styles = useStyles();

  return (
    <div className={styles.kpiCard}>
      <Caption1 className={styles.kpiLabel}>{label}</Caption1>
      <Body1Strong className={styles.kpiValue}>{value}</Body1Strong>
    </div>
  );
};

export const KpiCardsSection: React.FC<KpiCardsSectionProps> = ({
  kpis,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  const styles = useStyles();

  return (
    <SectionCard
      title="KPI Cards"
      subtitle="Commercial and service indicators"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {isLoading ? (
        <LoadingSkeleton rows={2} />
      ) : (
        <div className={styles.grid}>
          <KpiCard label="Open Opps" value={String(kpis.openOpportunities)} />
          <KpiCard label="Open Pipeline" value={formatCurrency(kpis.openPipelineValue)} />
          <KpiCard label="Open Cases" value={String(kpis.openCases)} />
          <KpiCard label="Last Activity" value={formatDaysSince(kpis.daysSinceLastActivity)} />
        </div>
      )}
    </SectionCard>
  );
};
