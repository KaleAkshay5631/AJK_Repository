import * as React from "react";
import { Body1, Body1Strong, Button, Caption1, makeStyles, tokens } from "@fluentui/react-components";
import { ArrowClockwise20Regular } from "@fluentui/react-icons";
import type { RecentActivity } from "../types";
import { formatShortDateTime } from "../utils/format";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface RecentActivitiesSectionProps {
  activities: RecentActivity[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  item: {
    backgroundColor: "#ffffff",
    border: "1px solid #d9e6f4",
    borderRadius: tokens.borderRadiusLarge,
    padding: tokens.spacingHorizontalS,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  row: {
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

export const RecentActivitiesSection: React.FC<RecentActivitiesSectionProps> = ({
  activities,
  isLoading,
  onRefresh,
  isExpanded,
  onToggleExpand,
}) => {
  const styles = useStyles();

  return (
    <SectionCard
      title="Recent Activities"
      subtitle="Most recent account interactions"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      action={
        <Button size="small" appearance="subtle" icon={<ArrowClockwise20Regular />} onClick={() => void onRefresh()}>
          Refresh
        </Button>
      }
    >
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : activities.length === 0 ? (
        <Body1>No recent activities available.</Body1>
      ) : (
        <div className={styles.list}>
          {activities.map((activity) => (
            <div key={activity.id} className={styles.item}>
              <div className={styles.row}>
                <Body1Strong>{activity.subject}</Body1Strong>
                <Caption1>{activity.status}</Caption1>
              </div>
              <Body1 className={styles.meta}>
                {activity.activityType} | Due {formatShortDateTime(activity.dueUtc)} | Updated {formatShortDateTime(activity.modifiedOnUtc)}
              </Body1>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
};
