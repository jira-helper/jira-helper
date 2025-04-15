import React from 'react';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { createRoot } from 'react-dom/client';
import { PageModification } from '../shared/PageModification';
import { BoardSettingsComponent } from './BoardSettingsComponent';

export class BoardSettingsBoardPage extends PageModification<undefined, Element> {
  getModificationId(): string {
    return `board-settings-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.sidebar);
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    const div = document.createElement('div');
    // put after sidebar
    const sidebar = document.querySelector(BoardPagePageObject.selectors.sidebar);
    if (!sidebar) {
      // eslint-disable-next-line no-console
      console.error('Sidebar not found');
      return;
    }

    sidebar.after(div);
    createRoot(div).render(<BoardSettingsComponent />);
  }
}
