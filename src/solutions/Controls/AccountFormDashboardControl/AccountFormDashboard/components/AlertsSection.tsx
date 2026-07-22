import * as React from "react";
import { MessageBar, MessageBarBody, MessageBarTitle } from "@fluentui/react-components";
import type { AlertItem } from "../types";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface AlertsSectionProps {
  alerts: AlertItem[];
  isLoading: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({
  alerts,
  isLoading,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <SectionCard
      title="Alerts"
      subtitle="Key signals requiring attention"
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      {isLoading ? (
        <LoadingSkeleton rows={3} />
      ) : (
        alerts.map((alert) => (
          <MessageBar key={alert.id} intent={alert.intent}>
            <MessageBarBody>
              <MessageBarTitle>{alert.title}</MessageBarTitle>
              {alert.message}
            </MessageBarBody>
          </MessageBar>
        ))
      )}
    </SectionCard>
  );
};
