import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { SettingsPageModification } from './SettingsPageModification';
import * as routing from 'src/routing';
import { registerExtensionApiServiceInDI } from 'src/shared/ExtensionApiService';
import { registerRoutingInDI } from 'src/shared/di/routingTokens';

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
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);
    routing.registerRoutingServiceInDI(globalContainer);
    registerRoutingInDI(globalContainer);

    modification = new SettingsPageModification();
    document.body.innerHTML = '';
    vi.mocked(routing.getSettingsTab).mockResolvedValue('swimlanes');
  });

  afterEach(() => {
    modification.clear();
    vi.clearAllMocks();
  });

  describe('shouldApply', () => {
    it('should return true when settings tab is swimlanes', async () => {
      vi.mocked(routing.getSettingsTab).mockResolvedValue('swimlanes');
      expect(await modification.shouldApply()).toBe(true);
    });

    it('should return false when settings tab is not swimlanes', async () => {
      vi.mocked(routing.getSettingsTab).mockResolvedValue('columns');
      expect(await modification.shouldApply()).toBe(false);
    });

    it('should return false when settings tab is null', async () => {
      vi.mocked(routing.getSettingsTab).mockResolvedValue(null);
      expect(await modification.shouldApply()).toBe(false);
    });
  });

  describe('getModificationId', () => {
    it('should return id with swimlane-wip-limits-settings prefix', () => {
      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { href: 'https://jira.example.com/boards/123?rapidView=456', search: '?rapidView=456' },
        writable: true,
      });
      try {
        const id = modification.getModificationId();
        expect(id).toMatch(/^swimlane-wip-limits-settings-/);
      } finally {
        Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
      }
    });
  });
});
