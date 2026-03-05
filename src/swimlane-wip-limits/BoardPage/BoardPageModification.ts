import { globalContainer } from 'dioma';
import { PageModification } from 'src/shared/PageModification';
import { boardRuntimeModelToken } from '../tokens';
import { registerSwimlaneWipLimitsModule } from '../module';
import type { BoardRuntimeModel } from './models/BoardRuntimeModel';

export class BoardPageModification extends PageModification<void, Element> {
  private runtimeModel: BoardRuntimeModel | null = null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `swimlane-wip-limits-board-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  async apply(): Promise<void> {
    registerSwimlaneWipLimitsModule(globalContainer);

    const { model } = globalContainer.inject(boardRuntimeModelToken);
    this.runtimeModel = model as BoardRuntimeModel;

    const initResult = await this.runtimeModel.initialize();
    if (initResult.err) {
      window.console.error('jira-helper: BoardRuntimeModel init failed:', initResult.val);
      return;
    }

    this.onDOMChange('#ghx-pool', () => {
      this.runtimeModel?.render();
    });

    this.sideEffects.push(() => {
      this.runtimeModel?.destroy();
      this.runtimeModel = null;
    });
  }
}
