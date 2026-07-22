import * as React from "react";
import {
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Persona,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { Add24Regular } from "@fluentui/react-icons";
import { SectionCard } from "./SectionCard";

interface QuickActionsSectionProps {
  onCreateAccount: () => Promise<void>;
  onCreateOpportunity: () => Promise<void>;
  onCreateAppointment: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  note: string;
  action: () => Promise<void>;
}

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalS,
    "@media screen and (max-width: 420px)": {
      gap: tokens.spacingHorizontalXS,
    },
  },
  tile: {
    width: "100%",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusXLarge,
    background: `linear-gradient(180deg, ${tokens.colorNeutralBackground1} 0%, ${tokens.colorNeutralBackground3} 100%)`,
    padding: tokens.spacingHorizontalM,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: tokens.shadow2,
    opacity: 1,
    "@media screen and (max-width: 420px)": {
      padding: tokens.spacingHorizontalS,
      gap: tokens.spacingHorizontalXS,
    },
  },
  tileHover: {
    backgroundColor: tokens.colorNeutralBackground2,
    boxShadow: tokens.shadow8,
  },
  tileDisabled: {
    cursor: "default",
    opacity: 0.72,
  },
  tilePersona: {
    flex: 1,
    minWidth: 0,
  },
  tileChevron: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase400,
    flexShrink: 0,
  },
});

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onCreateAccount,
  onCreateOpportunity,
  onCreateAppointment,
  onRefresh,
}) => {
  const styles = useStyles();
  const [actionError, setActionError] = React.useState<string>("");
  const [activeActionId, setActiveActionId] = React.useState<string>("");
  const [hoveredActionId, setHoveredActionId] = React.useState<string>("");

  const actions = React.useMemo<QuickActionItem[]>(() => [
    {
      id: "account",
      title: "New Account",
      description: "Create a customer record from the field.",
      note: "Account intake",
      action: onCreateAccount,
    },
    {
      id: "opportunity",
      title: "New Opportunity",
      description: "Capture pipeline while the conversation is fresh.",
      note: "Pipeline update",
      action: onCreateOpportunity,
    },
    {
      id: "appointment",
      title: "New Appointment",
      description: "Book the next seller touchpoint immediately.",
      note: "Follow-up planning",
      action: onCreateAppointment,
    },
    {
      id: "refresh",
      title: "Refresh Dashboard",
      description: "Pull the latest activities, accounts, and revenue.",
      note: "Live sync",
      action: onRefresh,
    },
  ], [onCreateAccount, onCreateAppointment, onCreateOpportunity, onRefresh]);

  const runAction = React.useCallback(async (actionId: string, action: () => Promise<void>): Promise<void> => {
    try {
      setActionError("");
      setActiveActionId(actionId);
      await action();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to complete action.");
    } finally {
      setActiveActionId("");
    }
  }, []);

  return (
    <SectionCard title="Quick Actions" subtitle="Common tasks for mobile sellers" action={<Add24Regular />}>
      {actionError ? (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Action failed</MessageBarTitle>
            {actionError}
          </MessageBarBody>
        </MessageBar>
      ) : null}

      <div className={styles.grid}>
        {actions.map((item) => {
          const isActive = activeActionId === item.id;
          const isHovered = hoveredActionId === item.id;
          const isDisabled = Boolean(activeActionId);

          return (
            <button
              key={item.id}
              className={mergeClasses(
                styles.tile,
                isHovered && !isDisabled ? styles.tileHover : undefined,
                isDisabled ? styles.tileDisabled : undefined
              )}
              type="button"
              disabled={isDisabled}
              onMouseEnter={() => setHoveredActionId(item.id)}
              onMouseLeave={() => setHoveredActionId("")}
              onClick={() => void runAction(item.id, item.action)}
            >
              <Persona
                className={styles.tilePersona}
                name={item.title}
                //secondaryText={isActive ? "Opening..." : item.description}
                //tertiaryText={item.note}
                size="large"
                avatar={{
                  style: {
                    //display: "none",
                    opacity: 0,
                    width: 0,
                    height: 0,
                  },
                }}
              />
              <span aria-hidden="true" className={styles.tileChevron}>
                ›
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
};
