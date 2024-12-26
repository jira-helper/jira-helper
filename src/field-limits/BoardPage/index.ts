import mapObj from '@tinkoff/utils/object/map';
import isEmpty from '@tinkoff/utils/is/empty';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES, COLORS } from '../../shared/constants';
import { limitsKey, normalize } from '../shared';
import { fieldLimitBlockTemplate, fieldLimitsTemplate, fieldLimitTitleTemplate } from './htmlTemplates';
import { settingsJiraDOM as DOM } from '../../swimlane/constants';

const TYPE_CALC = {
  BY_CARD: 0,
  BY_SUM_VALUE: 1,
  BY_SUM_NUMBERS: 2,
  BY_MULTIPLE_VALUES: 3,
} as const;

type LimitStats = {
  columns: string[];
  swimlanes: string[];
  fieldId: string;
  fieldValue: string;
  limit: number;
  issues: Array<{ issue: HTMLElement; countValues: number }>;
  typeCalc?: number;
  visualValue: string;
  bkgColor: string;
};

type BoardData = {
  cardLayoutConfig: { currentFields: any[] };
};

type FieldLimits = {
  limits: Record<string, LimitStats>;
};

export default class FieldLimitsSettingsPage extends PageModification<[BoardData, FieldLimits], Element> {
  static jiraSelectors = {
    subnavTitle: '#subnav-title',
    extraField: '.ghx-extra-field',
    swimlane: '.ghx-swimlane',
    column: '.ghx-column',
    ghxPool: '#ghx-pool',
    ghxViewSelector: '#ghx-view-selector',
  };

  static classes = {
    fieldLimitsBlock: 'field-limit-block-stat-jh',
    issuesCount: 'field-issues-count',
  };

  private fieldLimits?: FieldLimits;

  private cssSelectorOfIssues: string | null = null;

  private normalizedExtraFields: any;

