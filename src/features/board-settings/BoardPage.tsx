import React from 'react';
import { Token } from 'dioma';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { createRoot } from 'react-dom/client';
import { PageModification } from '../../infrastructure/page-modification/PageModification';
import { BoardSettingsComponent } from './BoardSettingsComponent';

export class BoardSettingsBoardPage extends PageModification<undefined, Element> {
  getModificationId(): string {
    return `board-settings-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element | undefined> {
    const controlsBar = document.querySelector('[data-testid="software-board.header.controls-bar"]');
    if (controlsBar) return Promise.resolve(undefined);

    const po = this.container.inject(boardPagePageObjectToken);
    return this.waitForElement(po.selectors.sidebar);
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    const po = this.container.inject(boardPagePageObjectToken);
    const controlsBar = document.querySelector(po.selectors.boardHeaderTarget);
    if (!controlsBar) {
      console.error('[BoardSettingsBoardPage] Controls bar not found');
      return;
    }

    const existing = controlsBar.querySelector('[data-jh-component="boardSettingsComponent"]');
    if (existing) {
      return;
    }

    const div = document.createElement('div');
    div.setAttribute('data-jh-component', 'boardSettingsComponent');
    div.style.display = 'inline-block';
    div.style.marginLeft = '8px';
    controlsBar.appendChild(div);

    createRoot(div).render(<BoardSettingsComponent />);
  }
}

export const boardSettingsBoardPageToken = new Token<BoardSettingsBoardPage>('BoardSettingsBoardPage');
