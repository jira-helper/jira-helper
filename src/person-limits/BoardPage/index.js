import { throttle } from 'lodash';

import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { settingsJiraDOM as DOM } from '../../swimlane/constants';

const isPersonLimitAppliedToIssue = (personLimit, assignee, columnId, swimlaneId) => {
  if (swimlaneId == null) {
    return (
      (personLimit.person.displayName === assignee || personLimit.person.name === assignee) &&
      personLimit.columns.some(column => column.id === columnId)
    );
  }

  return (
    (personLimit.person.displayName === assignee || personLimit.person.name === assignee) &&
    personLimit.columns.some(column => column.id === columnId) &&
    personLimit.swimlanes.some(swimlane => swimlane.id === swimlaneId)
  );
};

const getNameFromTooltip = tooltip => {
  return tooltip
    .split(':')[1]
    .split('[')[0]
    .trim(); // Assignee: Pavel [x]
};

const getAssignee = avatar => {
  if (!avatar) return null;

  const label = avatar.alt ?? avatar.dataset.tooltip;
  if (!label) return null;

  return getNameFromTooltip(label);
};

export default class PersonLimitsOnBoardPage extends PageModification {
  static jiraSelectors = {
    swimlane: '.ghx-swimlane',
    swimlanePool: '#ghx-pool',
    // One swimlane
    swimlaneJiraCloud: '[data-testid="platform-board-kit.ui.swimlane.swimlane-columns"]', // '[data-testid="platform-board-kit.ui.swimlane.swimlane-content"]',
    // Container of all swimlanes
    swimlanePoolJiraCloud: '[data-testid="platform-board-kit.ui.board.scroll.board-scroll"]',
    column: '.ghx-column',
    // Element to get column title from
    columnCloud: '[data-component-selector="platform-board-kit.ui.column-title"] > div:first-child',
    issue: '.ghx-issue',
    // Issue card selector
    issueCloud: '[data-testid="software-board.board-container.board.card-container.card-with-icc"]',
    // Real column with issues inside
    issueWrapperCloud: '[data-component-selector="platform-board-kit.ui.column.draggable-column"]',
  };

  shouldApply() {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId() {
    return `add-person-limits-${this.getBoardId()}`;
  }

  appendStyles() {
    return `
    <style type="text/css">
        #avatars-limits {
            display: inline-flex;
            margin-left: 30px;
        }

        #avatars-limits .person-avatar {
            cursor: pointer;
            position: relative;
            margin-right: 4px;
            width: 32px;
            height: 32px;
        }

        #avatars-limits .person-avatar img {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            border: none;
        }

        #avatars-limits .person-avatar img[view-my-cards="block"] {
            border: solid 1px red;
        }

        #avatars-limits .person-avatar .limit-stats {
            position: absolute;
            top: -10px;
            right: -6px;
            border-radius: 50%;
            background: grey;
            color: white;
            padding: 5px 2px;
            font-size: 12px;
            line-height: 12px;
            font-weight: 400;
        }

        .ghx-issue.no-visibility {
            display: none!important;
        }

        .ghx-swimlane.no-visibility {
            display: none!important;
        }

        .ghx-parent-group.no-visibility {
            display: none!important;
        }

        .jh-person-limit, .jh-person-limit [data-test-id="platform-card.ui.card.focus-container"] {
            background: #ff5630 !important;
        }
    </style>
    `;
  }

  waitForLoading() {
    return this.waitForFirstElement([
      PersonLimitsOnBoardPage.jiraSelectors.swimlane,
      PersonLimitsOnBoardPage.jiraSelectors.swimlaneJiraCloud,
    ]);
  }

  loadData() {
    return Promise.all([
      this.getBoardEditData(),
      this.getBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS),
      // Only fetch for jira cloud
      this.getBoardLatest().catch(() => null),
    ]);
  }

  modifiedIssues = []; // HTML elements we applied custom styles to

