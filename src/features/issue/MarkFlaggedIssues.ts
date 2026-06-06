import each from '@tinkoff/utils/array/each';
import { Token } from 'dioma';
import { PageModification } from '../../infrastructure/page-modification/PageModification';
import { Routes, routingServiceToken } from '../../infrastructure/routing';
import { loadFlaggedIssuesToken, loadNewIssueViewEnabledToken } from '../../infrastructure/di/jiraApiTokens';
import { issueDOM } from './domSelectors';
import { extensionApiServiceToken } from '../../infrastructure/extension-api/ExtensionApiService';
import flagNew from '../../assets/flagNew.svg';
import flagUrl from '../../assets/flag.png';

enum RelatedIssue {
  LINKED = 'LINKED',
  EPIC_ISSUE = 'EPIC_ISSUE',
  SUB_TASK = 'SUB_TASK',
  LINKED_NEW = 'LINKED_NEW',
}

export default class MarkFlaggedIssues extends PageModification<any, Element> {
  private newIssueView: boolean = false;
  private get routing() {
    return this.container.inject(routingServiceToken);
  }

  private getFlag(): HTMLImageElement {
    const extensionApi = this.container.inject(extensionApiServiceToken);
    const flag = document.createElement('img');
    flag.src = extensionApi.getUrl(this.newIssueView ? flagNew : flagUrl);
    flag.style.width = '16px';
    flag.style.height = '16px';
    return flag;
  }

  private getIssueSelector(): string {
    if (this.routing.getCurrentRoute() === Routes.BOARD) {
      return `[data-issuekey='${this.routing.getIssueId()}'] ${issueDOM.detailsBlock}`;
    }

    if (this.routing.getCurrentRoute() === Routes.SEARCH) {
      return `[data-issue-key='${this.routing.getIssueId()}']`;
    }

    return issueDOM.detailsBlock;
  }

  shouldApply(): boolean {
    return this.routing.getIssueId() != null;
  }

  getModificationId(): string {
    return `mark-flagged-issues-${this.routing.getIssueId()}`;
  }

  preloadData(): Promise<void> {
    const loadNewIssueViewEnabled = this.container.inject(loadNewIssueViewEnabledToken);
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

    return this.waitForElement(this.getIssueSelector());
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

    const issueId = this.routing.getIssueId();
    const loadFlaggedIssues = this.container.inject(loadFlaggedIssuesToken);
    const flaggedIssues = await loadFlaggedIssues([...Object.keys(issuesElements), issueId!]);

    flaggedIssues.forEach((issueKey: string) => {
      (issuesElements[issueKey] || []).forEach(({ type, element }) => {
        element.style.backgroundColor = this.newIssueView ? '#fffae6' : '#ffe9a8';

        const flag = this.getFlag();

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
          mainField.insertBefore(this.getFlag(), null);
        }
      }
    });
  }
}

export const markFlaggedIssuesToken = new Token<MarkFlaggedIssues>('MarkFlaggedIssues');
