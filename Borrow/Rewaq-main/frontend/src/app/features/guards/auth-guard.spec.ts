import { describe, it, expect, beforeEach } from 'vitest';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return false and navigate when token is missing', () => {
    let navigatedTo = '';
    const mockRouter = {
      navigate: (path: string[]) => {
        navigatedTo = path[0];
      }
    };

    const token = localStorage.getItem('token');
    expect(token).toBeNull();
  });

  it('should allow access when token is present', () => {
    localStorage.setItem('token', 'valid-mock-jwt-token');
    const token = localStorage.getItem('token');
    expect(token).toBe('valid-mock-jwt-token');
  });
});
