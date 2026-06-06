// src/cloud/shared/PageModification.cloud.ts
// Cloud версия PageModification с DI для API вызовов

import type { Container } from 'dioma';
import { waitForElement } from '../../shared/utils';
import { boardPagePageObjectToken } from 'src/shared/di/boardPageObjectToken';
import { getBoardEditDataCloudToken, searchUsersCloudToken, buildAvatarUrlCloudToken } from './di/jiraApiTokens.cloud';
import { getBoardPropertyCloudToken, updateBoardPropertyCloudToken, deleteBoardPropertyCloudToken } from './di/jiraApiTokens.cloud';

type SideEffect = () => void;

export abstract class PageModificationCloud<
  InitData = undefined,
  TargetElement extends Element | undefined = undefined
> {
  sideEffects: SideEffect[] = [];

  constructor(protected container: Container = globalContainer) {}

  abstract getModificationId(): string;

  appendStyles(): string | undefined {
    return undefined;
  }

  preloadData(): Promise<any> {
    return Promise.resolve();
  }

  waitForLoading(): Promise<TargetElement> {
    return Promise.resolve(undefined) as Promise<TargetElement>;
  }

  loadData(): Promise<InitData | undefined> {
    return Promise.resolve(undefined);
  }

  apply(_?: InitData, __?: Element): any {}

  clear(): void {
    this.sideEffects.forEach(se => se());
    this.sideEffects = [];
  }

  waitForElement(selector: string, containerEl?: Document | HTMLElement | Element): Promise<Element> {
    const { promise, cancel } = waitForElement(selector, containerEl);
    this.sideEffects.push(cancel);
    return promise;
  }

  protected async getBoardProperty<T>(property: string): Promise<T | undefined> {
    const boardPage = this.container.inject(boardPagePageObjectToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    const getBoardPropertyCloud = this.container.inject(getBoardPropertyCloudToken);
    return getBoardPropertyCloud<T>(boardPage, property);
  }

  protected async updateBoardProperty(property: string, value: any): Promise<boolean> {
    const boardPage = this.container.inject(boardPagePageObjectToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    const updateBoardPropertyCloud = this.container.inject(updateBoardPropertyCloudToken);
    return updateBoardPropertyCloud(boardPage, property, value);
  }

  protected async deleteBoardProperty(property: string): Promise<boolean> {
    const boardPage = this.container.inject(boardPagePageObjectToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    const deleteBoardPropertyCloud = this.container.inject(deleteBoardPropertyCloudToken);
    return deleteBoardPropertyCloud(boardPage, property);
  }

  protected async getBoardEditData(): Promise<any> {
    const boardPage = this.container.inject(boardPagePageObjectToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    const getBoardEditDataCloud = this.container.inject(getBoardEditDataCloudToken);
    return getBoardEditDataCloud(boardPage, abortPromise);
  }

  protected async searchUsers(query: string): Promise<any[]> {
    const boardPage = this.container.inject(boardPagePageObjectToken);
    const searchUsersCloud = this.container.inject(searchUsersCloudToken);
    return searchUsersCloud(query, boardPage);
  }

  protected buildAvatarUrl(user: any, size: '48x48' | '32x32' | '24x24' | '16x16' = '48x48'): string {
    const buildAvatarUrlCloud = this.container.inject(buildAvatarUrlCloudToken);
    return buildAvatarUrlCloud(user, size);
  }

  protected createAbortPromise(): { cancelRequest: () => void; abortPromise: Promise<void> } {
    let cancelRequest: () => void;
    const abortPromise = new Promise<void>(resolve => {
      cancelRequest = resolve;
    });
    return { cancelRequest: cancelRequest!, abortPromise };
  }

  protected setTimeout(func: () => void, time: number): ReturnType<typeof setTimeout> {
    const timeoutID = setTimeout(func, time);
    this.sideEffects.push(() => clearTimeout(timeoutID));
    return timeoutID;
  }

  protected addEventListener(target: EventTarget, event: string, cb: EventListener): void {
    target.addEventListener(event, cb);
    this.sideEffects.push(() => target.removeEventListener(event, cb));
  }

  protected onDOMChange(
    selector: string,
    cb: MutationCallback,
    params: MutationObserverInit = { childList: true }
  ): void {
    const element = document.querySelector(selector);
    if (!element) return;

    const observer = new MutationObserver(cb);
    observer.observe(element, params);
    this.sideEffects.push(() => observer.disconnect());
  }

  protected insertHTML(container: Element, position: InsertPosition, html: string): Element | null {
    container.insertAdjacentHTML(position, html.trim());

    let insertedElement: Element | null = null;
    switch (position) {
      case 'beforebegin':
        insertedElement = container.previousElementSibling;
        break;
      case 'afterbegin':
        insertedElement = container.firstElementChild;
        break;
      case 'beforeend':
        insertedElement = container.lastElementChild;
        break;
      case 'afterend':
        insertedElement = container.nextElementSibling;
        break;
      default:
        throw new Error('Wrong position');
    }

    if (insertedElement) {
      this.sideEffects.push(() => insertedElement!.remove());
    }

    return insertedElement;
  }

  protected getSearchParam(_param: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(_param);
  }

  protected getBoardId(): number | null {
    const boardPage = this.container.inject(boardPagePageObjectToken);
    return boardPage.getBoardId();
  }
}