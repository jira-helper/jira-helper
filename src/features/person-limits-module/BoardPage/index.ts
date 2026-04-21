import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { Container } from 'dioma';
import { Token } from 'dioma';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { useLocalSettingsStore } from 'src/features/local-settings/stores/localSettingsStore';
import { localeProviderToken } from 'src/shared/locale';
import { WithDi } from '../../../infrastructure/di/diContext';
import { PageModification } from '../../../infrastructure/page-modification/PageModification';
import { BOARD_PROPERTIES } from '../../../shared/constants';
import { propertyModelToken, boardRuntimeModelToken } from '../tokens';
import { AvatarsContainer } from './components';
import type { PersonWipLimitsProperty_2_29 } from '../property';
import { PersonLimitsSettingsTab } from '../SettingsTab';
import { PERSON_LIMITS_TEXTS } from '../SettingsPage/texts';
import type { Column, Swimlane } from '../SettingsPage/state/types';

type PersonLimitData = PersonWipLimitsProperty_2_29;

type MappedColumn = {
  id: string;
  name: string;
  isKanPlanColumn?: boolean;
};

interface EditData {
  canEdit?: boolean;
  rapidListConfig?: {
    mappedColumns?: MappedColumn[];
  };
  swimlanesConfig?: {
    swimlanes?: Array<{ id?: string; name: string }>;
  };
}

function getPersonLimitsSettingsTabTitle(container: Container): string {
  const settingsLocale = useLocalSettingsStore.getState().settings.locale;
  const locale: 'en' | 'ru' =
    settingsLocale !== 'auto'
      ? settingsLocale
      : container.inject(localeProviderToken).getJiraLocale() === 'ru'
        ? 'ru'
        : 'en';
  return PERSON_LIMITS_TEXTS.tabTitle[locale];
}

/**
 * BoardPage modification for PersonLimits feature.
 *
 * Displays WIP limit counters for each person and highlights
 * issues when limits are exceeded.
 */
const AVATARS_WRAPPER_ATTR = 'data-jh-person-limits';
const AVATARS_WRAPPER_KEY = 'avatars';

export default class PersonLimitsBoardPage extends PageModification<[any, PersonLimitData | null], Element> {
  private avatarsRoot: Root | null = null;

  private avatarsWrapper: HTMLDivElement | null = null;

  /** Set during clear() so re-entrant MutationObserver callbacks don't resurrect the wrapper. */
  private destroyed = false;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `add-person-limits-${this.getBoardId()}`;
  }

  appendStyles(): string {
    return `
    <style type="text/css">
        .ghx-issue.no-visibility {
            display: none!important;
        }

        .ghx-swimlane.no-visibility {
            display: none!important;
        }

        .ghx-parent-group.no-visibility {
            display: none!important;
        }
    </style>
    `;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-column, .ghx-swimlane');
  }

  loadData(): Promise<[any, PersonLimitData | null]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS)]);
  }

  apply(data: [any, PersonLimitData | null]): void {
    if (!data) return;
    const [editData = {}, personLimits] = data;

    const { model: propertyModel } = this.container.inject(propertyModelToken);
    const effectivePersonLimits = personLimits ?? { limits: [] };
    propertyModel.setData(effectivePersonLimits);

    const boardEditData = editData as EditData;
    const canEdit = boardEditData?.canEdit;
    if (canEdit) {
      const rawColumns = boardEditData.rapidListConfig?.mappedColumns ?? [];
      const columns: Column[] = rawColumns
        .filter((col: MappedColumn) => !col.isKanPlanColumn)
        .map((col: MappedColumn) => ({ id: col.id, name: col.name }));

      const rawSwimlanes = boardEditData.swimlanesConfig?.swimlanes ?? [];
      const swimlanes: Swimlane[] = rawSwimlanes.map((swim, index) => ({
        id: String(swim.id ?? swim.name ?? `swimlane-${index}`),
        name: swim.name,
      }));

      const TabComponent = () => React.createElement(PersonLimitsSettingsTab, { columns, swimlanes });

      registerSettings({
        title: getPersonLimitsSettingsTabTitle(this.container),
        component: TabComponent,
      });
    }

    if (!effectivePersonLimits.limits.length) return;

    const { model: boardRuntimeModel } = this.container.inject(boardRuntimeModelToken);
    const runtime = boardRuntimeModel;
    const cssSelector = this.getCssSelectorOfIssues(editData);
    runtime.setCssSelectorOfIssues(cssSelector);
    runtime.apply();

    this.destroyed = false;
    this.renderAvatarsContainer();

    this.sideEffects.push(() => {
      this.destroyed = true;
      this.unmountAvatarsContainer();
    });

    const pool = document.getElementById('ghx-pool');
    if (pool) {
      this.onDOMChange(
        '#ghx-pool',
        () => {
          runtime.apply();
          runtime.showOnlyChosen();
          // Jira sometimes wipes #subnav-title together with the toolbar
          // when cards/columns mutate; re-mount avatars if our wrapper is gone.
          this.renderAvatarsContainer();
        },
        { childList: true, subtree: true }
      );
    }

    // Quick filters / view changes re-render the toolbar around #subnav-title.
    // Watch the toolbar wrapper so avatars survive those re-renders.
    const viewSelector = document.getElementById('ghx-view-selector');
    if (viewSelector) {
      this.onDOMChange(
        '#ghx-view-selector',
        () => {
          this.renderAvatarsContainer();
        },
        { childList: true, subtree: true }
      );
    }
  }

  private renderAvatarsContainer(): void {
    if (this.destroyed) return;

    const subnav = document.querySelector('#subnav-title');
    if (!subnav) return;

    // Idempotent: skip if our wrapper is still attached to the live DOM.
    if (this.avatarsWrapper && this.avatarsWrapper.isConnected) return;

    // Wrapper is gone (Jira wiped subnav) — drop the stale React root before
    // creating a new one to avoid leaking the renderer.
    this.unmountAvatarsContainer();

    const wrapper = document.createElement('div');
    wrapper.setAttribute(AVATARS_WRAPPER_ATTR, AVATARS_WRAPPER_KEY);
    wrapper.style.display = 'contents';
    subnav.appendChild(wrapper);

    const root = createRoot(wrapper);
    root.render(
      React.createElement(WithDi, {
        container: this.container,
        children: React.createElement(AvatarsContainer),
      })
    );

    this.avatarsRoot = root;
    this.avatarsWrapper = wrapper;
  }

  private unmountAvatarsContainer(): void {
    if (this.avatarsRoot) {
      this.avatarsRoot.unmount();
      this.avatarsRoot = null;
    }
    if (this.avatarsWrapper) {
      this.avatarsWrapper.remove();
      this.avatarsWrapper = null;
    }
  }
}

export const personLimitsBoardPageToken = new Token<PersonLimitsBoardPage>('PersonLimitsBoardPage');
