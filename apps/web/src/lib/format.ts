export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount);

export const formatDateTime = (value: string | null): string => {
  if (!value) {
    return 'Not set';
  }

  // Keep local datetime text stable (no timezone shift) for user-entered values.
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.replace('T', ' ').slice(0, 16);
  }

  // SQLite CURRENT_TIMESTAMP format: YYYY-MM-DD HH:mm:ss (stored as UTC).
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return `${value.slice(0, 16)} UTC`;
  }

  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(asDate);
};
