import * as React from "react";
import { Body1, Body1Strong, ProgressBar, makeStyles, tokens } from "@fluentui/react-components";
import type { RelationshipHealth } from "../types";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface RelationshipHealthSectionProps {
  health: RelationshipHealth;
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const useStyles = makeStyles({
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  score: {
    color: "#0d5a92",
  },
  rationale: {
    color: tokens.colorNeutralForeground3,
  },
});

export const RelationshipHealthSection: React.FC<RelationshipHealthSectionProps> = ({
  health,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  const styles = useStyles();

  return (
    <SectionCard
      title="Relationship Health"
      subtitle="Composite score from engagement and support signals"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {isLoading ? (
        <LoadingSkeleton rows={2} />
      ) : (
        <>
          <div className={styles.row}>
            <Body1Strong>Status: {health.status}</Body1Strong>
            <Body1Strong className={styles.score}>{health.score}/100</Body1Strong>
          </div>
          <ProgressBar value={health.score / 100} max={1} />
          <Body1 className={styles.rationale}>{health.rationale}</Body1>
        </>
      )}
    </SectionCard>
  );
};
