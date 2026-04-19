/**
 * @module SettingsUIModel
 *
 * Модель состояния UI настроек WIP-лимитов по колонкам.
 * Экземпляр оборачивается в `proxy()` при регистрации в DI.
 */
import type { Column, UIGroup, IssueTypeState, WipLimitsProperty, ColumnLimitGroup } from '../../types';
import { WITHOUT_GROUP_ID } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/infrastructure/logging/Logger';

export type InitFromPropertyData = {
  withoutGroupColumns: Column[];
  groups: UIGroup[];
  issueTypeSelectorStates?: Record<string, IssueTypeState>;
};

export class SettingsUIModel {
  withoutGroupColumns: Column[] = [];

  groups: UIGroup[] = [];

  issueTypeSelectorStates: Record<string, IssueTypeState> = {};

  state: 'initial' | 'loaded' = 'initial';

  constructor(
    private propertyModel: PropertyModel,
    private logger: Logger
  ) {}

  initFromProperty(data: InitFromPropertyData): void {
    this.withoutGroupColumns = data.withoutGroupColumns;
    this.groups = data.groups;
    this.state = 'loaded';

    if (data.issueTypeSelectorStates) {
      for (const [groupId, issueState] of Object.entries(data.issueTypeSelectorStates)) {
        this.issueTypeSelectorStates[groupId] = issueState;
      }
    }
  }

  async save(existingColumnIds: string[]): Promise<void> {
    const log = this.logger.getPrefixedLog('SettingsUIModel.save');
    const wipLimits: WipLimitsProperty = {};

    for (const group of this.groups) {
      const columnIds = group.columns.map(c => c.id).filter(id => existingColumnIds.includes(id));

      if (columnIds.length === 0) continue;

      const groupData: ColumnLimitGroup = {
        columns: columnIds,
        max: group.max,
        customHexColor: group.customHexColor,
        swimlanes: group.swimlanes?.length ? group.swimlanes : undefined,
      };

      const issueState = this.issueTypeSelectorStates[group.id];
      if (issueState) {
        if (!issueState.countAllTypes && issueState.selectedTypes.length > 0) {
          groupData.includedIssueTypes = issueState.selectedTypes;
        } else if (!issueState.countAllTypes) {
          groupData.includedIssueTypes = [];
        }
      }

      wipLimits[group.id] = groupData;
    }

    this.propertyModel.setData(wipLimits);
    const result = await this.propertyModel.persist();

    if (result.err) {
      log(`Failed to persist: ${result.val.message}`, 'error');
    } else {
      log('Saved');
    }
  }

  moveColumn(column: Column, fromGroupId: string, toGroupId: string): void {
    if (fromGroupId === WITHOUT_GROUP_ID) {
      this.withoutGroupColumns = this.withoutGroupColumns.filter(c => c.id !== column.id);
    } else {
      const fromGroup = this.groups.find(g => g.id === fromGroupId);
      if (fromGroup) {
        fromGroup.columns = fromGroup.columns.filter(c => c.id !== column.id);
        if (fromGroup.columns.length === 0) {
          this.groups = this.groups.filter(g => g.id !== fromGroupId);
        }
      }
    }

    if (toGroupId === WITHOUT_GROUP_ID) {
      this.withoutGroupColumns = [...this.withoutGroupColumns, column];
    } else {
      const toGroup = this.groups.find(g => g.id === toGroupId);
      if (toGroup) {
        toGroup.columns.push(column);
      } else {
        this.groups.push({
          id: toGroupId,
          columns: [column],
          max: 100,
        } as UIGroup);
      }
    }
  }

  setGroupLimit(groupId: string, limit: number): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group) group.max = limit;
  }

  setGroupColor(groupId: string, customHexColor: string): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group) group.customHexColor = customHexColor;
  }

  setGroupSwimlanes(groupId: string, swimlanes: Array<{ id: string; name: string }>): void {
    const group = this.groups.find(g => g.id === groupId);
    if (group) {
      group.swimlanes = swimlanes.length === 0 ? undefined : swimlanes;
    }
  }

  setIssueTypeState(groupId: string, issueState: IssueTypeState): void {
    this.issueTypeSelectorStates[groupId] = issueState;
  }

  reset(): void {
    this.withoutGroupColumns = [];
    this.groups = [];
    this.issueTypeSelectorStates = {};
    this.state = 'initial';
  }
}
