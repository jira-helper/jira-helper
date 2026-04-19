import React from 'react';
import { Token } from 'dioma';
import { PageModification } from 'src/shared/PageModification';
import { WithDi } from 'src/shared/diContext';
import { boardRuntimeModelToken, fieldLimitsBoardPageObjectToken } from '../tokens';
import { FieldLimitsList } from './components/FieldLimitsList';
import type { BoardRuntimeModel } from './models/BoardRuntimeModel';
import type { BoardEditData, FieldLimitsSettings } from '../types';
import { BOARD_PROPERTIES } from 'src/shared/constants';

export class BoardPageModification extends PageModification<[BoardEditData, FieldLimitsSettings], Element> {
  private runtimeModel: BoardRuntimeModel | null = null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `field-limits-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  async loadData(): Promise<[BoardEditData, FieldLimitsSettings]> {
    const [boardEditData, fieldLimits] = await Promise.all([
      this.getBoardEditData(),
      this.getBoardProperty(BOARD_PROPERTIES.FIELD_LIMITS),
    ]);
    return [boardEditData as BoardEditData, (fieldLimits as FieldLimitsSettings) || { limits: {} }];
  }

  async apply(data: [BoardEditData, FieldLimitsSettings] | undefined): Promise<void> {
    if (!data) return;
    const [boardEditData, fieldLimits] = data;

    if (!fieldLimits?.limits || Object.keys(fieldLimits.limits).length === 0) return;

    const { model } = this.container.inject(boardRuntimeModelToken);
    this.runtimeModel = model as BoardRuntimeModel;

    const initResult = await this.runtimeModel.initialize(boardEditData);
    if (initResult.err) {
      window.console.error('jira-helper: BoardRuntimeModel init failed:', initResult.val);
      return;
    }

    const pageObject = this.container.inject(fieldLimitsBoardPageObjectToken);
    pageObject.insertSubnavComponent(
      React.createElement(WithDi, {
        container: this.container,
        children: React.createElement(FieldLimitsList),
      }),
      'field-limits-list'
    );

    this.onDOMChange(
      '#ghx-pool',
      () => {
        this.runtimeModel?.recalculate();
      },
      { childList: true, subtree: true }
    );

    this.onDOMChange(
      '#ghx-view-selector',
      () => {
        const existing = document.querySelector('[data-jh-field-limits="field-limits-list"]');
        if (!existing) {
          pageObject.insertSubnavComponent(
            React.createElement(WithDi, {
              container: this.container,
              children: React.createElement(FieldLimitsList),
            }),
            'field-limits-list'
          );
        }
      },
      { childList: true, subtree: true }
    );

    this.sideEffects.push(() => {
      pageObject.removeSubnavComponent('field-limits-list');
      this.runtimeModel?.destroy();
      this.runtimeModel = null;
    });
  }
}

export const fieldLimitsBoardPageToken = new Token<BoardPageModification>('BoardPageModification');
