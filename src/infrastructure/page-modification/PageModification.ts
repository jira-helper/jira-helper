import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { routingServiceToken } from '../routing';
import { settingsPagePageObjectToken } from '../page-objects/SettingsPage';
import { getIssueTypeFromCard } from '../page-objects/utils/getIssueTypeFromCard';
import { waitForElement } from '../../shared/utils';
import {
  deleteBoardPropertyToken,
  getBoardEditDataToken,
  getBoardPropertyToken,
  updateBoardPropertyToken,
} from '../di/jiraApiTokens';

type SideEffect = () => void;

export class PageModification<InitData = undefined, TargetElement extends Element | undefined = undefined> {
  sideEffects: SideEffect[] = [];

  constructor(protected container: Container = globalContainer) {}

  // life-cycle methods

  shouldApply(): Promise<boolean> | boolean {
    return true;
  }

  getModificationId(): string {
    throw new Error('define modificationId');
  }

  appendStyles(): string | undefined {
    return undefined;
  }

  preloadData(): Promise<any> {
    return Promise.resolve();
  }

  waitForLoading(): Promise<TargetElement> {
    // @ts-expect-error - legacy
    return Promise.resolve(undefined);
  }

  loadData(): Promise<InitData | undefined> {
    return Promise.resolve(undefined);
  }

  apply(data?: InitData, el?: Element): any {
    void data;
    void el;
  }

  clear(): void {
    this.sideEffects.forEach(se => se());
    this.sideEffects = [];
  }

  // methods with side-effects

  waitForElement(selector: string, containerEl?: Document | HTMLElement | Element): Promise<Element> {
    const { promise, cancel } = waitForElement(selector, containerEl);
    this.sideEffects.push(cancel);
    return promise;
  }

  protected getBoardProperty<T = any>(property: string): Promise<T | undefined> {
    const routing = this.container.inject(routingServiceToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return this.container.inject(getBoardPropertyToken)(routing.getBoardIdFromURL()!, property, { abortPromise });
  }

  protected updateBoardProperty(property: string, value: any): Promise<any> {
    const routing = this.container.inject(routingServiceToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    // TODO: solve before merge
    // @ts-expect-error is it OK that updateBoardProperty returns void instead of Promise? is it bug or feature?
    return this.container.inject(updateBoardPropertyToken)(routing.getBoardIdFromURL()!, property, value, {
      abortPromise,
    });
  }

  protected deleteBoardProperty(property: string): Promise<any> {
    const routing = this.container.inject(routingServiceToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    // TODO: solve before merge
    // @ts-expect-error is it OK that deleteBoardProperty returns void instead of Promise? is it bug or feature?
    return this.container.inject(deleteBoardPropertyToken)(routing.getBoardIdFromURL()!, property, { abortPromise });
  }

  protected getBoardEditData(): Promise<any> {
    const routing = this.container.inject(routingServiceToken);
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return this.container.inject(getBoardEditDataToken)(routing.getBoardIdFromURL()!, { abortPromise });
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

  protected insertHTML(containerEl: Element, position: InsertPosition, html: string): Element | null {
    containerEl.insertAdjacentHTML(position, html.trim());

    let insertedElement: Element | null = null;
    switch (position) {
      case 'beforebegin':
        insertedElement = containerEl.previousElementSibling;
        break;
      case 'afterbegin':
        insertedElement = containerEl.firstElementChild;
        break;
      case 'beforeend':
        insertedElement = containerEl.lastElementChild;
        break;
      case 'afterend':
        insertedElement = containerEl.nextElementSibling;
        break;
      default:
        throw new Error('Wrong position');
    }

    if (insertedElement) {
      this.sideEffects.push(() => insertedElement!.remove());
    }

    return insertedElement;
  }

  // helpers
  protected getCssSelectorNotIssueSubTask(editData: any): string {
    const constraintType = editData?.rapidListConfig?.currentStatisticsField?.typeId ?? '';
    return constraintType === 'issueCountExclSubs' ? ':not(.ghx-issue-subtask)' : '';
  }

  protected getCssSelectorOfIssues(editData: any): string {
    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    return `.ghx-issue${cssNotIssueSubTask}`;
  }

  protected getIssueTypeFromCard(card: Element): string | null {
    return getIssueTypeFromCard(card);
  }

  protected shouldCountIssue(card: Element, includedIssueTypes?: string[]): boolean {
    if (!includedIssueTypes || includedIssueTypes.length === 0) {
      return true;
    }

    const issueType = this.getIssueTypeFromCard(card);
    return issueType ? includedIssueTypes.includes(issueType) : false;
  }

  protected async getSettingsTab(): Promise<string | null> {
    const routing = this.container.inject(routingServiceToken);
    const tabFromUrl = routing.getSearchParam('tab') || routing.getSearchParam('config');
    if (tabFromUrl) return tabFromUrl;

    const settingsPage = this.container.inject(settingsPagePageObjectToken);
    await this.waitForElement(settingsPage.selectors.selectedNav);
    return settingsPage.getSelectedTab();
  }

  protected getSearchParam(param: string): string | null {
    const routing = this.container.inject(routingServiceToken);
    return routing.getSearchParam(param);
  }

  protected getReportNameFromURL(): string | null {
    const routing = this.container.inject(routingServiceToken);
    return routing.getReportNameFromURL();
  }

  protected getBoardId(): string | null {
    const routing = this.container.inject(routingServiceToken);
    return routing.getBoardIdFromURL();
  }
}
