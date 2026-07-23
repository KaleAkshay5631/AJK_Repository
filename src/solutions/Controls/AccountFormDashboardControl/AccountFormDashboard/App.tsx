import * as React from "react";
import type { IInputs } from "./generated/ManifestTypes";
import { useDashboardData } from "./hooks/useDashboardData";
import { DataverseService } from "./services/DataverseService";
import { DashboardShell } from "./components/DashboardShell";

interface AppProps {
  context: ComponentFramework.Context<IInputs>;
}

const DEFAULT_ACTIVITY_LIMIT = 6;

const getWholeNumberInput = (value: number | null | undefined, fallback: number): number => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
};

export const App: React.FC<AppProps> = ({ context }) => {
  const activityLimit = getWholeNumberInput(context.parameters.activityLimit.raw, DEFAULT_ACTIVITY_LIMIT);
  const modeWithContext = context.mode as ComponentFramework.Mode & {
    contextInfo?: {
      entityTypeName?: string;
      entityId?: string;
    };
  };
  const entityName = modeWithContext.contextInfo?.entityTypeName ?? "";
  const accountId = (modeWithContext.contextInfo?.entityId ?? "").replace(/[{}]/g, "");

  const service = React.useMemo(() => new DataverseService(context), [context]);
  const { state, reload } = useDashboardData(service, accountId, activityLimit);

  const isSupported = entityName === "account" && accountId.length > 0;

  return (
    <DashboardShell
      entityName={entityName}
      isSupported={isSupported}
      state={state}
      onRefresh={reload}
    />
  );
};
