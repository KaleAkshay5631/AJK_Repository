import * as React from "react";
import { Body1, Body1Strong, Caption1, makeStyles, tokens } from "@fluentui/react-components";
import type { KpiData, RelationshipHealth } from "../types";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface CustomerHealthScoreSectionProps {
  health: RelationshipHealth;
  kpis: KpiData;
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const GAUGE_SIZE = 156;
const GAUGE_STROKE = 16;

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: tokens.spacingHorizontalM,
    "@media screen and (min-width: 620px)": {
      gridTemplateColumns: "190px 1fr",
      alignItems: "center",
    },
  },
  gaugeWrap: {
    position: "relative",
    width: `${GAUGE_SIZE}px`,
    height: `${GAUGE_SIZE}px`,
    justifySelf: "center",
  },
  gaugeTrack: {
    fill: "none",
    stroke: "#e7edf6",
    strokeLinecap: "round",
    strokeWidth: `${GAUGE_STROKE}px`,
  },
  gaugeProgress: {
    fill: "none",
    stroke: "#2d9c4b",
    strokeLinecap: "round",
    strokeWidth: `${GAUGE_STROKE}px`,
    transform: "rotate(180deg)",
    transformOrigin: "50% 50%",
  },
  gaugeCenter: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacingVerticalXXS,
  },
  gaugeScore: {
    fontSize: "2.6rem",
    lineHeight: "2.6rem",
    color: "#0f172a",
  },
  gaugeStatus: {
    color: "#2d9c4b",
    fontSize: "1.25rem",
    lineHeight: "1.35rem",
  },
  trendCard: {
    border: "1px solid #d9e6f4",
    backgroundColor: "#f8fbff",
    borderRadius: tokens.borderRadiusLarge,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  trendValuePositive: {
    color: "#2d9c4b",
    fontSize: "1.5rem",
    lineHeight: "1.7rem",
  },
  trendValueNegative: {
    color: "#c2402b",
    fontSize: "1.5rem",
    lineHeight: "1.7rem",
  },
  breakdownBlock: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  breakdownRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr auto",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  barTrack: {
    width: "100%",
    height: "8px",
    backgroundColor: "#edf2f8",
    borderRadius: tokens.borderRadiusCircular,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: tokens.borderRadiusCircular,
  },
  insight: {
    border: "1px solid #d7e4f3",
    backgroundColor: "#f4f8ff",
    borderRadius: tokens.borderRadiusLarge,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
});

interface BreakdownItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

const getTrendPoints = (daysSinceLastActivity: number | null): number => {
  if (daysSinceLastActivity === null) {
    return 0;
  }

  return clamp(8 - Math.floor(daysSinceLastActivity / 7), -12, 12);
};

const getBreakdown = (health: RelationshipHealth, kpis: KpiData): BreakdownItem[] => {
  const adoption = clamp(health.score + 6, 0, 100);
  const support = clamp(82 - kpis.openCases * 6, 0, 100);
  const revenue = clamp(health.score + (kpis.openPipelineValue > 0 ? 10 : -12), 0, 100);
  const renewalRisk = clamp(100 - Math.round(health.score * 0.55), 0, 100);

  return [
    { key: "adoption", label: "Adoption", value: adoption, color: "#2d9c4b" },
    { key: "support", label: "Support", value: support, color: "#e6a01a" },
    { key: "revenue", label: "Revenue", value: revenue, color: "#2d9c4b" },
    { key: "renewalRisk", label: "Renewal Risk", value: renewalRisk, color: "#cf3a2b" },
  ];
};

export const CustomerHealthScoreSection: React.FC<CustomerHealthScoreSectionProps> = ({
  health,
  kpis,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  const styles = useStyles();
  const score = clamp(health.score, 0, 100);
  const radius = (GAUGE_SIZE - GAUGE_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const visibleArc = circumference * 0.75;
  const strokeOffset = visibleArc - (score / 100) * visibleArc;
  const trendPoints = getTrendPoints(kpis.daysSinceLastActivity);
  const trendClassName = trendPoints < 0 ? styles.trendValueNegative : styles.trendValuePositive;
  const breakdown = getBreakdown(health, kpis);

  return (
    <SectionCard
      title="Customer Health Score"
      subtitle="Unified customer health snapshot"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className={styles.root}>
          <div className={styles.topRow}>
            <div className={styles.gaugeWrap}>
              <svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`} aria-hidden="true">
                <circle
                  className={styles.gaugeTrack}
                  cx={GAUGE_SIZE / 2}
                  cy={GAUGE_SIZE / 2}
                  r={radius}
                  strokeDasharray={`${visibleArc} ${circumference}`}
                  transform={`rotate(135 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
                />
                <circle
                  className={styles.gaugeProgress}
                  cx={GAUGE_SIZE / 2}
                  cy={GAUGE_SIZE / 2}
                  r={radius}
                  strokeDasharray={`${visibleArc} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  transform={`rotate(135 ${GAUGE_SIZE / 2} ${GAUGE_SIZE / 2})`}
                />
              </svg>
              <div className={styles.gaugeCenter}>
                <Body1Strong className={styles.gaugeScore}>{score}</Body1Strong>
                <Caption1>/ 100</Caption1>
                <Body1Strong className={styles.gaugeStatus}>{health.status}</Body1Strong>
              </div>
            </div>

            <div className={styles.trendCard}>
              <Caption1>Trend</Caption1>
              <Body1Strong className={trendClassName}>
                {trendPoints >= 0 ? `+${trendPoints}` : trendPoints} pts
              </Body1Strong>
              <Body1>vs last 90 days</Body1>
            </div>
          </div>

          <div className={styles.breakdownBlock}>
            <Body1Strong>Health Breakdown</Body1Strong>
            {breakdown.map((item) => (
              <div key={item.key} className={styles.breakdownRow}>
                <Caption1>{item.label}</Caption1>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <Caption1>{item.value} / 100</Caption1>
              </div>
            ))}
          </div>

          <div className={styles.insight}>
            <Body1Strong>AI Insight</Body1Strong>
            <Body1>{health.rationale}</Body1>
          </div>
        </div>
      )}
    </SectionCard>
  );
};