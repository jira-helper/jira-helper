import { Container } from 'dioma';
import type { IExtensionApiService } from '../shared/ExtensionApiService';
import type { IBlurSensitiveFeature } from './IBlurSensitiveFeature';
import { extensionApiServiceToken } from '../shared/ExtensionApiService';
import { blurSensitiveFeatureToken } from './tokens';
import './blurSensitive.css';

type MessageRequest = { blurSensitive?: boolean; getBlurSensitive?: boolean };
type MessageResponse = { blurSensitive: boolean };

export class BlurSensitiveFeature implements IBlurSensitiveFeature {
  constructor(private extensionApi: IExtensionApiService) {}

  private setBlurSensitive(isBlur: boolean): void {
    const html = document.getElementsByTagName('html')[0];
    if (isBlur) {
      html.classList.add('jh-blur');
    } else {
      html.classList.remove('jh-blur');
    }
  }

  private changeBlurSensitive(isBlur: boolean, sendResponse: (response: MessageResponse) => void): void {
    localStorage.setItem('blurSensitive', String(isBlur));
    this.setBlurSensitive(isBlur);
    sendResponse({ blurSensitive: isBlur });
  }

  init(): void {
    this.extensionApi.onMessage(
      (request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
        if (!sender.tab && typeof request.blurSensitive === 'boolean') {
          this.changeBlurSensitive(request.blurSensitive, sendResponse);
        }
      }
    );

    this.extensionApi.onMessage(
      (request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
        if (!sender.tab && typeof request.getBlurSensitive === 'boolean') {
          sendResponse({ blurSensitive: localStorage.getItem('blurSensitive') === 'true' });
        }
      }
    );
  }

  setUpOnPage(): void {
    const isBlur = localStorage.getItem('blurSensitive') === 'true';
    this.setBlurSensitive(isBlur);
  }
}

export const registerBlurSensitiveFeatureInDI = (container: Container) => {
  const extensionApi = container.inject(extensionApiServiceToken);
  container.register({
    token: blurSensitiveFeatureToken,
    value: new BlurSensitiveFeature(extensionApi),
  });
};
