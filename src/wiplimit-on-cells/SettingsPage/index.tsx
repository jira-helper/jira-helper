import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { globalContainer } from 'dioma';
import { WithDi } from '../../shared/diContext';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { getOrCreateButtonsContainer } from '../../shared/settingsPageButtonsContainer';
import { SettingsButtonContainer } from './components/SettingsButton';
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
    /** Jira columns config container */
    columnsConfig: '#ghx-config-columns',
    /** Last child in columns config - insert button before it */
    columnsConfigLastChild: '#ghx-config-columns > *:last-child',
  };

  private root: Root | null = null;

  getModificationId(): string {
    return `WipLimitOnCells-settings-${this.getBoardId()}`;
  }

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
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

    // Normalize ranges for backward compatibility
    const ranges: WipLimitRange[] = (rawRanges ?? []).map(normalizeRange);

    // Extract swimlanes and columns
    const swimlanes = boardEditData.swimlanesConfig?.swimlanes ?? [];
    const columns = (boardEditData.rapidListConfig?.mappedColumns ?? []).filter(col => !col.isKanPlanColumn);

    const sharedContainer = getOrCreateButtonsContainer();
    const buttonContainer = document.createElement('div');
    sharedContainer.appendChild(buttonContainer);

    // Save callback
    const handleSaveToProperty = async (newRanges: WipLimitRange[]) => {
      await this.updateBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_CELLS, newRanges);
    };

    // Render React
    this.root = createRoot(buttonContainer);
    this.root.render(
      React.createElement(WithDi, {
        container: globalContainer,
        children: React.createElement(SettingsButtonContainer, {
          swimlanes,
          columns,
          initialRanges: ranges,
          onSaveToProperty: handleSaveToProperty,
        }),
      })
    );
  }
}
