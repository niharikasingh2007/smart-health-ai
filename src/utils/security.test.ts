import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateSecurePin, maskPhoneNumber, logSecurityEvent, getSecurityAuditLog } from './security';

describe('Security & Governance Suite', () => {
  it('sanitizes malicious script and HTML tags to prevent XSS', () => {
    const rawMalicious = '<script>alert("xss")</script><img src="x" onerror="evil()"/>';
    const sanitized = sanitizeInput(rawMalicious);
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
    expect(sanitized).not.toContain('onerror="');
  });

  it('validates secure PIN format (4 to 6 numeric digits only)', () => {
    expect(validateSecurePin('8419')).toBe(true);
    expect(validateSecurePin('123456')).toBe(true);
    expect(validateSecurePin('12')).toBe(false);
    expect(validateSecurePin('84a9')).toBe(false);
    expect(validateSecurePin('!@#$')).toBe(false);
  });

  it('masks phone numbers for operator PII protection', () => {
    const masked = maskPhoneNumber('+91 98201 44211');
    expect(masked).toBe('+91 982 •••••');
    expect(masked).not.toContain('44211');
  });

  it('generates immutable cryptographic audit stamps', async () => {
    const record = await logSecurityEvent('AUTHORIZE_DISPATCH', 'Dr. Rajesh Sharma', 'TR-904 ARV 20 Vials');
    expect(record.status).toBe('SUCCESS');
    expect(record.digest.length).toBeGreaterThan(0);
    const logs = getSecurityAuditLog();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe('AUTHORIZE_DISPATCH');
  });
});
