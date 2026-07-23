import * as React from "react";
import { Body1, Body1Strong, Caption1, makeStyles, tokens } from "@fluentui/react-components";
import type { AccountCase } from "../types";
import { formatShortDate } from "../utils/format";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface CasesSectionProps {
  cases: AccountCase[];
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

interface PriorityBand {
  label: string;
  count: number;
}

const PRIORITY_LABELS = ["High", "Normal", "Low", "Unknown"] as const;
type PriorityLabel = (typeof PRIORITY_LABELS)[number];

const normalizePriority = (priority: string): PriorityLabel => {
  const normalized = priority.trim().toLowerCase();

  if (normalized.includes("high")) {
    return "High";
  }

  if (normalized.includes("normal") || normalized.includes("medium")) {
    return "Normal";
  }

  if (normalized.includes("low")) {
    return "Low";
  }

  return "Unknown";
};

const buildPriorityBands = (items: AccountCase[]): PriorityBand[] => {
  const counts: Record<PriorityLabel, number> = {
    High: 0,
    Normal: 0,
    Low: 0,
    Unknown: 0,
  };

  items.forEach((item) => {
    const key = normalizePriority(item.priority);
    counts[key] += 1;
  });

  return PRIORITY_LABELS.map((label) => ({
    label,
    count: counts[label],
  }));
};

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  barChart: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "64px 1fr auto",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  barTrack: {
    width: "100%",
    height: "10px",
    backgroundColor: "#e8f0f9",
    borderRadius: tokens.borderRadiusCircular,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: tokens.borderRadiusCircular,
    background: "linear-gradient(90deg, #0d5a92 0%, #3a8ac4 100%)",
    transition: "width 0.25s ease",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  caseItem: {
    border: "1px solid #d9e6f4",
    backgroundColor: "#ffffff",
    borderRadius: tokens.borderRadiusLarge,
    padding: tokens.spacingHorizontalS,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  caseHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    flexWrap: "wrap",
  },
  meta: {
    color: tokens.colorNeutralForeground3,
  },
});

export const CasesSection: React.FC<CasesSectionProps> = ({
  cases,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  const styles = useStyles();
  const priorityBands = buildPriorityBands(cases);
  const maxCount = Math.max(...priorityBands.map((band) => band.count), 1);

  return (
    <SectionCard
      title="Account Cases"
      subtitle="Open cases with priority distribution"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : cases.length === 0 ? (
        <Body1>No open cases found for this account.</Body1>
      ) : (
        <div className={styles.root}>
          <div className={styles.barChart}>
            <Body1Strong>Case Priority Mix</Body1Strong>
            {priorityBands.map((band) => (
              <div key={band.label} className={styles.barRow}>
                <Caption1>{band.label}</Caption1>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${(band.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <Caption1>{band.count}</Caption1>
              </div>
            ))}
          </div>

          <div className={styles.list}>
            <Body1Strong>Open Cases</Body1Strong>
            {cases.map((accountCase) => (
              <div key={accountCase.id} className={styles.caseItem}>
                <div className={styles.caseHeader}>
                  <Body1Strong>{accountCase.title}</Body1Strong>
                  <Caption1>{accountCase.status}</Caption1>
                </div>
                <Body1 className={styles.meta}>
                  #{accountCase.ticketNumber} | Priority {accountCase.priority} | Opened {formatShortDate(accountCase.createdOnUtc)}
                </Body1>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
};
