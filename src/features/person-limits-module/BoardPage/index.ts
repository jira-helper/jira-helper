import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { Container } from 'dioma';
import { Token } from 'dioma';
import { registerSettings } from 'src/features/board-settings/actions/registerSettings';
import { BOARD_SETTINGS_TAB_IDS } from 'src/features/board-settings/settingsTabIds';
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
import { PROJECT_HEADER_MOUNT_SELECTOR } from 'src/features/board-settings/resolveBoardSettingsMount';
import { boardPagePageObjectToken, type IBoardPagePageObject } from '../../../infrastructure/page-objects/BoardPage';

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
    swimlaneStrategy?: string;
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
const TEAM_MANAGED_BOARD_SELECTOR = '[data-testid="board.content.board-wrapper"]';
const TEAM_MANAGED_FILTER_BAR_SELECTOR = '[data-testid="filter-refinement.ui.search-field-container"]';

function resolveTeamManagedAvatarsMount(): Element | null {
  const search = document.querySelector(TEAM_MANAGED_FILTER_BAR_SELECTOR);
  const board = document.querySelector(TEAM_MANAGED_BOARD_SELECTOR);
  if (!search || !board) return null;

  let node: Element | null = search;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (
      parent &&
      parent.children.length === 2 &&
      parent.children[0].contains(search) &&
      parent.children[1].contains(board)
    ) {
      const toolbar = parent.children[0];
      if (toolbar.children.length >= 2) {
        return toolbar.lastElementChild;
      }
    }
    node = parent;
  }
  return null;
}

