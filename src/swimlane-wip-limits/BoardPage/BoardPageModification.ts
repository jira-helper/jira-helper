import { globalContainer } from 'dioma';
import { PageModification } from 'src/shared/PageModification';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { boardRuntimeModelToken } from '../tokens';
import { registerSwimlaneWipLimitsModule } from '../module';
import { renderSwimlaneVisuals } from './renderSwimlaneVisuals';
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

  appendStyles(): string | undefined {
    return `
    <style>
      #js-swimlane-header-stalker .ghx-description {
        color: inherit !important;
      }
    </style>
    `;
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

    const pageObject = globalContainer.inject(boardPagePageObjectToken);
    renderSwimlaneVisuals(this.runtimeModel, pageObject);

    this.onDOMChange('#ghx-pool', () => {
      if (!this.runtimeModel) return;
      this.runtimeModel.render();
      renderSwimlaneVisuals(this.runtimeModel, pageObject);
    });

    this.sideEffects.push(() => {
      this.runtimeModel?.destroy();
      this.runtimeModel = null;
    });
  }
}
