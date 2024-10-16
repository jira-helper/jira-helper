import { extensionApiService } from '../shared/ExtensionApiService';
import './blurSensitive.css';

// change blur
/* eslint-disable */
const setBlurSensitive = isBlur => {
  const html = document.getElementsByTagName('html')[0];
  if (isBlur) html.classList.add('blur');
  else html.classList.remove('blur');
};
/* eslint-enable */

const changeBlurSensitive = (isBlur, sendResponse) => {
  localStorage.setItem('blurSensitive', isBlur);
  setBlurSensitive(isBlur);
  sendResponse({ blurSensitive: isBlur });
};

export const setUpBlurSensitiveOnPage = () => {
  const isBlur = localStorage.getItem('blurSensitive') === 'true';
  setBlurSensitive(!!isBlur);
};

export const initBlurSensitive = () => {
  extensionApiService.onMessage((request, sender, sendResponse) => {
    if (!sender.tab && typeof request.blurSensitive === 'boolean') {
      changeBlurSensitive(request.blurSensitive, sendResponse);
    }
  });

  extensionApiService.onMessage((request, sender, sendResponse) => {
    if (!sender.tab && typeof request.getBlurSensitive === 'boolean') {
      sendResponse({ blurSensitive: localStorage.getItem('blurSensitive') === 'true' });
    }
  });
};