  apply(data) {
    if (!data) return;
    const [editData = {}, personLimits, boardLatest] = data;
    if (!personLimits || !personLimits.limits.length) return;

    this.boardLatest = boardLatest;
    this.cssSelectorOfIssues = this.getCssSelectorOfIssues(editData);

    const throttledApply = throttle(this.applyLimits.bind(this, personLimits), 2000);

    const params = { childList: true, subtree: true };
    this.onDOMChange(PersonLimitsOnBoardPage.jiraSelectors.swimlanePool, throttledApply, params);
    /**
     * This is too much but appears there is no better way atm
     * Triggers reload of latest data on every issue hover, that's why we throttle it
     * We could observe column headers only, but it wouldn't update limits on issue update
     * Maybe it could work with issue observing, needs investigation
     */
    this.onDOMChange(PersonLimitsOnBoardPage.jiraSelectors.swimlanePoolJiraCloud, throttledApply, params);

    this.applyLimits(personLimits);
  }

  applyLimits(personLimits) {
    const stats = this.getLimitsStats(personLimits);

    while (this.modifiedIssues.length > 0) {
      const issue = this.modifiedIssues.pop();
      issue.classList.remove('jh-person-limit');
    }

    stats.forEach(personLimit => {
      if (personLimit.issues.length > personLimit.limit) {
        personLimit.issues.forEach(issue => {
          if (!issue) {
            return;
          }
          issue.classList.add('jh-person-limit');
          this.modifiedIssues.push(issue);
        });
      }
    });

    if (!this.avatarsList || !document.body.contains(this.avatarsList)) {
      const html = stats
        .map(
          personLimit => `
        <div class="person-avatar">
            <img src="${personLimit.person.avatar}" title="${personLimit.person.displayName}" class="jira-tooltip" />
            <div class="limit-stats">
                <span class="stats-current"></span>/<span>${personLimit.limit}</span>
            </div>
        </div>`
        )
        .join('');

      this.avatarsList = document.createElement('div');

      this.avatarsList.id = 'avatars-limits';
      this.avatarsList.innerHTML = html;

      this.addEventListener(this.avatarsList, 'click', event => this.onClickAvatar(event));
      const subNav =
        document.querySelector('#subnav-title') ??
        document.querySelector('[data-testid="filters.ui.filters.assignee.stateless.assignee-filter"]');

      subNav.insertBefore(this.avatarsList, null);
    }

    this.avatarsList.querySelectorAll('.limit-stats').forEach((stat, index) => {
      if (stats[index].issues.length > stats[index].limit) stat.style.background = '#ff5630';
      else if (stats[index].issues.length === stats[index].limit) stat.style.background = '#ffd700';
      else stat.style.background = '#1b855c';

      stat.querySelector('.stats-current').textContent = stats[index].issues.length;
    });
  }

  onClickAvatar(event) {
    if (event.target.nodeName !== 'IMG') return;
    const cardsVisibility = event.target.getAttribute('view-my-cards');

    if (!cardsVisibility) {
      event.target.setAttribute('view-my-cards', 'block');
    } else {
      event.target.removeAttribute('view-my-cards');
    }

    this.showOnlyChosen();
  }

  showOnlyChosen() {
    const cards = Array.from(document.querySelectorAll('.ghx-issue'));
    const isHaveChoose = document.querySelectorAll('[view-my-cards="block"]').length > 0;

    if (!isHaveChoose) {
      cards.forEach(node => {
        node.classList.remove('no-visibility');
      });
      this.showOrHideTaskAggregations();
      return;
    }

    const avatar = Array.from(document.querySelectorAll('[view-my-cards]'));
    const avaTitles = avatar.map(el => el.title);

    cards.forEach(node => {
      const img = node.querySelector('.ghx-avatar img');
      if (!img) {
        node.classList.add('no-visibility');
        return;
      }

      const name = getNameFromTooltip(img.getAttribute('data-tooltip'));
      if (avaTitles.indexOf(name) > -1) {
        node.classList.remove('no-visibility');
      } else {
        node.classList.add('no-visibility');
      }
    });
    this.showOrHideTaskAggregations();
  }

  showOrHideTaskAggregations() {
    this.showOrHideSubTaskParentGroup();
    this.showOrHideEmptySwimlanes();
  }

  showOrHideSubTaskParentGroup() {
    const parentGroup = Array.from(document.querySelectorAll('.ghx-parent-group'));
    parentGroup.forEach(el => {
      this.showOrHideElementByVisibleIssueCards(el);
    });
  }

