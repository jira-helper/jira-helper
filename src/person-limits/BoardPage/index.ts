import React from 'react';
import { createRoot } from 'react-dom/client';
import { globalContainer } from 'dioma';
import { PageModification } from '../../shared/PageModification';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { registerPersonLimitsBoardPageObjectInDI, personLimitsBoardPageObjectToken } from './pageObject';
import { useRuntimeStore } from './stores';
import { usePersonWipLimitsPropertyStore } from '../property';
import { applyLimits, showOnlyChosen } from './actions';
import { AvatarsContainer } from './components';

type PersonLimitData = {
  limits: Array<{
    id: number;
    person: {
      displayName: string;
      name: string;
      avatar: string;
    };
    columns: Array<{ id: string; name: string }>;
    swimlanes: Array<{ id: string; name: string }>;
    limit: number;
    includedIssueTypes?: string[];
  }>;
};

/**
 * BoardPage modification for PersonLimits feature.
 *
 * Displays WIP limit counters for each person and highlights
 * issues when limits are exceeded.
 */
export default class extends PageModification<[any, PersonLimitData | null], Element> {
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
    if (!personLimits?.limits?.length) return;

    // Register PageObject in DI (if not already registered)
    try {
      globalContainer.inject(personLimitsBoardPageObjectToken);
    } catch {
      registerPersonLimitsBoardPageObjectInDI(globalContainer);
    }

    // Initialize property store with loaded data
    const propertyStore = usePersonWipLimitsPropertyStore.getState();
    propertyStore.actions.setData(personLimits);

    // Initialize runtime store
    const { actions } = useRuntimeStore.getState();
    const cssSelector = this.getCssSelectorOfIssues(editData);
    actions.setCssSelectorOfIssues(cssSelector);

    // Apply limits (reads from property store)
    applyLimits();

    // Render React component
    this.renderAvatarsContainer();

    // Watch for DOM changes
    const pool = document.getElementById('ghx-pool');
    if (pool) {
      this.onDOMChange(
        '#ghx-pool',
        () => {
          applyLimits();
          showOnlyChosen();
        },
        { childList: true, subtree: true }
      );
    }
  }

  private renderAvatarsContainer(): void {
    const existingContainer = document.getElementById('avatars-limits');
    if (existingContainer) {
      return;
    }

    const container = document.createElement('div');
    document.querySelector('#subnav-title')?.appendChild(container);

    const root = createRoot(container);
    root.render(React.createElement(AvatarsContainer));

    // Cleanup on unmount
    this.sideEffects.push(() => {
      root.unmount();
      container.remove();
    });
  }
}
