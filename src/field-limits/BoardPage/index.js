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
};
export default class FieldLimitsSettingsPage extends PageModification {
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

  shouldApply() {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId() {
    return `board-page-field-limits-${this.getBoardId()}`;
  }

  waitForLoading() {
    return this.waitForElement(FieldLimitsSettingsPage.jiraSelectors.swimlane);
  }

  async loadData() {
    const boardData = await this.getBoardEditData();
    const fieldLimits = (await this.getBoardProperty(BOARD_PROPERTIES.FIELD_LIMITS)) || { limits: {} };
    return [boardData, fieldLimits];
  }

  apply(data) {
    if (!data) return;
    const [boardData = {}, fieldLimits] = data;
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

  applyLimits() {
    const limitsStats = this.getLimitsStats();

    this.doColorCardsIssue(limitsStats);
    this.applyLimitsList(limitsStats);
  }

  getSumValues(stat) {
    return stat.issues.reduce((acc, issue) => acc + issue.countValues, 0);
  }

  doColorCardsIssue(limitsStats) {
    Object.keys(limitsStats).forEach(limitKey => {
      const stat = limitsStats[limitKey];
      if (isEmpty(stat.issues)) return;

      const sumCountValues = this.getSumValues(stat);

      if (sumCountValues > stat.limit)
        stat.issues.forEach(({ issue, countValues }) => {
          if (countValues === 0) return;
          issue.style.backgroundColor = COLORS.OVER_WIP_LIMITS;
        });
    });
  }

  checkIfLimitsAreApplied() {
    if (!document.body.contains(this.fieldLimitsList)) {
      const limitsStats = this.getLimitsStats();
      this.applyLimitsList(limitsStats);
    }
  }

  applyLimitsList(limitsStats) {
    if (!this.fieldLimitsList || !document.body.contains(this.fieldLimitsList)) {
      if (!document.querySelector(FieldLimitsSettingsPage.jiraSelectors.subnavTitle)) {
        return;
      }
      this.fieldLimitsList = this.insertHTML(
        document.querySelector(FieldLimitsSettingsPage.jiraSelectors.subnavTitle),
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
                limitValue: limitsStats[limitKey].limit,
                issuesCountClass: FieldLimitsSettingsPage.classes.issuesCount,
              });
            })
            .join(''),
        })
      );
    }

    this.fieldLimitsList.getElementsByClassName(FieldLimitsSettingsPage.classes.fieldLimitsBlock).forEach(fieldNode => {
      const limitKey = fieldNode.getAttribute('data-field-limit-key');
      const { fieldValue, fieldId } = limitsKey.decode(limitKey);
      const stat = limitsStats[limitKey];
      const currentIssueNode = fieldNode.querySelector(`.${FieldLimitsSettingsPage.classes.issuesCount}`);

      if (!fieldId || !fieldValue) return;

      const sumValues = this.getSumValues(stat);
      const limitOfFieldIssuesOnBoard = stat.limit;

      switch (Math.sign(limitOfFieldIssuesOnBoard - sumValues)) {
        case -1:
          currentIssueNode.style.backgroundColor = COLORS.OVER_WIP_LIMITS;
          break;
        case 0:
          currentIssueNode.style.backgroundColor = COLORS.ON_THE_LIMIT;
          break;
        default:
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
          fieldName: this.normalizedExtraFields.byId[fieldId].name,
        })
      );
    });
  }

  hasCustomswimlanes() {
    const someswimlane = document.querySelector(DOM.swimlaneHeaderContainer);

    if (someswimlane == null) {
      return false;
    }

    return someswimlane.getAttribute('aria-label').indexOf('custom:') !== -1;
  }

  // Pro, Pro^2
  getCountValuesFromExtraField(exField, value) {
    // find all variants this value
    let result = 0;
    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        const search = el.innerText.split(',');
        search.forEach(txt => {
          // sample: Team^2 - it is count = 2, Team it is count = 1
          const itemVal = txt.trim().split('^');
          const type = itemVal[0].trim();
          // eslint-disable-next-line prefer-template
          const numb = (itemVal[1] + '').trim();
          const count = /^[0-9]*$/.test(numb) ? Number(numb) : 1;
          if (value === type) {
            result += count;
          }
        });
      });
    }
    return result;
  }

  getHasValueFromExtraField(exField, value) {
    let result = false;
    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        result = result || el.innerText.split(',').reduce((acc, val) => acc || val.trim() === value, false);
      });
    }
    return result ? 1 : 0;
  }

  getSumNumberValueFromExtraField(exField) {
    let result = 0;
    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        const val = Number.parseFloat(el.innerText);
        result += Number.isNaN(val) ? 0 : val;
      });
    }
    return result;
  }

  getHasOneOfValuesFromExtraField(exField, value) {
    let result = false;
    const pattern = /\s*\|\|\s*/;
    const values = value.split(pattern);

    if (exField.childNodes instanceof NodeList) {
      exField.childNodes.forEach(el => {
        result =
          result || el.innerText.split(',').reduce((acc, val) => values.some(v => v === val.trim()) || acc, false);
      });
    }
    return result ? 1 : 0;
  }

  countAmountPersonalIssuesInColumn(column, stats, swimlaneId) {
    const { columnId } = column.dataset;

    column.querySelectorAll(this.cssSelectorOfIssues).forEach(issue => {
      const extraFieldsForIssue = issue.querySelectorAll(FieldLimitsSettingsPage.jiraSelectors.extraField);

      Object.keys(stats).forEach(fieldLimitKey => {
        const stat = stats[fieldLimitKey];

        if (!stat.columns.includes(columnId)) return;
        if (swimlaneId && !stat.swimlanes.includes(swimlaneId)) return;

        const fieldNameSt = this.normalizedExtraFields.byId[stat.fieldId].name;
        const fieldValue = stat.fieldValue.replace(/^∑/, '');

        let typeCalc = TYPE_CALC.BY_CARD;
        window.console.info('countAmountPersonalIssuesInColumn:', stat.fieldValue);
        if (stat.fieldValue[0] === '∑') {
          typeCalc = TYPE_CALC.BY_SUM_VALUE;
        }
        if (/∑\([A-Za-z0-9]]*\)/gim.test(stat.fieldValue)) {
          typeCalc = TYPE_CALC.BY_SUM_NUMBERS;
        }
        if (/([A-Za-z0-9-.]+)(\s*\|\|\s*([A-Za-z0-9-.]+))*/gim.test(stat.fieldValue)) {
          typeCalc = TYPE_CALC.BY_MULTIPLE_VALUES;
        }

        for (const exField of extraFieldsForIssue) {
          const tooltipAttr = exField.getAttribute('data-tooltip');
          const fieldName = tooltipAttr.split(':')[0];
          let countValues;

          switch (typeCalc) {
            case TYPE_CALC.BY_SUM_VALUE:
              countValues = this.getCountValuesFromExtraField(exField, fieldValue);
              break;
            case TYPE_CALC.BY_SUM_NUMBERS:
              countValues = this.getSumNumberValueFromExtraField(exField);
              break;
            case TYPE_CALC.BY_MULTIPLE_VALUES:
              countValues = this.getHasOneOfValuesFromExtraField(exField, fieldValue);
              break;
            default:
              // TYPE_CALC.BY_CARD
              countValues = this.getHasValueFromExtraField(exField, fieldValue);
              break;
          }

          if (fieldName === fieldNameSt) {
            stats[fieldLimitKey].issues.push({
              // eslint-disable-next-line no-nested-ternary, prettier/prettier
              countValues,
              issue,
            });
            stats[fieldLimitKey].typeCalc = typeCalc;
          }
        }
      });
    });
  }

  getLimitsStats() {
    const stats = mapObj(value => ({
      ...value,
      issues: [],
    }))(this.fieldLimits.limits);

    if (this.hasCustomswimlanes()) {
      document.querySelectorAll(DOM.swimlane).forEach(swimlane => {
        const swimlaneId = swimlane.getAttribute('swimlane-id');

        swimlane.querySelectorAll(FieldLimitsSettingsPage.jiraSelectors.column).forEach(column => {
          this.countAmountPersonalIssuesInColumn(column, stats, swimlaneId);
        });
      });

      return stats;
    }

    document.querySelectorAll(FieldLimitsSettingsPage.jiraSelectors.column).forEach(column => {
      this.countAmountPersonalIssuesInColumn(column, stats);
    });

    return stats;
  }
}
