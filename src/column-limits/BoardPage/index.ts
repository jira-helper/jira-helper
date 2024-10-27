import map from '@tinkoff/utils/array/map';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { mergeSwimlaneSettings } from '../../swimlane/utils';
import { findGroupByColumnId, generateColorByFirstChars } from '../shared/utils';
import styles from './styles.module.css';

interface EditData {
  rapidListConfig: {
    mappedColumns: Array<{
      id: string;
      isKanPlanColumn: boolean;
      max?: number;
    }>;
  };
}

interface BoardGroup {
  [key: string]: {
    columns: string[];
    max?: number;
    customHexColor?: string;
    name: string;
    value: string;
  };
}

interface SwimlanesSettings {
  [key: string]: {
    ignoreWipInColumns: boolean;
  };
}

export default class extends PageModification<[EditData?, BoardGroup?, SwimlanesSettings?], Element> {
  private boardGroups: BoardGroup | null = null;

  private swimlanesSettings: SwimlanesSettings | null = null;

  private mappedColumns: EditData['rapidListConfig']['mappedColumns'] | null = null;

  private cssNotIssueSubTask: string | null = null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `add-wip-limits-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-column-header-group');
  }

  loadData(): Promise<[EditData, BoardGroup, SwimlanesSettings]> {
    return Promise.all([
      this.getBoardEditData(),
      this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS),
      Promise.all([
        this.getBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS),
        this.getBoardProperty(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS),
      ]).then(mergeSwimlaneSettings),
    ]);
  }

  apply(data: [EditData?, BoardGroup?, SwimlanesSettings?]): void {
    if (!data) return;
    const [editData = { rapidListConfig: { mappedColumns: [] } }, boardGroups = {}, swimlanesSettings = {}] = data;
    this.boardGroups = boardGroups;
    this.swimlanesSettings = swimlanesSettings;
    this.mappedColumns = editData.rapidListConfig.mappedColumns.filter(({ isKanPlanColumn }) => !isKanPlanColumn);
    this.cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);

    this.styleColumnHeaders();
    this.styleColumnsWithLimitations();

    this.onDOMChange('#ghx-pool', () => {
      this.styleColumnHeaders();
      this.styleColumnsWithLimitations();
    });
  }

  styleColumnHeaders(): void {
    if (!this.boardGroups) return;

    const columnsInOrder = this.getOrderedColumns();
    // for jira v8 header.
    // One of the parents has overflow: hidden
    const headerGroup = document.querySelector<HTMLElement>('#ghx-pool-wrapper');

    if (headerGroup != null) {
      headerGroup.style.paddingTop = '10px';
    }

    columnsInOrder.forEach((columnId, index) => {
      // check for ts
      if (!this.boardGroups) return;
      const { name, value } = findGroupByColumnId(columnId, this.boardGroups);

      if (!name || !value) return;

      const columnByLeft = findGroupByColumnId(columnsInOrder[index - 1], this.boardGroups);
      const columnByRight = findGroupByColumnId(columnsInOrder[index + 1], this.boardGroups);

      const isColumnByLeftWithSameGroup = columnByLeft.name !== name;
      const isColumnByRightWithSameGroup = columnByRight.name !== name;

      if (isColumnByLeftWithSameGroup)
        document.querySelector<HTMLElement>(`.ghx-column[data-id="${columnId}"]`)!.style.borderTopLeftRadius = '10px';
      if (isColumnByRightWithSameGroup)
        document.querySelector<HTMLElement>(`.ghx-column[data-id="${columnId}"]`)!.style.borderTopRightRadius = '10px';

      const groupColor = this.boardGroups[name].customHexColor || generateColorByFirstChars(name);
      Object.assign(document.querySelector<HTMLElement>(`.ghx-column[data-id="${columnId}"]`)!.style, {
        backgroundColor: '#deebff',
        borderTop: `4px solid ${groupColor}`,
      });
    });
  }

  getIssuesInColumn(columnId: string, ignoredSwimlanes: string[]): number {
    const swimlanesFilter = ignoredSwimlanes.map(swimlaneId => `:not([swimlane-id="${swimlaneId}"])`).join('');

    return document.querySelectorAll(
      `.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"] .ghx-issue:not(.ghx-done)${this.cssNotIssueSubTask}`
    ).length;
  }

  styleColumnsWithLimitations(): void {
    const columnsInOrder = this.getOrderedColumns();
    if (!columnsInOrder.length) return;
    if (!this.swimlanesSettings || !this.boardGroups) return;

    const ignoredSwimlanes = Object.keys(this.swimlanesSettings).filter(
      swimlaneId => this.swimlanesSettings![swimlaneId].ignoreWipInColumns
    );
    const swimlanesFilter = ignoredSwimlanes.map(swimlaneId => `:not([swimlane-id="${swimlaneId}"])`).join('');

    Object.values(this.boardGroups).forEach(group => {
      const { columns: groupColumns, max: groupLimit } = group;
      if (!groupColumns || !groupLimit) return;

      const amountOfGroupTasks = groupColumns.reduce(
        (acc, columnId) => acc + this.getIssuesInColumn(columnId, ignoredSwimlanes),
        0
      );

      if (groupLimit < amountOfGroupTasks) {
        groupColumns.forEach(columnId => {
          document
            .querySelectorAll<HTMLElement>(`.ghx-swimlane${swimlanesFilter} .ghx-column[data-column-id="${columnId}"]`)
            .forEach(el => {
              el.style.backgroundColor = '#ff5630';
            });
        });
      }

      const leftTailColumnIndex = Math.min(
        ...groupColumns.map(columnId => columnsInOrder.indexOf(columnId)).filter(index => index != null)
      );
      const leftTailColumnId = columnsInOrder[leftTailColumnIndex];

      if (!leftTailColumnId) {
        // throw `Need rebuild WIP-limits of columns. WIP-limits used not exists column ${leftTailColumnId}`;
        return;
      }

      this.insertHTML(
        document.querySelector(`.ghx-column[data-id="${leftTailColumnId}"]`)!,
        'beforeend',
        `
          <span class="${styles.limitColumnBadge}">
              ${amountOfGroupTasks}/${groupLimit}
              <span class="${styles.limitColumnBadge__hint}">Issues per group / Max number of issues per group</span>
          </span>`
      );
    });

    this.mappedColumns!.filter(column => column.max).forEach(column => {
      const totalIssues = this.getIssuesInColumn(column.id, []);
      const filteredIssues = this.getIssuesInColumn(column.id, ignoredSwimlanes);

      if (column.max && totalIssues > Number(column.max) && filteredIssues <= Number(column.max)) {
        const columnHeaderElement = document.querySelector<HTMLElement>(`.ghx-column[data-id="${column.id}"]`);
        columnHeaderElement?.classList.remove('ghx-busted', 'ghx-busted-max');

        // задачи в облачной джире
        document.querySelectorAll<HTMLElement>(`.ghx-column[data-column-id="${column.id}"]`).forEach(issue => {
          issue.classList.remove('ghx-busted', 'ghx-busted-max');
        });
      }
    });
  }

  getOrderedColumns(): string[] {
    return map(
      (column: HTMLElement) => column.dataset.columnId as string,
      document.querySelectorAll<HTMLElement>('.ghx-first ul.ghx-columns > li.ghx-column')
    );
  }
}
