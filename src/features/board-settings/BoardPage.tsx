import React from 'react';
import { Token } from 'dioma';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { routingServiceToken } from 'src/infrastructure/routing';
import { createRoot, type Root } from 'react-dom/client';
import { PageModification } from '../../infrastructure/page-modification/PageModification';
import { BoardSettingsComponent } from './BoardSettingsComponent';
import { isBoardSettingsVisibleForUrl, resolveBoardSettingsMount } from './resolveBoardSettingsMount';

const HOST_ATTR = 'data-jh-component';
const HOST_VALUE = 'boardSettingsComponent';

function getBoardSettingsMountSelector(po: IBoardPagePageObject): string {
  const selectors = po.selectors as typeof po.selectors & { boardHeaderTarget?: string };
  return selectors.boardHeaderTarget ?? selectors.sidebar;
}

export class BoardSettingsBoardPage extends PageModification<undefined, Element> {
  private host: HTMLElement | null = null;
  private root: Root | null = null;
  private mountStrategy: 'primary' | 'fallback' | null = null;
  /** Set during clear() so remount observers don't resurrect the host. */
  private destroyed = false;
  private urlWatcherAttached = false;
  private remountScheduled = false;

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
    this.destroyed = false;
    this.mountSettingsButton();
    this.ensureRemountObserver();
    this.ensureUrlVisibilityWatcher();
  }

  clear(): void {
    this.destroyed = true;
    this.unmountHost();
    this.mountStrategy = null;
    this.urlWatcherAttached = false;
    super.clear();
  }

  private mountSettingsButton(): void {
    if (this.destroyed) {
      return;
    }

    // Idempotent: skip if our host is still attached to the live DOM.
    if (this.host?.isConnected) {
      return;
    }

    const po = this.container.inject(boardPagePageObjectToken);
    const primarySelector = getBoardSettingsMountSelector(po);
    const mount = resolveBoardSettingsMount(primarySelector);
    if (!mount) {
      // eslint-disable-next-line no-console
      console.error('[BoardSettingsBoardPage] Controls bar not found');
      return;
    }

    // Drop any leftover host node (ours or orphaned) before creating a fresh React root.
    const existing = mount.element.querySelector(`[${HOST_ATTR}="${HOST_VALUE}"]`);
    existing?.remove();

    // Host is gone (Jira wiped header/toolbar) — drop the stale React root before
    // creating a new one to avoid leaking the renderer.
    this.unmountHost();

    const div = document.createElement('div');
    div.setAttribute(HOST_ATTR, HOST_VALUE);
    div.setAttribute('data-jh-mount-strategy', mount.strategy);
    this.mountStrategy = mount.strategy;
    div.style.display = this.getInitialDisplay(mount.strategy);
    div.style.marginLeft = '8px';
    mount.element.appendChild(div);

    const root = createRoot(div);
    root.render(<BoardSettingsComponent />);

    this.host = div;
    this.root = root;
  }

  private unmountHost(): void {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.host?.isConnected) {
      this.host.remove();
    }
    this.host = null;
  }

  private getInitialDisplay(strategy: 'primary' | 'fallback'): string {
    if (strategy === 'primary') {
      return 'inline-block';
    }
    return isBoardSettingsVisibleForUrl(window.location.href) ? 'inline-block' : 'none';
  }

  private syncHostVisibility(): void {
    if (!this.host || this.mountStrategy !== 'fallback') {
      return;
    }
    this.host.style.display = isBoardSettingsVisibleForUrl(window.location.href) ? 'inline-block' : 'none';
  }

  private ensureUrlVisibilityWatcher(): void {
    if (this.urlWatcherAttached) {
      return;
    }
    this.urlWatcherAttached = true;

    const syncVisibility = (url: string) => {
      if (this.destroyed || !this.host || this.mountStrategy !== 'fallback') {
        return;
      }
      this.host.style.display = isBoardSettingsVisibleForUrl(url) ? 'inline-block' : 'none';
    };

    syncVisibility(window.location.href);
    this.container.inject(routingServiceToken).onUrlChange(syncVisibility);
  }

  /**
   * Cloud SPA re-renders the project header / controls bar and wipes our host.
   * runModifications will not re-apply (same modificationId), so we remount ourselves.
   */
  private ensureRemountObserver(): void {
    const observer = new MutationObserver(() => {
      if (this.destroyed || this.host?.isConnected) {
        return;
      }
      if (this.remountScheduled) {
        return;
      }
      this.remountScheduled = true;
      queueMicrotask(() => {
        this.remountScheduled = false;
        if (this.destroyed || this.host?.isConnected) {
          return;
        }
        this.mountSettingsButton();
        this.syncHostVisibility();
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.sideEffects.push(() => observer.disconnect());
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
