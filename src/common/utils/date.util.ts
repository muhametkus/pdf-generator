/**
 * Formats an ISO date string or Date object to Turkish date format (DD.MM.YYYY).
 *
 * @param dateInput - ISO string, timestamp or Date instance.
 * @returns Formatted date string (e.g. 05.09.2026).
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    return '-';
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) {
    return '-';
  }

  // Format to Europe/Istanbul timezone with day, month, year as 2-digit numbers
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}