  private fieldLimitsList?: Element | null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `board-page-field-limits-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(FieldLimitsSettingsPage.jiraSelectors.swimlane);
  }

  async loadData(): Promise<[BoardData, FieldLimits]> {
    const boardData = (await this.getBoardEditData()) as BoardData;
    const fieldLimits = ((await this.getBoardProperty(BOARD_PROPERTIES.FIELD_LIMITS)) || { limits: {} }) as FieldLimits;
    return [boardData, fieldLimits];
  }

  apply(data: [BoardData, FieldLimits]): void {
    if (!data) return;
    const [boardData, fieldLimits] = data;
    if (isEmpty(fieldLimits) || isEmpty(fieldLimits.limits)) return;
    this.fieldLimits = fieldLimits;
    this.cssSelectorOfIssues = this.getCssSelectorOfIssues(boardData);
    this.normalizedExtraFields = normalize('fieldId', boardData.cardLayoutConfig.currentFields);

    this.applyLimits();
    this.onDOMChange(FieldLimitsSettingsPage.jiraSelectors.ghxPool, () => this.applyLimits(), {
      childList: true,
      subtree: true,
    });

    this.onDOMChange(FieldLimitsSettingsPage.jiraSelectors.ghxViewSelector, () => this.checkIfLimitsAreApplied(), {
      childList: true,
      subtree: true,
    });
  }

  applyLimits(): void {
    const limitsStats = this.getLimitsStats();

    this.doColorCardsIssue(limitsStats);
    this.applyLimitsList(limitsStats);
  }

  getSumValues(stat: LimitStats): number {
    return stat.issues.reduce((acc, issue) => acc + issue.countValues, 0);
  }

  doColorCardsIssue(limitsStats: Record<string, LimitStats>): void {
    Object.keys(limitsStats).forEach(limitKey => {
      const stat = limitsStats[limitKey];
      if (isEmpty(stat.issues)) return;

      const sumCountValues = this.getSumValues(stat);

      if (sumCountValues > stat.limit) {
        stat.issues.forEach(({ issue, countValues }) => {
          if (countValues === 0) return;
          issue.style.backgroundColor = COLORS.OVER_WIP_LIMITS;
        });
      }
    });
  }

  checkIfLimitsAreApplied(): void {
    if (!document.body.contains(this.fieldLimitsList!)) {
      const limitsStats = this.getLimitsStats();
      this.applyLimitsList(limitsStats);
    }
  }

  applyLimitsList(limitsStats: Record<string, LimitStats>): void {
    if (!this.fieldLimitsList || !document.body.contains(this.fieldLimitsList)) {
      const subnavTitle = document.querySelector(FieldLimitsSettingsPage.jiraSelectors.subnavTitle);
      if (!subnavTitle) {
        return;
      }
      this.fieldLimitsList = this.insertHTML(
        subnavTitle,
        'beforeend',
        fieldLimitsTemplate({
          listBody: Object.keys(limitsStats)
            .map(limitKey => {
              const { visualValue, bkgColor } = limitsStats[limitKey];

              return fieldLimitBlockTemplate({
                blockClass: FieldLimitsSettingsPage.classes.fieldLimitsBlock,
                dataFieldLimitKey: limitKey,
                bkgColor,
                innerText: visualValue,
                // TODO: limitValue is not used in template. Is it bug or feature?
                // limitValue: limitsStats[limitKey].limit,
                issuesCountClass: FieldLimitsSettingsPage.classes.issuesCount,
              });
            })
            .join(''),
        })
      );
    }

    this.fieldLimitsList!.querySelectorAll(`.${FieldLimitsSettingsPage.classes.fieldLimitsBlock}`).forEach(
      fieldNode => {
        const limitKey = fieldNode.getAttribute('data-field-limit-key');
        if (!limitKey) return;
        const { fieldValue, fieldId } = limitsKey.decode(limitKey);
        const stat = limitsStats[limitKey];
        const currentIssueNode = fieldNode.querySelector(`.${FieldLimitsSettingsPage.classes.issuesCount}`);

        if (!fieldId || !fieldValue || !currentIssueNode) return;

        const sumValues = this.getSumValues(stat);
        const limitOfFieldIssuesOnBoard = stat.limit;

        switch (Math.sign(limitOfFieldIssuesOnBoard - sumValues)) {
          case -1:
            // @ts-expect-error - we are sure that currentIssueNode is HTMLElement
            currentIssueNode.style.backgroundColor = COLORS.OVER_WIP_LIMITS;
            break;
          case 0:
            // @ts-expect-error - we are sure that currentIssueNode is HTMLElement
            currentIssueNode.style.backgroundColor = COLORS.ON_THE_LIMIT;
            break;
          default:
            // @ts-expect-error - we are sure that currentIssueNode is HTMLElement
            currentIssueNode.style.backgroundColor = COLORS.BELOW_THE_LIMIT;
            break;
        }

        currentIssueNode.innerHTML = `${sumValues}/${limitOfFieldIssuesOnBoard}`;

        fieldNode.setAttribute(
          'title',
          fieldLimitTitleTemplate({
            limit: limitOfFieldIssuesOnBoard,
            current: sumValues,
            fieldValue,
            fieldName: this.normalizedExtraFields.byId[fieldId]?.name,
          })
        );
      }
    );
  }

  hasCustomswimlanes(): boolean {
    const someswimlane = document.querySelector(DOM.swimlaneHeaderContainer);

    if (someswimlane == null) {
      return false;
    }

    return someswimlane.getAttribute('aria-label')?.indexOf('custom:') !== -1;
  }

  // Pro, Pro^2
  getCountValuesFromExtraField(exField: HTMLElement, value: string): number {
    // Find all variants of this value
    let result = 0;
    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        const search = (el as HTMLElement).innerText.split(',');
        search.forEach(txt => {
          // Sample: Team^2 - count = 2, Team - count = 1
          const itemVal = txt.trim().split('^');
          const type = itemVal[0].trim();
          const numb = `${itemVal[1]}`.trim();
          const count = /^[0-9]*$/.test(numb) ? Number(numb) : 1;
          if (value === type) {
            result += count;
          }
        });
      });
    }
    return result;
  }

  getHasValueFromExtraField(exField: HTMLElement, value: string): number {
    let result = false;
    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        result =
          result || (el as HTMLElement).innerText.split(',').reduce((acc, val) => acc || val.trim() === value, false);
      });
    }
    return result ? 1 : 0;
  }

  getSumNumberValueFromExtraField(exField: HTMLElement): number {
    let result = 0;
    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        const val = Number.parseFloat((el as HTMLElement).innerText);
        result += Number.isNaN(val) ? 0 : val;
      });
    }
    return result;
  }

  getHasOneOfValuesFromExtraField(exField: HTMLElement, value: string): number {
    let result = false;
    const pattern = /\s*\|\|\s*/;
    const values = value.split(pattern);

    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        result =
          result ||
          (el as HTMLElement).innerText
            .split(',')
            .reduce((acc, val) => values.some(v => v === val.trim()) || acc, false);
      });
    }
    return result ? 1 : 0;
  }

  countAmountPersonalIssuesInColumn(column: HTMLElement, stats: Record<string, LimitStats>, swimlaneId?: string): void {
    const { columnId } = column.dataset;

    column.querySelectorAll(this.cssSelectorOfIssues!).forEach(issue => {
      const extraFieldsForIssue = Array.from(issue.querySelectorAll(FieldLimitsSettingsPage.jiraSelectors.extraField));

      Object.keys(stats).forEach(fieldLimitKey => {
        const stat = stats[fieldLimitKey];

        if (!stat.columns.includes(columnId!)) return;
        if (swimlaneId && !stat.swimlanes.includes(swimlaneId)) return;

        const fieldNameSt = this.normalizedExtraFields.byId[stat.fieldId]?.name;
        const fieldValue = stat.fieldValue.replace(/^∑/, '');

        let typeCalc: number = TYPE_CALC.BY_CARD;
        window.console.info('countAmountPersonalIssuesInColumn:', stat.fieldValue);
        if (stat.fieldValue[0] === '∑') {
          typeCalc = TYPE_CALC.BY_SUM_VALUE;
        }
        if (/∑\([A-Za-z0-9]]*\)/gim.test(stat.fieldValue)) {
          typeCalc = TYPE_CALC.BY_SUM_NUMBERS;
        } else if (/([A-Za-z0-9-.]+)\s*\|\|\s*([A-Za-z0-9-.]+)*/gim.test(stat.fieldValue)) {
          typeCalc = TYPE_CALC.BY_MULTIPLE_VALUES;
        }

        for (const exField of extraFieldsForIssue) {
          // data-tooltip has been removed at some version and title attribute has been added
          // so we need to get value from both attributes to work on different versions of jira
          const tooltipAttr = exField.getAttribute('data-tooltip') || exField.getAttribute('title');
          const fieldName = tooltipAttr?.split(':')[0];
          let countValues: number;

          switch (typeCalc) {
            case TYPE_CALC.BY_SUM_VALUE:
              countValues = this.getCountValuesFromExtraField(exField as HTMLElement, fieldValue);
              break;
            case TYPE_CALC.BY_SUM_NUMBERS:
              countValues = this.getSumNumberValueFromExtraField(exField as HTMLElement);
              break;
            case TYPE_CALC.BY_MULTIPLE_VALUES:
              countValues = this.getHasOneOfValuesFromExtraField(exField as HTMLElement, fieldValue);
              break;
            default:
              // TYPE_CALC.BY_CARD
              countValues = this.getHasValueFromExtraField(exField as HTMLElement, fieldValue);
              break;
          }

          if (fieldName === fieldNameSt) {
            stats[fieldLimitKey].issues.push({
              countValues,
              issue: issue as HTMLElement,
            });
            stats[fieldLimitKey].typeCalc = typeCalc;
          }
        }
      });
    });
  }

  getLimitsStats(): Record<string, LimitStats> {
    const stats = mapObj((value: LimitStats) => ({
      ...value,
      issues: [],
    }))(this.fieldLimits!.limits) as Record<string, LimitStats>;

    if (this.hasCustomswimlanes()) {
      document.querySelectorAll(DOM.swimlane).forEach(swimlane => {
        const swimlaneId = swimlane.getAttribute('swimlane-id');

        swimlane.querySelectorAll(FieldLimitsSettingsPage.jiraSelectors.column).forEach(column => {
          this.countAmountPersonalIssuesInColumn(column as HTMLElement, stats, swimlaneId!);
        });
      });

      return stats;
    }

    document.querySelectorAll(FieldLimitsSettingsPage.jiraSelectors.column).forEach(column => {
      this.countAmountPersonalIssuesInColumn(column as HTMLElement, stats);
    });

    return stats;
  }
}
