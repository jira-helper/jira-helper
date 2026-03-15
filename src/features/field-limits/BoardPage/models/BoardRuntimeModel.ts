/**
 * @module BoardRuntimeModel
 *
 * Valtio-модель для runtime-подсчёта field limits на доске.
 * Объединяет данные из PropertyModel, DOM-запросы через PageObject и pure functions.
 * Управляет card coloring.
 */
import { Result, Ok, Err } from 'ts-results';
import type { FieldLimitsSettings, FieldLimitStats, CardLayoutField, BoardEditData, CalcType } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IFieldLimitsBoardPageObject } from '../page-objects/FieldLimitsBoardPageObject';
import type { IBoardPagePageObject } from 'src/page-objects/BoardPage';
import type { Logger } from 'src/shared/Logger';
import { COLORS } from 'src/shared/constants';
import { calculateFieldValue } from '../../utils/calculateFieldValue';

export class BoardRuntimeModel {
  settings: FieldLimitsSettings = { limits: {} };
  stats: Record<string, FieldLimitStats> = {};
  isInitialized: boolean = false;
  cardLayoutFields: CardLayoutField[] = [];
  cssSelectorOfIssues: string = '.ghx-issue';

  constructor(
    private propertyModel: PropertyModel,
    private fieldLimitsPageObject: IFieldLimitsBoardPageObject,
    private boardPageObject: IBoardPagePageObject,
    private logger: Logger
  ) {}

  async initialize(boardEditData: BoardEditData): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('BoardRuntimeModel.initialize');

    const settingsResult = await this.propertyModel.load();
    if (settingsResult.err) {
      return Err(settingsResult.val);
    }

    this.settings = settingsResult.val;
    this.cardLayoutFields = boardEditData.cardLayoutConfig?.currentFields ?? [];
    this.cssSelectorOfIssues = this.getCssSelectorOfIssues(boardEditData);
    this.isInitialized = true;

    this.recalculate();

