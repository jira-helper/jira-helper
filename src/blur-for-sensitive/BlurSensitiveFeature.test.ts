import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { IExtensionApiService } from '../shared/ExtensionApiService';
import { BlurSensitiveFeature } from './BlurSensitiveFeature';

describe('BlurSensitiveFeature', () => {
  let onMessageCallbacks: Array<Parameters<IExtensionApiService['onMessage']>[0]>;
  let extensionApi: IExtensionApiService;

  beforeEach(() => {
    onMessageCallbacks = [];
    extensionApi = {
      isFirefox: vi.fn(),
      getUrl: vi.fn(),
      onMessage: vi.fn(cb => {
        onMessageCallbacks.push(cb);
      }),
      onTabsUpdated: vi.fn(),
      onTabsActivated: vi.fn(),
      checkTabURLByPattern: vi.fn(),
      sendMessageToTab: vi.fn(),
      removeAllContextMenus: vi.fn(),
      addContextMenuListener: vi.fn(),
      createContextMenu: vi.fn(),
      sendMessage: vi.fn(),
    };
    localStorage.clear();
    document.documentElement.classList.remove('jh-blur');
  });

  it('init registers two onMessage listeners', () => {
    const feature = new BlurSensitiveFeature(extensionApi);
    feature.init();
    expect(extensionApi.onMessage).toHaveBeenCalledTimes(2);
    expect(onMessageCallbacks).toHaveLength(2);
  });

  it('blurSensitive message updates localStorage, DOM class, and responds', () => {
    const feature = new BlurSensitiveFeature(extensionApi);
    feature.init();
    const blurHandler = onMessageCallbacks[0]!;
    const sendResponse = vi.fn();

    blurHandler({ blurSensitive: true }, { tab: undefined }, sendResponse);

    expect(localStorage.getItem('blurSensitive')).toBe('true');
    expect(document.documentElement.classList.contains('jh-blur')).toBe(true);
    expect(sendResponse).toHaveBeenCalledWith({ blurSensitive: true });
  });

  it('ignores blurSensitive when sender has tab', () => {
    const feature = new BlurSensitiveFeature(extensionApi);
    feature.init();
    const blurHandler = onMessageCallbacks[0]!;
    const sendResponse = vi.fn();

    blurHandler({ blurSensitive: true }, { tab: { id: 1 } }, sendResponse);

    expect(sendResponse).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains('jh-blur')).toBe(false);
  });

  it('getBlurSensitive message responds with stored value', () => {
    localStorage.setItem('blurSensitive', 'true');
    const feature = new BlurSensitiveFeature(extensionApi);
    feature.init();
    const getHandler = onMessageCallbacks[1]!;
    const sendResponse = vi.fn();

    getHandler({ getBlurSensitive: true }, { tab: undefined }, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({ blurSensitive: true });
  });

  it('setUpOnPage applies class from localStorage', () => {
    localStorage.setItem('blurSensitive', 'true');
    const feature = new BlurSensitiveFeature(extensionApi);
    feature.setUpOnPage();
    expect(document.documentElement.classList.contains('jh-blur')).toBe(true);
  });
});
