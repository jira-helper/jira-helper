import { getBoardIdFromURL, getSearchParam, getReportNameFromURL } from '../routing';
import { waitForElement } from './utils';
import { deleteBoardProperty, getBoardEditData, getBoardProperty, updateBoardProperty } from './jiraApi';

type SideEffect = () => void;

export class PageModification<InitData = undefined, TargetElement extends Element | undefined = undefined> {
  sideEffects: SideEffect[] = [];

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
    // @ts-expect-error
    return Promise.resolve(undefined);
  }

  loadData(): Promise<InitData | undefined> {
    return Promise.resolve(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  apply(_?: InitData, __?: Element): any {}

  clear(): void {
    this.sideEffects.forEach(se => se());
  }

  // methods with side-effects

  waitForElement(selector: string, container?: Document | HTMLElement | Element): Promise<Element> {
    const { promise, cancel } = waitForElement(selector, container);
    this.sideEffects.push(cancel);
    return promise;
  }

  protected getBoardProperty(property: string): Promise<any> {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return getBoardProperty(getBoardIdFromURL()!, property, { abortPromise });
  }

  protected updateBoardProperty(property: string, value: any): Promise<any> {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    // TODO: solve before merge
    // @ts-expect-error is it OK that updateBoardProperty returns void instead of Promise? is it bug or feature?
    return updateBoardProperty(getBoardIdFromURL()!, property, value, { abortPromise });
  }

  protected deleteBoardProperty(property: string): Promise<any> {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    // TODO: solve before merge
    // @ts-expect-error is it OK that updateBoardProperty returns void instead of Promise? is it bug or feature?
    return deleteBoardProperty(getBoardIdFromURL()!, property, { abortPromise });
  }

  protected getBoardEditData(): Promise<any> {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return getBoardEditData(getBoardIdFromURL()!, { abortPromise });
  }

  protected createAbortPromise(): { cancelRequest: () => void; abortPromise: Promise<void> } {
    let cancelRequest: () => void;
    const abortPromise = new Promise<void>(resolve => {
      cancelRequest = resolve;
    });
    return { cancelRequest: cancelRequest!, abortPromise };
  }

  protected setTimeout(func: () => void, time: number): NodeJS.Timeout {
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

  // helpers
  protected getCssSelectorNotIssueSubTask(editData: any): string {
    const constraintType = editData?.rapidListConfig?.currentStatisticsField?.typeId ?? '';
    return constraintType === 'issueCountExclSubs' ? ':not(.ghx-issue-subtask)' : '';
  }

  protected getCssSelectorOfIssues(editData: any): string {
    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    return `.ghx-issue${cssNotIssueSubTask}`;
  }

  protected getSearchParam(param: string): string | null {
    return getSearchParam(param);
  }

  protected getReportNameFromURL(): string | null {
    return getReportNameFromURL();
  }

  protected getBoardId(): string | null {
    return getBoardIdFromURL();
  }
}
