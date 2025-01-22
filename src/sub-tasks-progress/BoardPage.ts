import { BoardPagePageObject } from 'src/page-objects/BoardPage';

import { PageModification } from '../shared/PageModification';

import { IssuesSubTasksProgressContainer } from './components/SubTasksProgress/IssuesSubTasksProgress';
import { loadSubTaskProgressBoardProperty } from './actions/loadSubTaskProgressBoardProperty';

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
    this.sideEffects.push(unlisten);
  }
}