  showOrHideEmptySwimlanes() {
    const swimlanes = Array.from(document.querySelectorAll(DOM.swimlane));
    swimlanes.forEach(el => {
      this.showOrHideElementByVisibleIssueCards(el);
    });
  }

  showOrHideElementByVisibleIssueCards(el) {
    const lenNoVisibleCards = el.querySelectorAll('.ghx-issue.no-visibility').length;
    const lenCard = el.querySelectorAll('.ghx-issue').length;

    if (lenNoVisibleCards === lenCard) {
      el.classList.add('no-visibility');
    } else {
      el.classList.remove('no-visibility');
    }
  }

  hasCustomswimlanes() {
    const someswimlane = document.querySelector(DOM.swimlaneHeaderContainer);

    if (someswimlane == null) {
      return false;
    }

    // TODO: Shouldn't work for any other language except English, so we have to think about it. F.e., in Russian, it is "Дорожка для custom"
    return someswimlane.getAttribute('aria-label').indexOf('Swimlane for custom') !== -1;
  }

  countAmountPersonalIssuesInColumn(column, stats, swimlaneId) {
    const { columnId } = column.dataset;

    column.querySelectorAll(this.cssSelectorOfIssues).forEach(issue => {
      const avatar = issue.querySelector('.ghx-avatar-img');
      const assignee = getAssignee(avatar);

      if (assignee) {
        stats.forEach(personLimit => {
          if (isPersonLimitAppliedToIssue(personLimit, assignee, columnId, swimlaneId)) {
            personLimit.issues.push(issue);
          }
        });
      }
    });
  }

  countAmountPersonalIssuesInColumnCloud(stats) {
    const allIssues = this.boardLatest?.columns?.flatMap(column => {
      return column.issues.map(issue => {
        const swimlaneId = this.boardLatest?.swimlaneInfo?.swimlanes?.find(swimlane => {
          return swimlane.issueIds?.includes(issue?.id);
        })?.id;
        return {
          ...issue,
          /**
           * Enrich issue data for easier status filtration later
           * Stored in board property as string but returned
           * From jira api as numbers, convert once here
           */
          swimlaneId: swimlaneId ? String(swimlaneId) : null,
          columnId: String(column.id),
          columnName: String(column.name),
        };
      });
    });
    allIssues.forEach(issue => {
      const assigneeId = issue?.assigneeAccountId ?? issue?.assigneeKey;
      const currentLimit = stats.find(stat => {
        // We now store accountId in limit itself for easier user lookup
        const matchesAssignee =
          (stat.person.accountId && stat.person.accountId === assigneeId) ||
          // fallback to previous saved settings, not reliable
          stat.person.avatar.includes(assigneeId) ||
          stat.person.self.includes(assigneeId);

        return matchesAssignee;
      });
      const matchesColumn = currentLimit?.columns?.some(column => column.id === issue?.columnId);
      const matchesSwimlane = currentLimit?.swimlanes.some(swimlane => swimlane.id === issue?.swimlaneId);

      const shouldCountInLimit = matchesSwimlane && matchesColumn;

      if (shouldCountInLimit) {
        const issueElement = document.querySelector(`#card-${issue.key}`);

        /**
         *
         * Issue card is not always in the dom
         * But we push it anyway because we want counters to be valid
         */
        currentLimit.issues.push(issueElement);
      }
    });
    return stats;
  }

  getLimitsStats(personLimits) {
    const stats = personLimits.limits.map(personLimit => ({
      ...personLimit,
      issues: [], // html elements to apply limit styling to
    }));

    if (this.hasCustomswimlanes()) {
      document.querySelectorAll(DOM.swimlane).forEach(swimlane => {
        const swimlaneId = swimlane.getAttribute('swimlane-id');

        swimlane.querySelectorAll('.ghx-column').forEach(column => {
          this.countAmountPersonalIssuesInColumn(column, stats, swimlaneId);
        });
      });

      return stats;
    }

    document.querySelectorAll('.ghx-column').forEach(column => {
      this.countAmountPersonalIssuesInColumn(column, stats);
    });

    if (document.querySelectorAll(PersonLimitsOnBoardPage.jiraSelectors.columnCloud)) {
      this.countAmountPersonalIssuesInColumnCloud(stats);
    }

    return stats;
  }
}