function resolveAvatarsMount(po: IBoardPagePageObject): Element | null {
  const selectors = po.selectors as (typeof po.selectors & { boardHeaderTarget?: string }) | undefined;
  const primary = document.querySelector(selectors?.boardHeaderTarget ?? '#subnav-title');
  if (primary) return primary;

  // Team-managed Cloud: the search field is on the left; view actions sit in the
  // last child of the toolbar row immediately above the board.
  const teamManaged = resolveTeamManagedAvatarsMount();
  if (teamManaged) return teamManaged;

  return (
    document.querySelector(TEAM_MANAGED_FILTER_BAR_SELECTOR) ?? document.querySelector(PROJECT_HEADER_MOUNT_SELECTOR)
  );
}

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
    // Generic class: Cloud cards/swimlanes are not `.ghx-*`, but still use `no-visibility`.
    return `
    <style type="text/css">
        .no-visibility {
            display: none !important;
        }
    </style>
    `;
  }

  waitForLoading(): Promise<Element> {
    const po = this.container.inject(boardPagePageObjectToken);
    return this.waitForElement(po.selectors.pool);
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
    // Saved query swimlanes are only meaningful when the board's strategy is "custom".
    // For other strategies (none/parentChild/assignee/epic/project) Jira still returns the
    // historical query list, but it doesn't render — so we treat it as "no swimlanes".
    const isCustomSwimlaneStrategy = boardEditData.swimlanesConfig?.swimlaneStrategy === 'custom';

    // Settings tab is intentionally registered regardless of `canEdit`:
    // viewers should also be able to inspect the existing config and tweak
    // it locally (changes apply to the live board until reload, even if
    // persistence to Jira fails due to missing edit permissions).
    const rawColumns = boardEditData.rapidListConfig?.mappedColumns ?? [];
    const columns: Column[] = rawColumns
      .filter((col: MappedColumn) => !col.isKanPlanColumn)
      .map((col: MappedColumn) => ({ id: col.id, name: col.name }));

    const rawSwimlanes = isCustomSwimlaneStrategy ? (boardEditData.swimlanesConfig?.swimlanes ?? []) : [];
    const swimlanes: Swimlane[] = rawSwimlanes.map((swim, index) => ({
      id: String(swim.id ?? swim.name ?? `swimlane-${index}`),
      name: swim.name,
    }));

    const TabComponent = () => React.createElement(PersonLimitsSettingsTab, { columns, swimlanes });

    registerSettings({
      id: BOARD_SETTINGS_TAB_IDS.PERSON_WIP_LIMITS,
      title: getPersonLimitsSettingsTabTitle(this.container),
      component: TabComponent,
    });

    if (!effectivePersonLimits.limits.length) return;

    const po = this.container.inject(boardPagePageObjectToken);
    const { model: boardRuntimeModel } = this.container.inject(boardRuntimeModelToken);
    const runtime = boardRuntimeModel;
    const cssSelector = po.getIssueCssSelector?.(editData) ?? this.getCssSelectorOfIssues(editData);
    runtime.setCssSelectorOfIssues(cssSelector);
    runtime.setSwimlanesActive(isCustomSwimlaneStrategy);
    runtime.apply();

    this.destroyed = false;
    this.renderAvatarsContainer();

    this.sideEffects.push(() => {
      this.destroyed = true;
      this.unmountAvatarsContainer();
    });

    const poolSelector = po.selectors?.pool ?? '#ghx-pool';
    const pool = document.querySelector(poolSelector);
    if (pool) {
      // Cloud reassigns cards via attribute/text updates as often as remounts.
      // Debounce + ignore our own paint/filter writes so we do not loop.
      let applyTimer: ReturnType<typeof setTimeout> | null = null;
      let applying = false;
      this.sideEffects.push(() => {
        if (applyTimer) clearTimeout(applyTimer);
      });

      const isOwnPersonLimitsMutation = (mutations: MutationRecord[]) =>
        mutations.length > 0 &&
        mutations.every(mutation => {
          if (mutation.type === 'attributes') {
            const name = mutation.attributeName;
            if (name === 'data-jh-wip-overloaded') return true;
            if (name === 'style') {
              const el = mutation.target as Element;
              return (
                el.hasAttribute('data-jh-wip-overloaded') ||
                el.classList.contains('jh-wip-overloaded') ||
                el.closest('[data-jh-person-limits], #avatars-limits') != null
              );
            }
            if (name === 'class') {
              const el = mutation.target as Element;
              return el.classList.contains('no-visibility') || el.classList.contains('jh-wip-overloaded');
            }
            return false;
          }
          if (mutation.type === 'childList') {
            const nodes = [...Array.from(mutation.addedNodes), ...Array.from(mutation.removedNodes)];
            if (nodes.length === 0) return true;
            return nodes.every(node => {
              if (!(node instanceof Element)) {
                return node.parentElement?.closest('[data-jh-person-limits], #avatars-limits') != null;
              }
              return (
                node.matches('[data-jh-person-limits], #avatars-limits') ||
                node.querySelector('[data-jh-person-limits], #avatars-limits') != null ||
                node.closest('[data-jh-person-limits], #avatars-limits') != null
              );
            });
          }
          return false;
        });

      const applyRuntime = () => {
        if (applying) return;
        applying = true;
        try {
          runtime.apply();
          runtime.showOnlyChosen();
          // Jira sometimes wipes the board toolbar together with our wrapper
          // when cards/columns mutate; re-mount avatars if our wrapper is gone.
          this.renderAvatarsContainer();
        } finally {
          this.setTimeout(() => {
            applying = false;
          }, 0);
        }
      };

      const issueSelector = po.selectors?.issue ?? '.ghx-issue';

      this.onDOMChange(
        poolSelector,
        mutations => {
          if (applying) return;

          // Virtualized boards remount cards on scroll. Paint/filter them
          // synchronously — a debounced full apply lets over-limit cards flash unstyled.
          const freshCards: Element[] = [];
          for (const mutation of mutations) {
            if (mutation.type !== 'childList') continue;
            for (const node of Array.from(mutation.addedNodes)) {
              if (!(node instanceof Element)) continue;
              if (node.matches(issueSelector)) {
                freshCards.push(node);
              } else {
                freshCards.push(...Array.from(node.querySelectorAll(issueSelector)));
              }
            }
          }
          if (freshCards.length > 0) {
            runtime.applyHighlightToIssues(freshCards);
            if (runtime.activePerson != null) {
              runtime.applyVisibilityToIssues(freshCards);
            }
          }

          if (isOwnPersonLimitsMutation(mutations)) return;
          if (applyTimer) clearTimeout(applyTimer);
          applyTimer = setTimeout(applyRuntime, 200);
        },
        {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
          attributeFilter: ['aria-label', 'alt', 'class', 'data-testid', 'hidden', 'style'],
        }
      );

      // Cards / assignees can hydrate after first paint.
      this.setTimeout(applyRuntime, 1500);
    }

    // Quick filters / view changes re-render the toolbar. Watch the toolbar wrapper
    // so avatars survive those re-renders on both Jira Server and Jira Cloud.
    if (document.getElementById('ghx-view-selector')) {
      this.onDOMChange('#ghx-view-selector', () => this.renderAvatarsContainer(), { childList: true, subtree: true });
    } else {
      const mount = resolveAvatarsMount(po);
      const observeEl = mount?.parentElement ?? mount;
      if (observeEl) {
        const observer = new MutationObserver(() => this.renderAvatarsContainer());
        observer.observe(observeEl, { childList: true, subtree: true });
        this.sideEffects.push(() => observer.disconnect());
      }
    }
  }

  private renderAvatarsContainer(): void {
    if (this.destroyed) return;

    const po = this.container.inject(boardPagePageObjectToken);
    const mount = resolveAvatarsMount(po);
    if (!mount) return;

    // Idempotent only when still attached to the chosen mount. A first paint
    // can land in the search-field fallback before the board toolbar exists.
    if (this.avatarsWrapper && this.avatarsWrapper.isConnected && mount.contains(this.avatarsWrapper)) {
      return;
    }

    // Wrapper is gone (Jira wiped subnav) — drop the stale React root before
    // creating a new one to avoid leaking the renderer.
    this.unmountAvatarsContainer();

    const wrapper = document.createElement('div');
    wrapper.setAttribute(AVATARS_WRAPPER_ATTR, AVATARS_WRAPPER_KEY);
    wrapper.style.display = 'contents';
    const teamManaged = resolveTeamManagedAvatarsMount();
    if (mount === teamManaged && mount.firstChild) {
      mount.insertBefore(wrapper, mount.firstChild);
    } else {
      mount.appendChild(wrapper);
    }

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
