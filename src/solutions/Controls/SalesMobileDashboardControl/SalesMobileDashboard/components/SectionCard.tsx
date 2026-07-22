import * as React from "react";
import { Card, CardHeader, makeStyles, mergeClasses, tokens, type CardHeaderProps } from "@fluentui/react-components";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: CardHeaderProps["action"];
  children: React.ReactNode;
  className?: string;
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
  body: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
});

export const SectionCard: React.FC<SectionCardProps> = ({ title, subtitle, action, children, className }) => {
  const styles = useStyles();
  const headerProps: CardHeaderProps = {
    header: <span>{title}</span>,
  };

  if (subtitle) {
    headerProps.description = subtitle;
  }

  if (action) {
    headerProps.action = action;
  }

  return (
    <Card className={mergeClasses(styles.card, className)}>
      <CardHeader className={styles.headerRoot} {...headerProps} />
      <div className={styles.body}>{children}</div>
    </Card>
  );
};
