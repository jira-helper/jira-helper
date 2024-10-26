/* global browser chrome */

class ExtensionApiService {
  constructor() {
    if (typeof chrome !== 'undefined') {
      this.extensionAPI = chrome;
    }

    if (!this.extensionAPI && typeof browser !== 'undefined') {
      this.extensionAPI = browser;
    }
  }

  isFirefox() {
    return navigator.userAgent.includes('Firefox');
  }

  getUrl(resource) {
    return this.extensionAPI.runtime.getURL(resource);
  }

  onMessage(cb) {
    return this.extensionAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
      return cb(request, sender, sendResponse);
    });
  }

  onTabsUpdated(cb) {
    return this.extensionAPI.tabs.onUpdated.addListener(cb);
  }

  onTabsActivated(cb) {
    return this.extensionAPI.tabs.onActivated.addListener(cb);
  }

  tabsQuery(options, cb) {
    return this.extensionAPI.tabs.query(options, cb);
  }

  getTab(tabId) {
    return this.extensionAPI.tabs.get(tabId);
  }

  async checkTabURLByPattern(tabId, regexp) {
    const tab = await this.extensionAPI.tabs.get(tabId);
    // eslint-disable-next-line no-new-wrappers
    const result = new Boolean(regexp.test(tab.url));
    result.url = tab.url;
    return result;
  }

  tabsExecuteScript(tabId, details) {
    return this.extensionAPI.tabs.executeScript(tabId, details);
  }

  sendMessageToTab(tabId, message, response) {
    if (/chrome:\/\//gim.test(`${message?.url}`)) {
      return Promise.resolve();
    }
    if (response == null) {
      throw new Error('Response for sendMessageToTab is must!');
    }
    return this.extensionAPI.tabs.sendMessage(tabId, message).then(response);
  }

  reload() {
    this.extensionAPI.runtime.reload();
  }

  bgRequest(action) {
    return new Promise(resolve => {
      this.extensionAPI.runtime.sendMessage(action, response => {
        resolve(response);
      });
    });
  }

  updateStorageValue(key, value) {
    return new Promise(resolve => {
      this.extensionAPI.storage.local.set({ [key]: value }, () => resolve());
    });
  }

  fetchStorageValueByKey(key) {
    return new Promise((resolve, reject) => {
      this.extensionAPI.storage.local.get([key], result =>
        result[key] ? resolve(result[key]) : reject(Error('Not found the key in the storage of browser'))
      );
    });
  }

  removeAllContextMenus(cb) {
    return this.extensionAPI.contextMenus.removeAll(cb);
  }

  addContextMenuListener(cb) {
    return this.extensionAPI.contextMenus.onClicked.addListener(cb);
  }

  createContextMenu(config) {
    return this.extensionAPI.contextMenus.create(config);
  }
}

export const extensionApiService = new ExtensionApiService();
