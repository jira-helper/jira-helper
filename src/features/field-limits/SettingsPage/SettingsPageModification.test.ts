import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SettingsPageModification } from './SettingsPageModification';
import * as routing from 'src/routing';

vi.mock('src/routing', async importOriginal => {
  const original = await importOriginal<typeof routing>();
  return {
    ...original,
    getSettingsTab: vi.fn(),
  };
});

describe('SettingsPageModification', () => {
  let modification: SettingsPageModification;

  beforeEach(() => {
    modification = new SettingsPageModification();
    document.body.innerHTML = '';
    vi.mocked(routing.getSettingsTab).mockResolvedValue('cardLayout');
  });

  afterEach(() => {
    modification.clear();
    vi.clearAllMocks();
  });

  describe('shouldApply', () => {
    it('should return true when settings tab is cardLayout', async () => {
      vi.mocked(routing.getSettingsTab).mockResolvedValue('cardLayout');
      expect(await modification.shouldApply()).toBe(true);
    });

    it('should return false when settings tab is not cardLayout', async () => {
      vi.mocked(routing.getSettingsTab).mockResolvedValue('columns');
      expect(await modification.shouldApply()).toBe(false);
    });

    it('should return false when settings tab is null', async () => {
      vi.mocked(routing.getSettingsTab).mockResolvedValue(null);
      expect(await modification.shouldApply()).toBe(false);
    });
  });

  describe('getModificationId', () => {
    it('should return id with field-limits-settings prefix', () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { href: 'https://jira.example.com/boards/123?rapidView=456', search: '?rapidView=456' },
        writable: true,
      });
      try {
        const id = modification.getModificationId();
        expect(id).toMatch(/^field-limits-settings-/);
      } finally {
        Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
      }
    });
  });
});
