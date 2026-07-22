import * as React from "react";
import {
  Badge,
  Button,
  Caption1,
  Divider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { CalendarLtr24Regular } from "@fluentui/react-icons";
import type { Appointment } from "../types";
import { formatShortDateTime } from "../utils/format";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface AppointmentsSectionProps {
  items: Appointment[];
  isLoading: boolean;
  errorMessage: string;
  hasMore: boolean;
  onRetry: () => void;
}

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
  },
  empty: {
    color: tokens.colorNeutralForeground3,
  },
});

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({
  items,
  isLoading,
  errorMessage,
  hasMore,
  onRetry,
}) => {
  const styles = useStyles();

  return (
    <SectionCard
      title="Today's Appointments"
      subtitle="Upcoming meetings for your sales activities"
      action={<CalendarLtr24Regular />}
    >
      {isLoading ? <LoadingSkeleton rows={4} /> : null}

      {!isLoading && errorMessage ? (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Appointments unavailable</MessageBarTitle>
            {errorMessage}
          </MessageBarBody>
        </MessageBar>
      ) : null}

      {!isLoading && !errorMessage && items.length === 0 ? (
        <Caption1 className={styles.empty}>No appointments found for the selected timeframe.</Caption1>
      ) : null}

      {!isLoading && !errorMessage && items.length > 0 ? (
        <div className={styles.list}>
          {items.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className={styles.row}>
                <div className={styles.details}>
                  <Text weight="semibold">{item.subject}</Text>
                  <Caption1>{formatShortDateTime(item.startUtc)}</Caption1>
                  <Caption1>{item.regardingName}</Caption1>
                </div>
                <Badge appearance="filled" color="informative">
                  {formatShortDateTime(item.startUtc)}
                </Badge>
              </div>
              {index < items.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))}

          {hasMore ? <Caption1>More appointments are available. Refine filters to narrow the list.</Caption1> : null}
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <Button appearance="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </SectionCard>
  );
};
