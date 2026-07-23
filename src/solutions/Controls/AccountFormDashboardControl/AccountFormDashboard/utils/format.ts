export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatShortDateTime = (isoUtc: string): string => {
  if (!isoUtc) {
    return "Not scheduled";
  }

  const date = new Date(isoUtc);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const formatShortDate = (isoUtc: string): string => {
  if (!isoUtc) {
    return "No activity";
  }

  const date = new Date(isoUtc);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatPhone = (phone: string): string => {
  return phone && phone !== "Not set" ? phone : "Not set";
};

export const formatDaysSince = (days: number | null): string => {
  if (days === null) {
    return "No activity";
  }

  if (days === 0) {
    return "Today";
  }

  return `${days}d ago`;
};
