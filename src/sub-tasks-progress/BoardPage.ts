import { BoardPagePageObject } from 'src/page-objects/BoardPage';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { PageModification } from '../shared/PageModification';

import { loadSubTaskProgressBoardProperty } from './SubTaskProgressSettings/actions/loadSubTaskProgressBoardProperty';
import { BoardSettingsTabContent } from './BoardSettings/BoardSettingsTabContent';
import { IssuesSubTasksProgressContainer } from './IssueCardSubTasksProgress/IssuesSubTasksProgress';
import { autosyncStoreWithBoardProperty } from './SubTaskProgressSettings/actions/autosyncStoreWithBoardProperty';

export class SubTasksProgressBoardPage extends PageModification<void, Element> {
  getModificationId(): string {
    return `sub-tasks-progress-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return loadSubTaskProgressBoardProperty();
  }

  async apply(): Promise<void> {
    const turnOffAutoSync = await autosyncStoreWithBoardProperty();
    this.sideEffects.push(turnOffAutoSync);

    const unlisten = BoardPagePageObject.listenCards(cards => {
      cards.forEach(card => card.attach(IssuesSubTasksProgressContainer, 'sub-tasks-progress'));
    });
    this.sideEffects.push(unlisten);

    registerSettings({
      title: 'Sub-tasks progress',
      component: BoardSettingsTabContent,
    });
  }
}
