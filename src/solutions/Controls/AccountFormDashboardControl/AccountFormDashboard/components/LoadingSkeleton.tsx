import * as React from "react";
import { Skeleton, SkeletonItem, makeStyles, tokens } from "@fluentui/react-components";

interface LoadingSkeletonProps {
  rows?: number;
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
});

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3 }) => {
  const styles = useStyles();

  return (
    <Skeleton aria-label="Loading section content" className={styles.root}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonItem key={index} shape="rectangle" size={24} />
      ))}
    </Skeleton>
  );
};
