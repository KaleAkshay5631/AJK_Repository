import * as React from "react";
import type { IInputs } from "./generated/ManifestTypes";
import { useDashboardData } from "./hooks/useDashboardData";
import { DataverseService } from "./services/DataverseService";
import { DashboardShell } from "./components/DashboardShell";

interface AppProps {
  context: ComponentFramework.Context<IInputs>;
}

const DEFAULT_RECORD_LIMIT = 8;
const DEFAULT_LOOK_AHEAD_DAYS = 1;

const getWholeNumberInput = (value: number | null | undefined, fallback: number): number => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return fallback;
  }

  return Math.floor(value);
};

export const App: React.FC<AppProps> = ({ context }) => {
  const recordLimit = getWholeNumberInput(context.parameters.recordLimit.raw, DEFAULT_RECORD_LIMIT);
  const lookAheadDays = getWholeNumberInput(context.parameters.lookAheadDays.raw, DEFAULT_LOOK_AHEAD_DAYS);

  const service = React.useMemo(() => new DataverseService(context), [context]);
  const { state, reload } = useDashboardData(service, recordLimit, lookAheadDays);

  const onCreateAccount = React.useCallback(async (): Promise<void> => {
    await context.navigation.openForm({
      entityName: "account",
      useQuickCreateForm: true,
    });
  }, [context.navigation]);

  const onCreateOpportunity = React.useCallback(async (): Promise<void> => {
    await context.navigation.openForm({
      entityName: "opportunity",
      useQuickCreateForm: true,
    });
  }, [context.navigation]);

  const onCreateAppointment = React.useCallback(async (): Promise<void> => {
    await context.navigation.openForm({
      entityName: "appointment",
      useQuickCreateForm: true,
    });
  }, [context.navigation]);

  return (
    <DashboardShell
      state={state}
      onRefresh={reload}
      onCreateAccount={onCreateAccount}
      onCreateOpportunity={onCreateOpportunity}
      onCreateAppointment={onCreateAppointment}
    />
  );
};
