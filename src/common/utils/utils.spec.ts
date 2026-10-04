import { formatCurrency } from './currency.util';
import { formatDate } from './date.util';

describe('Common Utils', () => {
  describe('formatCurrency', () => {
    it('should format 257000 to "257.000,00 TL"', () => {
      const result = formatCurrency(257000);
      expect(result).toBe('257.000,00 TL');
    });

    it('should format decimals correctly', () => {
      const result = formatCurrency(1234.5);
      expect(result).toBe('1.234,50 TL');
    });

    it('should handle zero and null/undefined values', () => {
      expect(formatCurrency(0)).toBe('0,00 TL');
      expect(formatCurrency(null as any)).toBe('0,00 TL');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date string to DD.MM.YYYY', () => {
      const result = formatDate('2026-09-05T20:45:01.393028Z');
      expect(result).toBe('05.09.2026');
    });

    it('should handle invalid or empty dates gracefully', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate('')).toBe('-');
      expect(formatDate('invalid-date')).toBe('-');
    });
  });
});
