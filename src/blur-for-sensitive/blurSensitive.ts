import { extensionApiService } from '../shared/ExtensionApiService';
import './blurSensitive.css';

type MessageRequest = { blurSensitive?: boolean; getBlurSensitive?: boolean };
type MessageResponse = { blurSensitive: boolean };

// Изменение размытия
const setBlurSensitive = (isBlur: boolean): void => {
  const html = document.getElementsByTagName('html')[0];
  if (isBlur) {
    html.classList.add('jh-blur');
  } else {
    html.classList.remove('jh-blur');
  }
};

const changeBlurSensitive = (isBlur: boolean, sendResponse: (response: MessageResponse) => void): void => {
  localStorage.setItem('blurSensitive', String(isBlur));
  setBlurSensitive(isBlur);
  sendResponse({ blurSensitive: isBlur });
};

export const setUpBlurSensitiveOnPage = (): void => {
  const isBlur = localStorage.getItem('blurSensitive') === 'true';
  setBlurSensitive(isBlur);
};

export const initBlurSensitive = (): void => {
  extensionApiService.onMessage(
    (request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
      if (!sender.tab && typeof request.blurSensitive === 'boolean') {
        changeBlurSensitive(request.blurSensitive, sendResponse);
      }
    }
  );

  extensionApiService.onMessage(
    (request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
      if (!sender.tab && typeof request.getBlurSensitive === 'boolean') {
        sendResponse({ blurSensitive: localStorage.getItem('blurSensitive') === 'true' });
      }
    }
  );
};
