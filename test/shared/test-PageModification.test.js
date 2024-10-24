import { describe, it, expect } from 'vitest';
import { PageModification } from '../../src/shared/PageModification';

describe('MarkFlaggedIssues', () => {
  const pageModification = new PageModification();

  it('.shouldApply should return true', () => {
    expect(pageModification.shouldApply()).toBeTruthy();
  });

  it('.getModificationId should return null', () => {
    expect(pageModification.getModificationId()).toBeNull();
  });

  it('.appendStyles should return undefined', () => {
    expect(pageModification.appendStyles()).toBeUndefined();
  });

  it('.apply should return undefined', () => {
    expect(pageModification.apply()).toBeUndefined();
  });

  describe('.insertHTML should', () => {
    function Container() {}
    Container.prototype.insertAdjacentHTML = () => {};
    Container.prototype.previousElementSibling = { e: 1 };
    Container.prototype.firstElementChild = { e: 2 };
    Container.prototype.lastElementChild = { e: 3 };
    Container.prototype.nextElementSibling = { e: 4 };
    const container = new Container();

    it('return previous sibling element when position is "beforebegin"', () => {
      expect(pageModification.insertHTML(container, 'beforebegin', '')).toEqual(container.previousElementSibling);
    });

    it('return first child of element when position is "afterbegin"', () => {
      expect(pageModification.insertHTML(container, 'afterbegin', '')).toEqual(container.firstElementChild);
    });

    it('return last child of element when position is "beforeend"', () => {
      expect(pageModification.insertHTML(container, 'beforeend', '')).toEqual(container.lastElementChild);
    });

    it('return next sibling element when position is "afterend"', () => {
      expect(pageModification.insertHTML(container, 'afterend', '')).toEqual(container.nextElementSibling);
    });

    it('throw error when position is not in ["beforebegin","afterbegin","beforeend","afterend"]', () => {
      expect(() => pageModification.insertHTML(container, 'dummy', '')).toThrowError('Wrong position');
    });
  });

  it('.getCssSelectorNotIssueSubTask should return "" when "rapidListConfig.currentStatisticsField.typeId" is not "issueCountExclSubs"', () => {
    const editData = { rapidListConfig: {} };
    expect(pageModification.getCssSelectorNotIssueSubTask(editData)).toEqual('');
  });

  it('.getCssSelectorNotIssueSubTask should return ":not(.ghx-issue-subtask)" when "rapidListConfig.currentStatisticsField.typeId" is "issueCountExclSubs"', () => {
    const editData = { rapidListConfig: { currentStatisticsField: { typeId: 'issueCountExclSubs' } } };
    expect(pageModification.getCssSelectorNotIssueSubTask(editData)).toEqual(':not(.ghx-issue-subtask)');
  });
});
