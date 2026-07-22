import * as React from "react";
import {
  Badge,
  Button,
  Caption1,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Building24Regular } from "@fluentui/react-icons";
import type { AccountSummary } from "../types";
import { formatCurrency, formatShortDate } from "../utils/format";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SectionCard } from "./SectionCard";

interface AccountsSectionProps {
  items: AccountSummary[];
  isLoading: boolean;
  errorMessage: string;
  hasMore: boolean;
  onRetry: () => void;
}

const useStyles = makeStyles({
  tableWrap: {
    overflowX: "auto",
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
});

export const AccountsSection: React.FC<AccountsSectionProps> = ({
  items,
  isLoading,
  errorMessage,
  hasMore,
  onRetry,
}) => {
  const styles = useStyles();

  return (
    <SectionCard title="My Accounts" subtitle="Recently active customer accounts" action={<Building24Regular />}>
      {isLoading ? <LoadingSkeleton rows={5} /> : null}

      {!isLoading && errorMessage ? (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Accounts unavailable</MessageBarTitle>
            {errorMessage}
          </MessageBarBody>
        </MessageBar>
      ) : null}

      {!isLoading && !errorMessage && items.length === 0 ? (
        <Caption1 className={styles.muted}>No accounts are assigned to you yet.</Caption1>
      ) : null}

      {!isLoading && !errorMessage && items.length > 0 ? (
        <div className={styles.tableWrap}>
          <Table aria-label="Accounts table" size="small">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Account</TableHeaderCell>
                <TableHeaderCell>City</TableHeaderCell>
                <TableHeaderCell>Revenue</TableHeaderCell>
                <TableHeaderCell>Last Activity</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <TableCellLayout>{account.name}</TableCellLayout>
                  </TableCell>
                  <TableCell>{account.city}</TableCell>
                  <TableCell>{formatCurrency(account.annualRevenue)}</TableCell>
                  <TableCell>{formatShortDate(account.lastActivityUtc)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      {!isLoading && !errorMessage && hasMore ? (
        <Badge appearance="outline" color="warning">
          Additional records available
        </Badge>
      ) : null}

      {!isLoading && errorMessage ? (
        <Button appearance="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </SectionCard>
  );
};
