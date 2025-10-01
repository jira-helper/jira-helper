import { types } from './actions';
import { extensionApiService } from '../shared/ExtensionApiService';

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

export const createContextMenu = (tabId: number) => {
  extensionApiService.removeAllContextMenus(async () => {
    extensionApiService.sendMessageToTab(tabId, { getBlurSensitive: true }, (response: Response) => {
      if (response && Object.prototype.hasOwnProperty.call(response, 'blurSensitive')) {
        createContextMenuItem(response.blurSensitive!);
      }
    });
  });
};

extensionApiService.onMessage(async (request: any, { tab }: { tab?: { id?: number } }) => {
  if (!request.message) return;
  const { message } = request;
  if (typeof message !== 'string') return;

  if (message === 'jira-helper-inited') {
    if (!tab || !tab.id) return;
    createContextMenu(tab.id);
  }
});
