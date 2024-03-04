import { getBoardIdFromURL, getSearchParam, getReportNameFromURL } from '../routing';
import { waitForElement } from './utils';
import {
  deleteBoardProperty,
  getBoardEditData,
  getBoardEstimationData,
  getBoardProperty,
  getBoardConfiguration,
  updateBoardProperty,
  searchIssues,
  getLatestForBoard,
} from './jiraApi';

export class PageModification {
  sideEffects = [];

  // life-cycle methods

  shouldApply() {
    return true;
  }

  getModificationId() {
    return null;
  }

  appendStyles() {}

  preloadData() {
    return Promise.resolve();
  }

  waitForLoading() {
    return Promise.resolve();
  }

  loadData() {
    return Promise.resolve();
  }

  apply() {}

  clear() {
    this.sideEffects.forEach(se => se());
  }

  // methods with side-effects

  waitForElement(selector, container) {
    const { promise, cancel } = waitForElement(selector, container);
    this.sideEffects.push(cancel);
    return promise;
  }

  /**
   * Waits for first element matching one of the selectors
   */
  waitForFirstElement(selectors, container) {
    return Promise.race(selectors.map(selector => this.waitForElement(selector, container)));
  }

  getBoardProperty(property) {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return getBoardProperty(getBoardIdFromURL(), property, { abortPromise });
  }

  getBoardConfiguration() {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return getBoardConfiguration(getBoardIdFromURL(), { abortPromise });
  }

  updateBoardProperty(property, value) {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return updateBoardProperty(getBoardIdFromURL(), property, value, { abortPromise });
  }

  deleteBoardProperty(property) {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);
    return deleteBoardProperty(getBoardIdFromURL(), property, { abortPromise });
  }

  getBoardEditData() {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);

    return getBoardEditData(getBoardIdFromURL(), { abortPromise });
  }

  getBoardLatest() {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);

    return getLatestForBoard(getBoardIdFromURL(), {
      abortPromise,
      query: {
        hideCardExtraFields: true,
        includeHidden: false,
        moduleKey: 'agile-mobile-board-service',
        skipEtag: false,
        skipExtraFields: true,
      },
    });
  }

  getBoardEstimationData() {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);

    return getBoardEstimationData(getBoardIdFromURL(), { abortPromise });
  }

  searchIssues(jql, params = {}) {
    const { cancelRequest, abortPromise } = this.createAbortPromise();
    this.sideEffects.push(cancelRequest);

    return searchIssues(jql, { ...params, abortPromise });
  }

  createAbortPromise() {
    let cancelRequest;
    const abortPromise = new Promise(resolve => {
      cancelRequest = resolve;
    });

    return { cancelRequest, abortPromise };
  }

  setTimeout(func, time) {
    const timeoutID = setTimeout(func, time);
    this.sideEffects.push(() => clearTimeout(timeoutID));
    return timeoutID;
  }

  addEventListener = (target, event, cb) => {
    target.addEventListener(event, cb);
    this.sideEffects.push(() => target.removeEventListener(event, cb));
  };

  /**
   * @param selector
   * @param cb
   * @param {import('lib.dom.d.ts').MutationObserverInit} params
   */
  onDOMChange(selector, cb, params = { childList: true, subtree: false }) {
    const elements = document.querySelectorAll(selector);

    if (!elements || !elements.length) return;

    const observer = new MutationObserver(cb);
    elements.forEach(element => {
      observer.observe(element, params);
    });
    this.sideEffects.push(() => observer.disconnect());
  }

  onDOMChangeOnce(selectorOrElement, cb, params = { childList: true }) {
    const element =
      selectorOrElement instanceof HTMLElement ? selectorOrElement : document.querySelector(selectorOrElement);
    if (!element) return;

    const observer = new MutationObserver(() => {
      observer.disconnect();
      cb();
    });
    observer.observe(element, params);
    this.sideEffects.push(() => observer.disconnect());
  }

  insertHTML(container, position, html) {
    try {
      container.insertAdjacentHTML(position, html.trim());

      let insertedElement;
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
          throw Error('Wrong position');
      }

      this.sideEffects.push(() => insertedElement.remove());
      return insertedElement;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('jira-helper: Insertion error: ', e);
      // eslint-disable-next-line no-console
      console.error('jira-helper: ', container, position, html);
      throw e;
    }
  }

  setDataAttr(element, attr, value) {
    element.dataset[attr] = value;
    this.sideEffects.push(() => {
      delete element.dataset[attr];
    });
  }

  // helpers
  getCssSelectorNotIssueSubTask(editData) {
    const constraintType = editData?.rapidListConfig?.currentStatisticsField?.typeId ?? '';
    return constraintType === 'issueCountExclSubs' ? ':not(.ghx-issue-subtask)' : '';
  }

  getCssSelectorOfIssues(editData) {
    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    return `.ghx-issue${cssNotIssueSubTask}`;
  }

  getSearchParam(param) {
    return getSearchParam(param);
  }

  getReportNameFromURL() {
    return getReportNameFromURL();
  }

  getBoardId() {
    return getBoardIdFromURL();
  }
}
