/**
 * @module BoardRuntimeModel
 *
 * Runtime stats and board styling for column WIP limits.
 * DOM only via IBoardPagePageObject; counting uses getIssueCountInColumn.
 */
import type { GroupStats } from './types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { Logger } from 'src/infrastructure/logging/Logger';
import { findGroupByColumnId, generateColorByFirstChars } from '../../shared/utils';
import styles from '../styles.module.css';

const HEADER_GROUP_BG = '#deebff';
const OVER_LIMIT_CELL_BG = '#ff5630';

export class BoardRuntimeModel {
  groupStats: GroupStats[] = [];

  cssNotIssueSubTask: string = '';

  private _pageObject: IBoardPagePageObject | null = null;

  constructor(
    private propertyModel: PropertyModel,
    private logger: Logger
  ) {
    this._pageObject = null;
  }

  setPageObject(po: IBoardPagePageObject): void {
    this._pageObject = po;
  }

  private get po(): IBoardPagePageObject {
    return this._pageObject!;
  }

  apply(): void {
    const log = this.logger.getPrefixedLog('BoardRuntimeModel.apply');
    this.calculateStats();
    this.applyColumnHeaderStyles();
    this.applyLimitIndicators();
    log(`Applied (${this.groupStats.length} groups)`);
  }

  calculateStats(): GroupStats[] {
    const propertyData = this.propertyModel.data;
    const allSwimlaneIds = this.po.getSwimlaneIds();
    const stats: GroupStats[] = [];

    Object.entries(propertyData).forEach(([groupName, group]) => {
      const { columns, max, customHexColor, warningColor, includedIssueTypes, swimlanes } = group;
      if (!columns || columns.length === 0 || !max) return;

      const groupSwimlaneIds = swimlanes?.map(s => s.id) ?? [];
      const ignoredSwimlanes =
        groupSwimlaneIds.length === 0 ? [] : allSwimlaneIds.filter(id => !groupSwimlaneIds.includes(id));

      const currentCount = columns.reduce(
        (acc, columnId) =>
          acc +
          this.po.getIssueCountInColumn(columnId, {
            ignoredSwimlanes,
            includedIssueTypes,
            cssFilter: this.cssNotIssueSubTask,
          }),
        0
      );

      stats.push({
        groupId: groupName,
        groupName,
        columns,
        currentCount,
        limit: max,
        isOverLimit: currentCount > max,
        color: customHexColor || generateColorByFirstChars(groupName),
        warningColor,
        ignoredSwimlanes,
      });
    });

    this.groupStats = stats;
    return stats;
  }

  applyColumnHeaderStyles(): void {
    const boardGroups: Record<string, { columns: string[]; customHexColor?: string }> = {};
    this.groupStats.forEach(stat => {
      boardGroups[stat.groupId] = {
        columns: stat.columns,
        customHexColor: stat.color,
      };
    });

    const columnsInOrder = this.po.getOrderedColumnIds();

    columnsInOrder.forEach(columnId => {
      this.po.resetColumnHeaderStyles(columnId);
    });

    columnsInOrder.forEach((columnId, index) => {
      const { name, value } = findGroupByColumnId(columnId, boardGroups);
      if (!name || !value?.length) return;

      const leftCol = index > 0 ? columnsInOrder[index - 1] : undefined;
      const rightCol = index < columnsInOrder.length - 1 ? columnsInOrder[index + 1] : undefined;
      const columnByLeft = leftCol !== undefined ? findGroupByColumnId(leftCol, boardGroups) : {};
      const columnByRight = rightCol !== undefined ? findGroupByColumnId(rightCol, boardGroups) : {};

      const groupColor = boardGroups[name].customHexColor;
      if (!groupColor) return;

      const headerStyles: Partial<CSSStyleDeclaration> = {
        backgroundColor: HEADER_GROUP_BG,
        borderTop: `4px solid ${groupColor}`,
      };

      if (columnByLeft.name !== name) {
        headerStyles.borderTopLeftRadius = '10px';
      }
      if (columnByRight.name !== name) {
        headerStyles.borderTopRightRadius = '10px';
      }

      this.po.styleColumnHeader(columnId, headerStyles);
    });
  }

  applyLimitIndicators(): void {
    const columnsInOrder = this.po.getOrderedColumnIds();

    columnsInOrder.forEach(columnId => {
      this.po.removeColumnHeaderElements(columnId, '[data-column-limits-badge]');
      this.po.removeColumnHeaderElements(columnId, '[data-jh-group-label]');
      this.po.resetColumnCellStyles(columnId);
    });

    this.groupStats.forEach(stat => {
      if (stat.isOverLimit) {
        stat.columns.forEach(columnId => {
          this.po.highlightColumnCells(columnId, stat.warningColor || OVER_LIMIT_CELL_BG, stat.ignoredSwimlanes);
        });
      }

      const columnIndices = stat.columns.map(columnId => columnsInOrder.indexOf(columnId)).filter(i => i !== -1);

      if (columnIndices.length === 0) return;

      const leftTailColumnIndex = Math.min(...columnIndices);
      const leftTailColumnId = columnsInOrder[leftTailColumnIndex];
      if (!leftTailColumnId) return;

      const badgeClass = styles.limitColumnBadge ?? 'limitColumnBadge';
      const groupLabelClass = styles.limitGroupLabel ?? 'limitGroupLabel';
      const labelBg = stat.isOverLimit && stat.warningColor ? stat.warningColor : stat.color;
      const groupLabelHtml = `
          <div class="${groupLabelClass}" data-column-limits-label="${stat.groupId}" title="${stat.groupName}" style="position:relative;display:flex;align-items:center;gap:4px;padding:2px 8px;font-size:12px;font-weight:600;color:#172b4d;background:${labelBg};color:#fff;border-radius:4px 4px 0 0">
            <span class="groupName" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0">${stat.groupName}</span>
            <span class="${badgeClass}" style="position:static;margin:0;padding:0 4px;font-size:11px;background:rgba(0,0,0,0.2);border-radius:3px">${stat.currentCount}/${stat.limit}</span>
          </div>`;
      this.po.insertBeforeColumn(leftTailColumnId, groupLabelHtml);
    });
  }

  setCssNotIssueSubTask(css: string): void {
    this.cssNotIssueSubTask = css;
  }

  reset(): void {
    this.groupStats = [];
    this.cssNotIssueSubTask = '';
  }
}
