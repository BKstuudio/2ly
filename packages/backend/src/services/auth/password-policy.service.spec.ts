import { describe, it, expect, beforeEach } from 'vitest';
import { PasswordPolicyService } from './password-policy.service';

describe('PasswordPolicyService', () => {
  let service: PasswordPolicyService;

  beforeEach(() => {
    service = new PasswordPolicyService();
  });

  describe('Password Validation', () => {
    it('should accept passwords with 8+ characters', () => {
      const result = service.validatePassword('password123');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords with less than 8 characters', () => {
      const result = service.validatePassword('short');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject empty passwords', () => {
      const result = service.validatePassword('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject null/undefined passwords', () => {
      const result = service.validatePassword(null as unknown as string);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });
  });

  describe('Policy Configuration', () => {
    it('should return simple policy configuration', () => {
      const config = service.getPolicyConfig();

      expect(config.minLength).toBe(8);
    });
  });

  describe('Password Generation', () => {
    it('should generate passwords of default length', () => {
      const result = service.generateSecurePassword();

      expect(result.password).toBeDefined();
      expect(result.password.length).toBe(12);
    });

    it('should generate passwords of specified length', () => {
      const result = service.generateSecurePassword(16);

      expect(result.password).toBeDefined();
      expect(result.password.length).toBe(16);
    });

    it('should generate different passwords each time', () => {
      const result1 = service.generateSecurePassword();
      const result2 = service.generateSecurePassword();

      expect(result1.password).not.toBe(result2.password);
    });
  });
});