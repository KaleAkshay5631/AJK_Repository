import * as React from "react";
import {
  Caption1,
  ProgressBar,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { DataUsage24Regular } from "@fluentui/react-icons";
import type { RevenueAnalytics } from "../types";
import { formatCurrency } from "../utils/format";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface RevenueAnalyticsSectionProps {
  item: RevenueAnalytics;
  isLoading: boolean;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 140;
const CHART_PADDING = 16;

const buildLinePoints = (values: number[]): string => {
  const maxValue = Math.max(...values, 1);
  const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
  const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;
  const stepX = values.length > 1 ? usableWidth / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = CHART_PADDING + stepX * index;
      const y = CHART_HEIGHT - CHART_PADDING - (value / maxValue) * usableHeight;
      return `${x},${y}`;
    })
    .join(" ");
};

const useStyles = makeStyles({
  metricGrid: {
    display: "grid",
    gap: tokens.spacingHorizontalM,
    gridTemplateColumns: "1fr",
    "@media screen and (min-width: 720px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  metricCard: {
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingHorizontalM,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  progressBlock: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  chartBlock: {
    marginTop: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: tokens.spacingHorizontalS,
  },
  chartSvg: {
    width: "100%",
    height: "auto",
    display: "block",
  },
  chartAxis: {
    stroke: tokens.colorNeutralStroke2,
    strokeWidth: 1,
  },
  chartLine: {
    stroke: tokens.colorBrandStroke1,
    strokeWidth: 2,
    fill: "none",
  },
  chartPoint: {
    fill: tokens.colorBrandBackground,
  },
  chartLabels: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalS,
  },
  chartLabel: {
    color: tokens.colorNeutralForeground3,
  },
});

export const RevenueAnalyticsSection: React.FC<RevenueAnalyticsSectionProps> = ({ item, isLoading }) => {
  const styles = useStyles();
  const chartValues = [item.openPipelineValue, item.closedWonValue, item.openPipelineValue + item.closedWonValue];
  const chartPoints = buildLinePoints(chartValues);

  const chartCoordinates = chartValues.map((value, index) => {
    const maxValue = Math.max(...chartValues, 1);
    const usableWidth = CHART_WIDTH - CHART_PADDING * 2;
    const usableHeight = CHART_HEIGHT - CHART_PADDING * 2;
    const stepX = chartValues.length > 1 ? usableWidth / (chartValues.length - 1) : 0;

    return {
      key: `point-${index}`,
      x: CHART_PADDING + stepX * index,
      y: CHART_HEIGHT - CHART_PADDING - (value / maxValue) * usableHeight,
    };
  });

  return (
    <SectionCard title="Revenue Analytics" subtitle="Pipeline and won revenue performance" action={<DataUsage24Regular />}>
      {isLoading ? <LoadingSkeleton rows={3} /> : null}

      {!isLoading ? (
        <>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <Caption1>Open Opportunity Count</Caption1>
              <Text size={500} weight="bold">
                {item.openOpportunityCount}
              </Text>
            </div>

            <div className={styles.metricCard}>
              <Caption1>Open Pipeline Value</Caption1>
              <Text size={500} weight="bold">
                {formatCurrency(item.openPipelineValue)}
              </Text>
            </div>

            <div className={styles.metricCard}>
              <Caption1>Closed Won Value</Caption1>
              <Text size={500} weight="bold">
                {formatCurrency(item.closedWonValue)}
              </Text>
            </div>
          </div>

          <div className={styles.progressBlock}>
            <Caption1>Quota Attainment</Caption1>
            <ProgressBar max={100} value={item.quotaAttainmentPercent} />
            <Text>{item.quotaAttainmentPercent}%</Text>

            <div className={styles.chartBlock}>
              <Caption1>Revenue Line Graph</Caption1>
              <svg
                className={styles.chartSvg}
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                role="img"
                aria-label="Revenue line graph"
              >
                <line
                  className={styles.chartAxis}
                  x1={CHART_PADDING}
                  y1={CHART_HEIGHT - CHART_PADDING}
                  x2={CHART_WIDTH - CHART_PADDING}
                  y2={CHART_HEIGHT - CHART_PADDING}
                />
                <polyline className={styles.chartLine} points={chartPoints} />
                {chartCoordinates.map((point) => (
                  <circle key={point.key} className={styles.chartPoint} cx={point.x} cy={point.y} r={4} />
                ))}
              </svg>
              <div className={styles.chartLabels}>
                <Caption1 className={styles.chartLabel}>Pipeline</Caption1>
                <Caption1 className={styles.chartLabel}>Closed Won</Caption1>
                <Caption1 className={styles.chartLabel}>Total</Caption1>
              </div>
            </div>

            <Caption1>Top Opportunity: {item.topOpportunityName}</Caption1>
          </div>
        </>
      ) : null}
    </SectionCard>
  );
};
