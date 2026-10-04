/**
 * Formats a number to Turkish Lira currency format (e.g. 257.000,00 TL).
 *
 * @param amount - The numerical amount to format.
 * @returns Formatted currency string with 'TL' suffix.
 */
export function formatCurrency(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0,00 TL';
  }

  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} TL`;
}
