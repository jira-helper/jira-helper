import { debounce } from 'lodash';
import each from '@tinkoff/utils/array/each';
import filter from '@tinkoff/utils/array/filter';
import { PageModification } from '../shared/PageModification';
import { settingsJiraDOM as DOM } from './constants';
import { BOARD_PROPERTIES } from '../shared/constants';
import style from './styles.css';
import { mergeSwimlaneSettings } from './utils';

export default class extends PageModification {
  shouldApply() {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId() {
    return `add-swimlane-limits-${this.getBoardId()}`;
  }

  appendStyles() {
    return `
    <style>
      #js-swimlane-header-stalker .ghx-description {
        color: inherit !important;
      }
    </style>
  `;
  }

  waitForLoading() {
    return this.waitForFirstElement([DOM.swimlane, DOM.swimlaneCloud]);
  }

  loadData() {
    return Promise.all([
      Promise.all([
        this.getBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS),
        this.getBoardProperty(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS),
      ]).then(mergeSwimlaneSettings),
      // Only fetch for jira cloud
      document.querySelector(DOM.swimlaneCloud) ? this.getBoardLatest() : null,
    ]);
  }

  apply(settings) {
    if (!settings) return;

    this.renderLimits(settings);
    this.onDOMChange('#ghx-pool', () => this.renderLimits(settings));

    const debouncedRenderLimits = debounce(() => this.renderLimits(settings), 500);
    this.onDOMChange(DOM.swimlaneCloudWrapper, debouncedRenderLimits, {
      childList: false,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-expanded'],
    });
  }

  /**
   * @param settings
   * @param {BoardLatest} boardLatest
   */
  renderLimits([settings, boardLatest]) {
    const swimlanesIssuesCount = {};
    each(swimlane => {
      const swimlaneId = swimlane.getAttribute('swimlane-id');
      if (!settings[swimlaneId] || !settings[swimlaneId].limit) return;

      const { limit } = settings[swimlaneId];

      const swimlaneHeader = swimlane.querySelector(DOM.swimlaneHeader);
      const swimlaneColumns = Array.from(swimlane.getElementsByClassName('ghx-columns')[0].childNodes || []);

      const numberIssues = swimlaneColumns.reduce(
        (acc, column) =>
          acc +
          filter(
            issue => !issue.classList.contains('ghx-done') && !issue.classList.contains('ghx-issue-subtask'),
            column.querySelectorAll('.ghx-issue')
          ).length,
        0
      );

      swimlanesIssuesCount[swimlaneId] = numberIssues;

      const swimlaneDescription = swimlane.querySelector('.ghx-description');
      const innerSwimlaneHeader = swimlane.querySelector('.ghx-swimlane-header');

      if (numberIssues > limit) {
        swimlane.style.backgroundColor = '#ff5630';
        swimlaneDescription.style.color = '#ffd700';

        // Some JIRA-versions has white backgroundColor on swimlane header, f.e. v8.8.1
        innerSwimlaneHeader.style.backgroundColor = '#ff5630';
      }

      this.renderSwimlaneHeaderLimit(numberIssues, limit, swimlaneHeader);
    }, document.querySelectorAll(DOM.swimlane));

    const swimlaneElements = document.querySelectorAll(DOM.swimlaneHeaderContainerCloud);
    swimlaneElements.forEach(swimlaneElement => {
      const swimlaneInfo = boardLatest?.swimlaneInfo?.swimlanes?.find(swimlane => {
        return swimlane.name === swimlaneElement.textContent;
      });

      const issuesCount = swimlaneInfo?.issueIds?.length ?? 0;
      const swimlaneLimit = settings[swimlaneInfo?.id]?.limit ?? null;
      const isOverLimit = swimlaneLimit !== null && issuesCount > swimlaneLimit;

      if (isOverLimit) {
        swimlaneElement.classList.add(style.swimlane_NotRespected);
        swimlaneElement.closest(DOM.swimlaneCloud).style.backgroundColor = '#ff5630';
        swimlaneElement.closest(DOM.swimlaneCloud).style.borderRadius = '66px';
      }
    });

    const stalker = document.querySelector('#ghx-swimlane-header-stalker');
    if (stalker && stalker.firstElementChild) {
      const swimlaneId = stalker.firstElementChild.getAttribute('data-swimlane-id');
      if (!swimlaneId || !swimlanesIssuesCount[swimlaneId]) return;

      const swimlaneHeader = stalker.querySelector(DOM.swimlaneHeader)?.querySelector('*:nth-child(2)');
      this.renderSwimlaneHeaderLimit(swimlanesIssuesCount[swimlaneId], settings[swimlaneId].limit, swimlaneHeader);
    }

    const stalkersCloud = document.querySelectorAll(DOM.swimlaneContentCloud);
    stalkersCloud.forEach(stalkerCloud => {
      const element = stalkerCloud.querySelector(DOM.swimlaneHeaderContainerCloud);
      const swimlaneInfo = boardLatest?.swimlaneInfo?.swimlanes.find(swimlane => {
        return swimlane.name === element.textContent;
      });
      const swimlaneId = swimlaneInfo?.id ?? stalker.firstElementChild.getAttribute('data-swimlane-id');

      const count = swimlanesIssuesCount[swimlaneId] ?? swimlaneInfo?.issueIds?.length;
      const hasLimit = swimlaneId && count > 0 && settings[swimlaneId]?.limit !== null;

      if (!hasLimit) return;
      this.renderSwimlaneHeaderLimit(count, settings[swimlaneId].limit, element);
    });
  }

  renderSwimlaneHeaderLimit(numberIssues, limit, swimlaneHeader) {
    const hasClass = swimlaneHeader.classList.contains(style.limitBadge);
    const hasBadge = swimlaneHeader?.parentElement?.querySelector?.(`.${style.limitBadge}`);
    if (hasClass || hasBadge) {
      return;
    }

    const isCloud = document.querySelector(DOM.swimlaneCloud);

    let badgeClasses = style.limitBadge;
    if (isCloud && limit < numberIssues) {
      badgeClasses += ` ${style.limitBadge_NotRespected}`;
    }

    if (isCloud && limit === numberIssues) {
      badgeClasses += ` ${style.limitBadge_OnTheLimit}`;
    }

    const badge = `
      <span class="${badgeClasses}">${numberIssues}/${limit}<span class="${style.limitBadge__hint}">Issues / Max. issues</span></span>
    `;

    this.insertHTML(swimlaneHeader, isCloud ? 'afterend' : 'beforebegin', badge);
  }
}
