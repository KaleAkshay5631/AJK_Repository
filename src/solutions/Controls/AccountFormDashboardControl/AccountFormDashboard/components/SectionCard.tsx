import * as React from "react";
import { Button, Card, CardHeader, makeStyles, mergeClasses, tokens, type CardHeaderProps } from "@fluentui/react-components";
import { ChevronDown20Regular, ChevronRight20Regular } from "@fluentui/react-icons";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const useStyles = makeStyles({
  card: {
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow8,
    background: `linear-gradient(180deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground2} 100%)`,
    width: "100%",
  },
  headerRoot: {
    paddingBottom: tokens.spacingVerticalS,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
});

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  isExpanded = true,
  onToggleExpand,
}) => {
  const styles = useStyles();
  const toggleButton = onToggleExpand ? (
    <Button
      aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
      aria-expanded={isExpanded}
      size="small"
      appearance="subtle"
      icon={isExpanded ? <ChevronDown20Regular /> : <ChevronRight20Regular />}
      onClick={onToggleExpand}
    />
  ) : null;

  const headerProps: CardHeaderProps = {
    header: <span>{title}</span>,
  };

  if (subtitle) {
    headerProps.description = subtitle;
  }

  if (action || toggleButton) {
    headerProps.action = (
      <div className={styles.headerActions}>
        {action}
        {toggleButton}
      </div>
    );
  }

  return (
    <Card className={mergeClasses(styles.card, className)}>
      <CardHeader className={styles.headerRoot} {...headerProps} />
      {isExpanded ? <div className={styles.body}>{children}</div> : null}
    </Card>
  );
};
