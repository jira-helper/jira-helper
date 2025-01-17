import { BoardPagePageObject } from 'src/page-objects/BoardPage';

import { PageModification } from '../shared/PageModification';
import { SubTasksProgressIssueCard } from './components/SubTasksProgress/SubTasksProgressIssueCard';

export class SubTasksProgressBoardPage extends PageModification<undefined, Element> {
  getModificationId(): string {
    return `sub-tasks-progress-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return Promise.resolve(undefined);
  }

  async apply(): Promise<void> {
    // maybe need to check if enabled
    console.log('SubTasksProgressBoardPage.apply');
    BoardPagePageObject.listenCards(cards => {
      console.log('SubTasksProgressBoardPage.apply.cards', cards);
      cards.forEach(card => card.attach(SubTasksProgressIssueCard, 'sub-tasks-progress'));
    });
  }
}
