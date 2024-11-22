import each from '@tinkoff/utils/array/each';
import { PageModification } from '../shared/PageModification';
import { getCurrentRoute, getIssueId, Routes } from '../routing';
import { loadFlaggedIssues, loadNewIssueViewEnabled } from '../shared/jiraApi';
import { issueDOM } from './domSelectors';
import { extensionApiService } from '../shared/ExtensionApiService';
import flagNew from '../assets/flagNew.svg';
import flagUrl from '../assets/flag.png';

enum RelatedIssue {
  LINKED = 'LINKED',
  EPIC_ISSUE = 'EPIC_ISSUE',
  SUB_TASK = 'SUB_TASK',
  LINKED_NEW = 'LINKED_NEW',
}

const getFlag = (newIssueView: boolean): HTMLImageElement => {
  const flag = document.createElement('img');
  flag.src = extensionApiService.getUrl(newIssueView ? flagNew : flagUrl);
  flag.style.width = '16px';
  flag.style.height = '16px';
  return flag;
};

const getIssueSelector = (): string => {
  if (getCurrentRoute() === Routes.BOARD) {
    return `[data-issuekey='${getIssueId()}'] ${issueDOM.detailsBlock}`; // When switching tasks on the board, wait for the desired task to load
  }

  if (getCurrentRoute() === Routes.SEARCH) {
    return `[data-issue-key='${getIssueId()}']`;
  }

  return issueDOM.detailsBlock;
};

export default class extends PageModification<any, Element> {
  private newIssueView: boolean = false;

  shouldApply(): boolean {
    return getIssueId() != null;
  }

  getModificationId(): string {
    return `mark-flagged-issues-${getIssueId()}`;
  }

  preloadData(): Promise<void> {
    return (this.getSearchParam('oldIssueView') ? Promise.resolve(false) : loadNewIssueViewEnabled()).then(
      (newIssueView: boolean) => {
        this.newIssueView = newIssueView;
      }
    );
  }

  waitForLoading(): Promise<Element> {
    if (this.newIssueView) {
      return this.waitForElement(issueDOM.linkButton);
    }

    return this.waitForElement(getIssueSelector());
  }

  async apply(): Promise<void> {
    const issuesElements: Record<string, Array<{ type: RelatedIssue; element: HTMLElement }>> = {};
    const addIssue = (key: string | null, element: HTMLElement, type: RelatedIssue): void => {
      if (!key) return;
      if (!issuesElements[key]) issuesElements[key] = [];

      issuesElements[key].push({ type, element });
    };

    if (this.newIssueView) {
      each(
        (issueLink: HTMLElement) => {
          const key = issueLink.textContent;
          addIssue(key, issueLink.parentElement!.parentElement as HTMLElement, RelatedIssue.LINKED_NEW);
        },
        document.querySelectorAll(issueDOM.subIssueLink) as NodeListOf<HTMLElement>
      );
    } else {
      each(
        (issueLink: HTMLElement) => {
          const key = issueLink.querySelector('a')?.dataset.issueKey || null;
          addIssue(key, issueLink.parentElement as HTMLElement, RelatedIssue.LINKED);
        },
        document.querySelectorAll(issueDOM.subIssue) as NodeListOf<HTMLElement>
      );

      each(
        (epicIssue: HTMLElement) => {
          const key = epicIssue.dataset.issuekey || null;
          addIssue(key, epicIssue, RelatedIssue.SUB_TASK);
        },
        document.querySelectorAll(issueDOM.subTaskLink) as NodeListOf<HTMLElement>
      );

      each(
        (epicIssue: HTMLElement) => {
          const key = epicIssue.dataset.issuekey || null;
          addIssue(key, epicIssue, RelatedIssue.EPIC_ISSUE);
        },
        document.querySelectorAll(issueDOM.epicIssueLink) as NodeListOf<HTMLElement>
      );
    }

    const issueId = getIssueId();
    const flaggedIssues = await loadFlaggedIssues([...Object.keys(issuesElements), issueId!]);

    flaggedIssues.forEach((issueKey: string) => {
      (issuesElements[issueKey] || []).forEach(({ type, element }) => {
        element.style.backgroundColor = this.newIssueView ? '#fffae6' : '#ffe9a8';

        const flag = getFlag(this.newIssueView);

        switch (type) {
          case RelatedIssue.LINKED: {
            const snap = element.querySelector('.link-snapshot');
            if (snap) {
              snap.insertBefore(flag, snap.children[0]);
            }
            break;
          }
          case RelatedIssue.SUB_TASK:
          case RelatedIssue.EPIC_ISSUE: {
            flag.style.verticalAlign = 'top';
            const status = element.querySelector('.status');
            if (status) {
              status.insertBefore(flag, null);
            }
            break;
          }
          case RelatedIssue.LINKED_NEW: {
            const summary = element.querySelector(issueDOM.subIssueSummary);
            if (summary) {
              flag.style.marginRight = '4px';
              summary.parentElement!.insertBefore(flag, summary.nextElementSibling);
            }
            break;
          }
          default:
        }
      });

      if (!this.newIssueView && issueKey === issueId) {
        const mainField = document.querySelector('#priority-val') || document.querySelector('#type-val');
        if (mainField) {
          mainField.insertBefore(getFlag(this.newIssueView), null);
        }
      }
    });
  }
}
