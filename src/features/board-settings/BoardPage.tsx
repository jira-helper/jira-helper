import React from 'react';
import { Token } from 'dioma';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { routingServiceToken } from 'src/infrastructure/routing';
import { createRoot } from 'react-dom/client';
import { PageModification } from '../../infrastructure/page-modification/PageModification';
import { BoardSettingsComponent } from './BoardSettingsComponent';
import { isBoardSettingsVisibleForUrl, resolveBoardSettingsMount } from './resolveBoardSettingsMount';

function getBoardSettingsMountSelector(po: IBoardPagePageObject): string {
  const selectors = po.selectors as typeof po.selectors & { boardHeaderTarget?: string };
  return selectors.boardHeaderTarget ?? selectors.sidebar;
}

export class BoardSettingsBoardPage extends PageModification<undefined, Element> {
  getModificationId(): string {
    return `board-settings-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    const po = this.container.inject(boardPagePageObjectToken);
    const primarySelector = getBoardSettingsMountSelector(po);
    const mount = resolveBoardSettingsMount(primarySelector);
    if (mount) {
      return Promise.resolve(mount.element);
    }

    const { promise, cancel } = this.waitForMount(primarySelector);
    this.sideEffects.push(cancel);
    return promise;
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    const po = this.container.inject(boardPagePageObjectToken);
    const primarySelector = getBoardSettingsMountSelector(po);
    const mount = resolveBoardSettingsMount(primarySelector);
    if (!mount) {
      // eslint-disable-next-line no-console
      console.error('[BoardSettingsBoardPage] Controls bar not found');
      return;
    }

    const existing = mount.element.querySelector('[data-jh-component="boardSettingsComponent"]');
    if (existing) {
      return;
    }

    const div = document.createElement('div');
    div.setAttribute('data-jh-component', 'boardSettingsComponent');
    div.setAttribute('data-jh-mount-strategy', mount.strategy);
    div.style.display = this.getInitialDisplay(mount.strategy);
    div.style.marginLeft = '8px';
    mount.element.appendChild(div);
    createRoot(div).render(<BoardSettingsComponent />);

    if (mount.strategy === 'fallback') {
      this.watchFallbackVisibility(div);
    }
  }

  private getInitialDisplay(strategy: 'primary' | 'fallback'): string {
    if (strategy === 'primary') {
      return 'inline-block';
    }
    return isBoardSettingsVisibleForUrl(window.location.href) ? 'inline-block' : 'none';
  }

  private watchFallbackVisibility(host: HTMLElement): void {
    let active = true;
    this.sideEffects.push(() => {
      active = false;
    });

    const syncVisibility = (url: string) => {
      if (!active) {
        return;
      }
      host.style.display = isBoardSettingsVisibleForUrl(url) ? 'inline-block' : 'none';
    };

    syncVisibility(window.location.href);
    this.container.inject(routingServiceToken).onUrlChange(syncVisibility);
  }

  private waitForMount(primarySelector: string): { promise: Promise<Element>; cancel: () => void } {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const promise = new Promise<Element>(resolve => {
      intervalId = setInterval(() => {
        const mount = resolveBoardSettingsMount(primarySelector);
        if (mount) {
          clearInterval(intervalId);
          resolve(mount.element);
        }
      }, 100);
    });

    return {
      promise,
      cancel: () => {
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
      },
    };
  }
}

export const boardSettingsBoardPageToken = new Token<BoardSettingsBoardPage>('BoardSettingsBoardPage');
