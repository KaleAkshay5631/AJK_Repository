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
