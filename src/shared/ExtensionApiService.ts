/* global browser chrome */

type ExtensionAPI = typeof chrome | typeof browser;

type MessageCallback = (
  request: any,
  sender: { tab?: { id?: number } },
  sendResponse: (response?: any) => void
) => void;

type TabsActivatedCallback = (activeInfo: chrome.tabs.TabActiveInfo) => void;

type ContextMenuCallback = (info: { checked?: boolean }, tab?: { id?: number }) => void;
export interface TabChangeInfo {
  status?: string;
  url?: string;
}

class ExtensionApiService {
  private extensionAPI: ExtensionAPI;

  constructor() {
    if (typeof chrome !== 'undefined') {
      this.extensionAPI = chrome;
    } else if (typeof browser !== 'undefined') {
      this.extensionAPI = browser;
    } else {
      throw new Error('No compatible extension API found');
    }
  }

  isFirefox(): boolean {
    return navigator.userAgent.includes('Firefox');
  }

  getUrl(resource: string): string {
    return this.extensionAPI.runtime.getURL(resource);
  }

  onMessage(cb: MessageCallback): void {
    this.extensionAPI.runtime.onMessage.addListener((request, sender, sendResponse) =>
      cb(request, sender, sendResponse)
    );
  }

  onTabsUpdated(cb: (tabId: number, changeInfo: TabChangeInfo) => any): void {
    this.extensionAPI.tabs.onUpdated.addListener(cb);
  }

  onTabsActivated(cb: TabsActivatedCallback): void {
    this.extensionAPI.tabs.onActivated.addListener(cb);
  }

  async checkTabURLByPattern(tabId: number, regexp: RegExp): Promise<{ result: boolean; url: string }> {
    const tab = await this.extensionAPI.tabs.get(tabId);
    const result = regexp.test(tab.url || '');
    return { result, url: tab.url || '' };
  }

  sendMessageToTab(tabId: number, message: any, response?: (res: any) => void): Promise<void> {
    if (/chrome:\/\//gim.test(`${message?.url}`)) {
      return Promise.resolve();
    }
    if (!response) {
      throw new Error('Response callback for sendMessageToTab is required!');
    }
    return this.extensionAPI.tabs.sendMessage(tabId, message).then(response);
  }

  removeAllContextMenus(cb?: () => void): void {
    this.extensionAPI.contextMenus.removeAll(cb);
  }

  addContextMenuListener(cb: ContextMenuCallback): void {
    this.extensionAPI.contextMenus.onClicked.addListener(cb);
  }

  createContextMenu(config: {
    title: string;
    type: 'checkbox';
    id: string;
    checked: boolean;
    contexts: 'page'[];
  }): void {
    this.extensionAPI.contextMenus.create(config);
  }
}

export const extensionApiService = new ExtensionApiService();
