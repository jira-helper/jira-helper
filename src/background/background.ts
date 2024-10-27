import { types } from './actions';
import { extensionApiService, TabChangeInfo } from '../shared/ExtensionApiService';

const regexpBoardUrl = /rapidView=(\d*)/im;
const regexpBoardSettingsTabUrl = /tab=/im;
const regexpChartControlChart = /chart=controlChart/im;

interface Response {
  message?: string;
  blurSensitive?: boolean;
}

// ОБРАБОТКА ТАБОВ
extensionApiService.onTabsUpdated(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    const isScopeControlChart = await extensionApiService.checkTabURLByPattern(tabId, regexpChartControlChart);
    if (isScopeControlChart) {
      extensionApiService.sendMessageToTab(
        tabId,
        {
          type: types.TAB_URL_CHANGE,
          url: isScopeControlChart.url,
        },
        (response: Response) => {
          // eslint-disable-next-line no-console
          console.log(response?.message);
        }
      );
    }
  }

  if (changeInfo.url == null) return;
  if (regexpBoardUrl.test(changeInfo.url) && regexpBoardSettingsTabUrl.test(changeInfo.url)) {
    extensionApiService.sendMessageToTab(
      tabId,
      {
        type: types.TAB_URL_CHANGE,
        url: changeInfo.url,
      },
      (response: Response) => {
        // eslint-disable-next-line no-console
        console.log(response?.message);
      }
    );
  }
});

extensionApiService.addContextMenuListener(async (info, tab) => {
  if (!tab || !tab.id) {
    return;
  }
  const isScope = await extensionApiService.checkTabURLByPattern(tab.id, regexpBoardUrl);
  if (isScope) {
    extensionApiService.sendMessageToTab(tab.id, { blurSensitive: info.checked }, (response: Response) => {
      // eslint-disable-next-line no-console
      console.log(info.checked ? 'added the blur of data' : 'removed the blur of data', response);
    });
  }
});

const createContextMenuItem = (isBlurSensitive: boolean) => {
  extensionApiService.createContextMenu({
    title: 'Blur secret data',
    type: 'checkbox',
    id: 'checkbox',
    checked: isBlurSensitive,
    contexts: ['page'],
  });
};

export const createContextMenu = (tabId: number, changeInfo?: TabChangeInfo) => {
  extensionApiService.removeAllContextMenus(async () => {
    const isScope = await extensionApiService.checkTabURLByPattern(tabId, regexpBoardUrl);
    if (!isScope || changeInfo == null || changeInfo.status !== 'complete') {
      return;
    }
    extensionApiService.sendMessageToTab(tabId, { getBlurSensitive: true }, (response: Response) => {
      if (response && Object.prototype.hasOwnProperty.call(response, 'blurSensitive')) {
        createContextMenuItem(response.blurSensitive!);
      }
    });
  });
};

extensionApiService.onTabsUpdated((tabId, changeInfo) => {
  createContextMenu(tabId, changeInfo);
});

extensionApiService.onTabsActivated(async (activeInfo: { tabId: number }) => {
  createContextMenu(activeInfo.tabId);
});
