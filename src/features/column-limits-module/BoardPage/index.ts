import type { Container } from 'dioma';
import { Token } from 'dioma';
import React from 'react';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { localeProviderToken } from 'src/shared/locale';
import { PageModification } from '../../../infrastructure/page-modification/PageModification';
import { BOARD_PROPERTIES } from '../../../shared/constants';
import type { WipLimitsProperty } from '../types';
import { boardRuntimeModelToken, propertyModelToken } from '../tokens';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import type { BoardRuntimeModel } from './models/BoardRuntimeModel';
import type { PropertyModel } from '../property/PropertyModel';
import { ColumnLimitsSettingsTab } from '../SettingsTab';
import { COLUMN_LIMITS_TEXTS } from '../SettingsPage/texts';

interface EditData {
  /** Present on Jira edit payload; not used to gate the helper panel tab. */
  canEdit?: boolean;
  rapidListConfig: {
    mappedColumns: Array<{
      id: string;
      isKanPlanColumn: boolean;
      max?: number;
    }>;
  };
  swimlanesConfig?: {
    swimlanes?: Array<{ id?: string; name: string }>;
  };
}

function getColumnLimitsSettingsTabTitle(container: Container): string {
  const settingsLocale = useLocalSettingsStore.getState().settings.locale;
  const locale: 'en' | 'ru' =
    settingsLocale !== 'auto'
      ? settingsLocale
      : container.inject(localeProviderToken).getJiraLocale() === 'ru'
        ? 'ru'
        : 'en';
  return COLUMN_LIMITS_TEXTS.tabTitle[locale];
}

export default class ColumnLimitsBoardPage extends PageModification<[EditData?, WipLimitsProperty?], Element> {
  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `add-wip-limits-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    const po = this.container.inject(boardPagePageObjectToken);
    return this.waitForElement(po.selectors.columnHeader);
  }

  async loadData(): Promise<[EditData, WipLimitsProperty]> {
    const editData = await this.getBoardEditData();
    const boardProperty = await this.getBoardProperty<WipLimitsProperty>(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS);
    return [editData, boardProperty ?? {}];
  }

  apply(data: [EditData?, WipLimitsProperty?]): void {
    if (!data) return;
    const [editData = { rapidListConfig: { mappedColumns: [] } }, boardGroups = {}] = data;

    const { model: propertyModel } = this.container.inject(propertyModelToken);
    (propertyModel as PropertyModel).setData(boardGroups);

    // Settings tab is registered regardless of `canEdit`: viewers can inspect and
    // tweak locally (same pattern as person-limits); persistence may fail without edit rights.
    const rawSwimlanes = (editData as EditData).swimlanesConfig?.swimlanes ?? [];
    const swimlanes = rawSwimlanes.map((swim, index) => ({
      id: String(swim.id ?? swim.name ?? `swimlane-${index}`),
      name: swim.name,
    }));

    const TabComponent = () => React.createElement(ColumnLimitsSettingsTab, { swimlanes });

    registerSettings({
      title: getColumnLimitsSettingsTabTitle(this.container),
      component: TabComponent,
    });

    const { model: boardRuntimeModel } = this.container.inject(boardRuntimeModelToken);

    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    (boardRuntimeModel as BoardRuntimeModel).setCssNotIssueSubTask(cssNotIssueSubTask);

    const po = this.container.inject(boardPagePageObjectToken);
    (boardRuntimeModel as BoardRuntimeModel).setPageObject(po);

    try {
      (boardRuntimeModel as BoardRuntimeModel).apply();
      const poolSelector = document.querySelector(po.selectors.pool)
        ? po.selectors.pool
        : '[data-testid="software-board.board-area"]';
      (this as any)._columnRaf = null;
      this.onDOMChange(poolSelector, () => {
        if ((this as any)._columnRaf) return;
        (this as any)._columnRaf = requestAnimationFrame(() => {
          (this as any)._columnRaf = null;
          (boardRuntimeModel as BoardRuntimeModel).apply();
        });
      }, { childList: true, subtree: true });
    } catch (error) {
      console.warn('[ColumnLimitsBoardPage] BoardRuntimeModel не поддерживается на этой версии Jira:', error);
    }

    if (Object.keys(boardGroups).length === 0) return;
  }
}

export const columnLimitsBoardPageToken = new Token<ColumnLimitsBoardPage>('ColumnLimitsBoardPage');
