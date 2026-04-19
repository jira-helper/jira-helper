import { Container, Token } from 'dioma';
import { ExtensionApiService } from './ExtensionApiService';

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

export type ContextMenuConfig = {
  title: string;
  type: 'checkbox';
  id: string;
  checked: boolean;
  contexts: 'page'[];
  documentUrlPatterns?: string[];
};

export interface IExtensionApiService {
  isFirefox(): boolean;
  getUrl(resource: string): string;
  onMessage(cb: MessageCallback): void;
  onTabsUpdated(cb: (tabId: number, changeInfo: TabChangeInfo) => any): void;
  onTabsActivated(cb: TabsActivatedCallback): void;
  checkTabURLByPattern(tabId: number, regexp: RegExp): Promise<{ result: boolean; url: string }>;
  sendMessageToTab(tabId: number, message: any, response?: (res: any) => void): Promise<void>;
  removeAllContextMenus(cb?: () => void): void;
  addContextMenuListener(cb: ContextMenuCallback): void;
  createContextMenu(config: ContextMenuConfig): void;
  sendMessage(payload: { message: string }): Promise<void>;
}

export const extensionApiServiceToken = new Token<IExtensionApiService>('extensionApiService');

export const registerExtensionApiServiceInDI = (container: Container) => {
  container.register({ token: extensionApiServiceToken, value: new ExtensionApiService() });
};
