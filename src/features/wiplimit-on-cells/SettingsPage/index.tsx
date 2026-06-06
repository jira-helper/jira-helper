import React from 'react';
import { Token } from 'dioma';
import { WithDi } from '../../../infrastructure/di/diContext';
import { PageModification } from '../../../infrastructure/page-modification/PageModification';
import { BOARD_PROPERTIES } from '../../../shared/constants';
import { SettingsButtonContainer } from './components/SettingsButton';
import { settingsPagePageObjectToken } from 'src/infrastructure/page-objects/SettingsPage';
import { normalizeRange } from '../property/actions/loadProperty';
import type { WipLimitRange } from '../types';

type MappedColumn = {
  id: string;
  name: string;
  isKanPlanColumn?: boolean;
};

type BoardSwimlane = {
  id: string;
  name: string;
};

type BoardEditData = {
  swimlanesConfig: {
    swimlanes: BoardSwimlane[];
  };
  rapidListConfig: {
    mappedColumns: MappedColumn[];
  };
  canEdit: boolean;
};

/**
 * Legacy range type for backward compatibility.
 * Used only for loading old data format.
 */
type LegacyRange = {
  name: string;
  wipLimit: number;
  disable?: boolean;
  cells: Array<{
    column: string;
    showBadge: boolean;
    swimlane?: string;
    /** @deprecated backward compatibility - old typo in saved data */
    swimline?: string;
  }>;
  includedIssueTypes?: string[];
};

export default class WipLimitOnCellsSettings extends PageModification<[BoardEditData, LegacyRange[] | null], Element> {
  static jiraSelectors = {
    columnsConfig: '#ghx-config-columns',
  };

  getModificationId(): string {
    return `WipLimitOnCells-settings-${this.getBoardId()}`;
  }

  async shouldApply(): Promise<boolean> {
    return (await this.getSettingsTab()) === 'columns';
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(WipLimitOnCellsSettings.jiraSelectors.columnsConfig);
  }

  async loadData(): Promise<[BoardEditData, LegacyRange[] | null]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS)]);
  }

  apply(data: [BoardEditData, LegacyRange[] | null]): void {
    if (!data) return;
    const [boardEditData, rawRanges] = data;

    if (!boardEditData?.canEdit) return;

    const ranges: WipLimitRange[] = (rawRanges ?? []).map(normalizeRange);
    const swimlanes = boardEditData.swimlanesConfig?.swimlanes ?? [];
    const columns = (boardEditData.rapidListConfig?.mappedColumns ?? []).filter(col => !col.isKanPlanColumn);

    const handleSaveToProperty = async (newRanges: WipLimitRange[]) => {
      await this.updateBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS, newRanges);
    };

    const pageObject = this.container.inject(settingsPagePageObjectToken).getColumnsSettingsTabPageObject();

    const cleanup = pageObject.registerButton(
      'wiplimit-on-cells',
      React.createElement(WithDi, {
        container: this.container,
        children: React.createElement(SettingsButtonContainer, {
          swimlanes,
          columns,
          initialRanges: ranges,
          onSaveToProperty: handleSaveToProperty,
        }),
      })
    );

    this.sideEffects.push(cleanup);
  }
}

export const wipLimitOnCellsSettingsPageToken = new Token<WipLimitOnCellsSettings>('WipLimitOnCellsSettings');
