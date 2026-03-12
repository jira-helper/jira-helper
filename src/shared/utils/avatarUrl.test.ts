import { describe, it, expect } from 'vitest';
import { buildAvatarUrl } from './avatarUrl';

describe('buildAvatarUrl', () => {
  it('should build URL with username', () => {
    expect(buildAvatarUrl('jsmith')).toBe('/secure/useravatar?username=jsmith');
  });

  it('should encode special characters', () => {
    expect(buildAvatarUrl('john.doe')).toBe('/secure/useravatar?username=john.doe');
    expect(buildAvatarUrl('user@domain')).toBe('/secure/useravatar?username=user%40domain');
    expect(buildAvatarUrl('user name')).toBe('/secure/useravatar?username=user%20name');
  });

  it('should handle unicode characters', () => {
    expect(buildAvatarUrl('user_ñ')).toBe('/secure/useravatar?username=user_%C3%B1');
  });

  it('should handle empty username', () => {
    expect(buildAvatarUrl('')).toBe('/secure/useravatar?username=');
  });
});
