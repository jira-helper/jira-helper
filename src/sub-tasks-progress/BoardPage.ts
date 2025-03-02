import { BoardPagePageObject } from 'src/page-objects/BoardPage';

import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { PageModification } from '../shared/PageModification';

import { IssuesSubTasksProgressContainer } from './components/SubTasksProgress/IssuesSubTasksProgress';
import { loadSubTaskProgressBoardProperty } from './actions/loadSubTaskProgressBoardProperty';
import { BoardSettingsTabContent } from './components/BoardSettings/BoardSettingsTabContent';

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
    const unlisten = BoardPagePageObject.listenCards(cards => {
      cards.forEach(card => card.attach(IssuesSubTasksProgressContainer, 'sub-tasks-progress'));
    });

    registerSettings({
      title: 'Sub-tasks progress',
      component: BoardSettingsTabContent,
    });
    this.sideEffects.push(unlisten);
  }
}
