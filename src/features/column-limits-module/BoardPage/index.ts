import type { Container } from 'dioma';
import { Token } from 'dioma';
import React from 'react';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { BOARD_SETTINGS_TAB_IDS } from 'src/features/board-settings/settingsTabIds';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { localeProviderToken } from 'src/shared/locale';
import { PageModification } from '../../../infrastructure/page-modification/PageModification';
import { boardPagePageObjectToken } from '../../../infrastructure/page-objects/BoardPage';
import { BOARD_PROPERTIES } from '../../../shared/constants';
import type { WipLimitsProperty } from '../types';
import { stripUnknownWipColumnIds } from '../shared/utils';
import { boardRuntimeModelToken, propertyModelToken } from '../tokens';
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

  async waitForLoading(): Promise<Element> {
    const po = this.container.inject(boardPagePageObjectToken);
    const pool = await this.waitForElement(po.selectors.pool);
    // Cloud hydrates cards after the board wrapper. Cap the wait so an empty board
    // (Server or Cloud) does not block the modification forever.
    if (po.columnHeaderRenderMode === 'cloud') {
      await Promise.race([
        this.waitForElement(po.selectors.issue, pool),
        new Promise<void>(resolve => {
          this.setTimeout(resolve, 2000);
        }),
      ]);
    }
    return pool;
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
    const knownColumnIds = editData.rapidListConfig.mappedColumns
      .filter(col => col.isKanPlanColumn !== true)
      .map(col => col.id);
    const { cleaned, changed } = stripUnknownWipColumnIds(boardGroups, knownColumnIds);
    (propertyModel as PropertyModel).setData(cleaned);
    if (changed) {
      void (propertyModel as PropertyModel).persist();
    }

    // Settings tab is registered regardless of `canEdit`: viewers can inspect and
    // tweak locally (same pattern as person-limits); persistence may fail without edit rights.
    const rawSwimlanes = (editData as EditData).swimlanesConfig?.swimlanes ?? [];
    const swimlanes = rawSwimlanes.map((swim, index) => ({
      id: String(swim.id ?? swim.name ?? `swimlane-${index}`),
      name: swim.name,
    }));

    const TabComponent = () => React.createElement(ColumnLimitsSettingsTab, { swimlanes });

    registerSettings({
      id: BOARD_SETTINGS_TAB_IDS.COLUMN_WIP_LIMITS,
      title: getColumnLimitsSettingsTabTitle(this.container),
      component: TabComponent,
    });

    if (Object.keys(cleaned).length === 0) return;

    const { model: boardRuntimeModel } = this.container.inject(boardRuntimeModelToken);

    const cssNotIssueSubTask = this.getCssSelectorNotIssueSubTask(editData);
    (boardRuntimeModel as BoardRuntimeModel).setCssNotIssueSubTask(cssNotIssueSubTask);

    const headerGroup = document.querySelector<HTMLElement>('#ghx-pool-wrapper');
    if (headerGroup) {
      headerGroup.style.paddingTop = '10px';
    }

    const applyRuntime = () => {
      (boardRuntimeModel as BoardRuntimeModel).apply();
    };
    applyRuntime();

    // Cloud board pool is board.content.board-wrapper (not #ghx-pool).
    const po = this.container.inject(boardPagePageObjectToken);
    const poolSelector = po.selectors?.pool ?? '#ghx-pool';
    if (document.querySelector(poolSelector)) {
      // Debounce + ignore our own badge DOM writes (apply inserts/removes the badge and
      // would otherwise recurse forever with subtree:true).
      let applyTimer: ReturnType<typeof setTimeout> | null = null;
      this.sideEffects.push(() => {
        if (applyTimer) clearTimeout(applyTimer);
      });

      const isOwnBadgeMutation = (mutations: MutationRecord[]) =>
        mutations.length > 0 &&
        mutations.every(mutation => {
          const nodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
          if (nodes.length === 0) return true;
          return nodes.every(node => {
            if (!(node instanceof Element)) {
              return node.parentElement?.closest('[data-column-limits-badge]') != null;
            }
            return (
              node.matches('[data-column-limits-badge]') ||
              node.querySelector('[data-column-limits-badge]') != null ||
              node.closest('[data-column-limits-badge]') != null
            );
          });
        });

      this.onDOMChange(
        poolSelector,
        mutations => {
          if (isOwnBadgeMutation(mutations)) return;
          if (applyTimer) clearTimeout(applyTimer);
          applyTimer = setTimeout(applyRuntime, 150);
        },
        { childList: true, subtree: true }
      );
    }
    // Cards can keep streaming in after the first issue appears — refresh once more.
    this.setTimeout(applyRuntime, 1500);
  }
}

export const columnLimitsBoardPageToken = new Token<ColumnLimitsBoardPage>('ColumnLimitsBoardPage');
