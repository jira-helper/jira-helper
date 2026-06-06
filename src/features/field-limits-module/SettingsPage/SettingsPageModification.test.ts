import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { SettingsPageModification } from './SettingsPageModification';
import { routingServiceToken, type IRoutingService } from 'src/infrastructure/routing';
import {
  settingsPagePageObjectToken,
  type ISettingsPagePageObject,
} from 'src/infrastructure/page-objects/SettingsPage';
import { registerExtensionApiServiceInDI } from 'src/infrastructure/extension-api/ExtensionApiService';
import { registerRoutingInDI } from 'src/infrastructure/di/routingTokens';

describe('SettingsPageModification', () => {
  let modification: SettingsPageModification;
  let mockRoutingService: { getSearchParam: ReturnType<typeof vi.fn>; getBoardIdFromURL: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);

    mockRoutingService = {
      getSearchParam: vi.fn().mockReturnValue(null),
      getBoardIdFromURL: vi.fn().mockReturnValue(null),
    };
    globalContainer.register({
      token: routingServiceToken,
      value: mockRoutingService as unknown as IRoutingService,
    });

    globalContainer.register({
      token: settingsPagePageObjectToken,
      value: {
        selectors: { settingsContent: '#main', selectedNav: '.aui-nav-selected' },
        getSelectedTab: vi.fn().mockReturnValue(null),
      } as unknown as ISettingsPagePageObject,
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
      mockRoutingService.getSearchParam.mockImplementation((param: string) =>
        param === 'config' ? 'cardLayout' : null
      );
      expect(await modification.shouldApply()).toBe(true);
    });

    it('should return false when settings tab is not cardLayout', async () => {
      mockRoutingService.getSearchParam.mockImplementation((param: string) => (param === 'config' ? 'columns' : null));
      expect(await modification.shouldApply()).toBe(false);
    });

    it('should return false when settings tab is null and DOM has no selected nav', async () => {
      mockRoutingService.getSearchParam.mockReturnValue(null);
      document.body.innerHTML = '<nav class="aui-nav-selected" data-tabitem="other"></nav>';
      (globalContainer.inject(settingsPagePageObjectToken).getSelectedTab as ReturnType<typeof vi.fn>).mockReturnValue(
        'other'
      );
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
