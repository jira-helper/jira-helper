import React from 'react';
import { Token } from 'dioma';
import { boardPagePageObjectToken, type IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { createRoot } from 'react-dom/client';
import { PageModification } from '../../infrastructure/page-modification/PageModification';
import { BoardSettingsComponent } from './BoardSettingsComponent';

function getBoardSettingsMountSelector(po: IBoardPagePageObject): string {
  const selectors = po.selectors as typeof po.selectors & { boardHeaderTarget?: string };
  return selectors.boardHeaderTarget ?? selectors.sidebar;
}

export class BoardSettingsBoardPage extends PageModification<undefined, Element> {
  getModificationId(): string {
    return `board-settings-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    const po = this.container.inject(boardPagePageObjectToken);
    const mountSelector = getBoardSettingsMountSelector(po);
    const controlsBar = document.querySelector(mountSelector);
    if (controlsBar) {
      return Promise.resolve(controlsBar);
    }

    return this.waitForElement(mountSelector);
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    const po = this.container.inject(boardPagePageObjectToken);
    const controlsBar = document.querySelector(getBoardSettingsMountSelector(po));
    if (!controlsBar) {
      // eslint-disable-next-line no-console
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
