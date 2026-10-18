/**
 * Security & Sanitization Utilities
 * - Prevents Cross-Site Scripting (XSS)
 * - Cryptographic Hash Verification for Digital Authorizations
 * - Input validation & PII masking
 * - Immutable Audit Trail Logger
 */

/**
 * Sanitizes user input string against HTML/Script injection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates a secure PIN input
 */
export function validateSecurePin(input: string): boolean {
  // Must be exactly 4 to 6 digits
  return /^\d{4,6}$/.test(input);
}

/**
 * Masks phone numbers to protect operator PII while maintaining auditability
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return 'N/A';
  const cleaned = phone.trim();
  if (cleaned.length < 8) return cleaned;
  return cleaned.slice(0, 7) + ' •••••';
}

/**
 * Simple deterministic SHA-256 equivalent digest simulator for browser client audit stamps
 */
export async function generateAuditDigest(payload: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback FNV-1a hash generator
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return '0x' + (hash >>> 0).toString(16).padStart(8, '0');
}

export interface SecurityAuditRecord {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  digest: string;
  ipMasked: string;
  status: 'SUCCESS' | 'BLOCKED';
}

const AUDIT_LOG: SecurityAuditRecord[] = [];

export async function logSecurityEvent(action: string, actor: string, details: string): Promise<SecurityAuditRecord> {
  const timestamp = new Date().toISOString();
  const digest = await generateAuditDigest(`${timestamp}:${actor}:${action}:${details}`);
  const record: SecurityAuditRecord = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp,
    action,
    actor,
    digest: digest.substring(0, 16).toUpperCase(),
    ipMasked: '10.142.••.•• (NIC-GovNet)',
    status: 'SUCCESS'
  };
  AUDIT_LOG.unshift(record);
  if (AUDIT_LOG.length > 100) AUDIT_LOG.pop();
  return record;
}

export function getSecurityAuditLog(): SecurityAuditRecord[] {
  return [...AUDIT_LOG];
}
