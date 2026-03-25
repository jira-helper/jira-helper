import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { SettingsPageModification } from './SettingsPageModification';
import { routingServiceToken, type IRoutingService } from 'src/routing';
import { registerExtensionApiServiceInDI } from 'src/shared/ExtensionApiService';
import { registerRoutingInDI } from 'src/shared/di/routingTokens';

describe('SettingsPageModification', () => {
  let modification: SettingsPageModification;
  let mockRoutingService: { getSettingsTab: ReturnType<typeof vi.fn>; getBoardIdFromURL: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);

    mockRoutingService = {
      getSettingsTab: vi.fn().mockResolvedValue('cardLayout'),
      getBoardIdFromURL: vi.fn().mockReturnValue(null),
    };
    globalContainer.register({
      token: routingServiceToken,
      value: mockRoutingService as unknown as IRoutingService,
    });

    registerRoutingInDI(globalContainer);

    modification = new SettingsPageModification();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    modification.clear();
    vi.clearAllMocks();
  });

  describe('shouldApply', () => {
    it('should return true when settings tab is cardLayout', async () => {
      mockRoutingService.getSettingsTab.mockResolvedValue('cardLayout');
      expect(await modification.shouldApply()).toBe(true);
    });

    it('should return false when settings tab is not cardLayout', async () => {
      mockRoutingService.getSettingsTab.mockResolvedValue('columns');
      expect(await modification.shouldApply()).toBe(false);
    });

    it('should return false when settings tab is null', async () => {
      mockRoutingService.getSettingsTab.mockResolvedValue(null);
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