    log('Initialized');
    return Ok(undefined);
  }

  private getCssSelectorOfIssues(boardData: BoardEditData): string {
    if (boardData.rapidListConfig?.currentStatisticsField?.typeId === 'issueCountExclSubs') {
      return '.ghx-issue:not(.ghx-issue-subtask)';
    }
    return '.ghx-issue';
  }

  private getFieldNameById(fieldId: string): string | undefined {
    return this.cardLayoutFields.find(f => f.fieldId === fieldId)?.name;
  }

  /**
   * Пересчитать все stats по DOM.
   */
  recalculate(): void {
    const log = this.logger.getPrefixedLog('BoardRuntimeModel.recalculate');
    const newStats: Record<string, FieldLimitStats> = {};

    for (const [limitKey, limit] of Object.entries(this.settings.limits)) {
      const { calcType, fieldValue } = limit;
      const fieldName = this.getFieldNameById(limit.fieldId);

      if (!fieldName) continue;

      const issues: Array<{ issue: Element; countValues: number }> = [];

      const columns = limit.columns.length > 0 ? limit.columns : this.getAllColumnIds();
      const { swimlanes } = limit;
      const hasCustomSwimlanes = this.hasCustomSwimlanes();

      if (hasCustomSwimlanes && swimlanes.length > 0) {
        for (const swimlaneId of swimlanes) {
          const swimlaneEl = document.querySelector(`.ghx-swimlane[swimlane-id="${swimlaneId}"]`);
          if (!swimlaneEl) continue;

          for (const columnId of columns) {
            const columnEl = swimlaneEl.querySelector(`[data-column-id="${columnId}"]`);
            if (!columnEl) continue;

            this.countIssuesInColumn(columnEl, fieldName, fieldValue, calcType, issues);
          }
        }
      } else {
        const columnSelector = '.ghx-column';
        document.querySelectorAll(columnSelector).forEach(columnEl => {
          const { columnId } = (columnEl as HTMLElement).dataset;
          if (!columnId || !columns.includes(columnId)) return;

          if (hasCustomSwimlanes) {
            const swimlaneEl = columnEl.closest('.ghx-swimlane');
            const swimlaneId = swimlaneEl?.getAttribute('swimlane-id');
            if (swimlanes.length > 0 && swimlaneId && !swimlanes.includes(swimlaneId)) return;
          }

          this.countIssuesInColumn(columnEl, fieldName, fieldValue, calcType, issues);
        });
      }

      const current = issues.reduce((acc, i) => acc + i.countValues, 0);

      newStats[limitKey] = {
        current,
        limit: limit.limit,
        isOverLimit: current > limit.limit,
        isOnLimit: current === limit.limit,
        calcType,
        issues,
      };
    }

    this.stats = newStats;
    this.colorCards();

    log(`Recalculated ${Object.keys(newStats).length} limits`);
  }

  private countIssuesInColumn(
    columnEl: Element,
    fieldName: string,
    fieldValue: string,
    calcType: CalcType,
    issues: Array<{ issue: Element; countValues: number }>
  ): void {
    columnEl.querySelectorAll(this.cssSelectorOfIssues).forEach(issue => {
      const extraFields = Array.from(issue.querySelectorAll(this.fieldLimitsPageObject.selectors.extraField));

      for (const extraField of extraFields) {
        const efFieldName = this.fieldLimitsPageObject.getFieldNameFromExtraField(extraField);
        if (efFieldName !== fieldName) continue;

        const texts = this.fieldLimitsPageObject.getExtraFieldTexts(extraField);
        const countValues = calculateFieldValue(texts, fieldValue, calcType);

        if (countValues > 0) {
          issues.push({ issue, countValues });
        }
      }
    });
  }

  private getAllColumnIds(): string[] {
    const ids: string[] = [];
    document.querySelectorAll('.ghx-column').forEach(col => {
      const id = (col as HTMLElement).dataset.columnId;
      if (id) ids.push(id);
    });
    return [...new Set(ids)];
  }

  private hasCustomSwimlanes(): boolean {
    const header = document.querySelector('.ghx-swimlane-header');
    if (!header) return false;
    return header.getAttribute('aria-label')?.includes('custom:') ?? false;
  }

  /**
   * Покрасить карточки превышающих лимитов.
   */
  colorCards(): void {
    for (const stats of Object.values(this.stats)) {
      for (const { issue } of stats.issues) {
        this.fieldLimitsPageObject.resetCardColor(issue);
      }
    }

    for (const stats of Object.values(this.stats)) {
      if (!stats.isOverLimit) continue;
      for (const { issue, countValues } of stats.issues) {
        if (countValues === 0) continue;
        this.fieldLimitsPageObject.colorCard(issue, COLORS.OVER_WIP_LIMITS);
      }
    }
  }

  destroy(): void {
    for (const stats of Object.values(this.stats)) {
      for (const { issue } of stats.issues) {
        this.fieldLimitsPageObject.resetCardColor(issue);
      }
    }
    this.reset();
  }

  reset(): void {
    this.settings = { limits: {} };
    this.stats = {};
    this.cardLayoutFields = [];
    this.isInitialized = false;
  }

  // === Queries ===

  getLimitStats(limitKey: string): FieldLimitStats | undefined {
    return this.stats[limitKey];
  }

  isOverLimit(limitKey: string): boolean {
    return this.stats[limitKey]?.isOverLimit ?? false;
  }

  getBadgeColor(limitKey: string): string {
    const stats = this.stats[limitKey];
    if (!stats) return COLORS.BELOW_THE_LIMIT;

    if (stats.isOverLimit) return COLORS.OVER_WIP_LIMITS;
    if (stats.isOnLimit) return COLORS.ON_THE_LIMIT;
    return COLORS.BELOW_THE_LIMIT;
  }

  getBadgeText(limitKey: string): string {
    const stats = this.stats[limitKey];
    if (!stats) return '';
    return `${stats.current}/${stats.limit}`;
  }
}
