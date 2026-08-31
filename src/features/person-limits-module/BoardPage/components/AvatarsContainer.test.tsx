import { describe, expect, it, vi } from 'vitest';
import { getAvatarUrlForPerson } from './AvatarsContainer';

describe('getAvatarUrlForPerson', () => {
  it('uses the saved avatar URL when the person has one', () => {
    const buildAvatarUrl = vi.fn((name: string) => `/avatar/${name}`);

    const url = getAvatarUrlForPerson(
      { name: '712020:account-id', displayName: 'xCredo', avatar: 'https://avatar.example/xcredo.png' },
      'cloud',
      buildAvatarUrl
    );

    expect(url).toBe('https://avatar.example/xcredo.png');
    expect(buildAvatarUrl).not.toHaveBeenCalled();
  });

  it('uses displayName for Cloud fallback so account IDs are not used as avatar usernames', () => {
    const buildAvatarUrl = vi.fn((name: string) => `/avatar/${name}`);

    const url = getAvatarUrlForPerson({ name: '712020:account-id', displayName: 'xCredo' }, 'cloud', buildAvatarUrl);

    expect(url).toBe('/avatar/xCredo');
    expect(buildAvatarUrl).toHaveBeenCalledWith('xCredo');
  });

  it('keeps server fallback based on the login name', () => {
    const buildAvatarUrl = vi.fn((name: string) => `/avatar/${name}`);

    const url = getAvatarUrlForPerson({ name: 'john.doe', displayName: 'John Doe' }, 'server', buildAvatarUrl);

    expect(url).toBe('/avatar/john.doe');
    expect(buildAvatarUrl).toHaveBeenCalledWith('john.doe');
  });
});
