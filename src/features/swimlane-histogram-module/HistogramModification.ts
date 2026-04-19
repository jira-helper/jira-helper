import React from 'react';
import { PageModification } from 'src/shared/PageModification';
import { Token } from 'dioma';
import { histogramModelToken } from './tokens';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { Histogram } from './components/Histogram';
import type { HistogramModel } from './models/HistogramModel';

export class HistogramModification extends PageModification<void, Element> {
  private histogramModel: HistogramModel | null = null;

  shouldApply(): boolean {
    const view = this.getSearchParam('view');
    return !view || view === 'detail';
  }

  getModificationId(): string {
    return `swimlane-histogram-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('.ghx-swimlane');
  }

  async apply(): Promise<void> {
    const { model } = this.container.inject(histogramModelToken);
    this.histogramModel = model as HistogramModel;

    this.histogramModel.initialize();
    this.renderHistograms();

    this.onDOMChange('#ghx-pool', () => {
      this.histogramModel?.refresh();
      this.renderHistograms();
    });

    this.sideEffects.push(() => {
      this.cleanup();
    });
  }

  private renderHistograms(): void {
    if (!this.histogramModel) return;

    const pageObject = this.container.inject(boardPagePageObjectToken);
    const swimlanes = pageObject.getSwimlanes();

    for (const swimlane of swimlanes) {
      pageObject.removeSwimlaneComponent(swimlane.header, 'histogram');

      const histogram = this.histogramModel.getHistogram(swimlane.id);
      if (!histogram) continue;

      pageObject.insertSwimlaneComponent(
        swimlane.header,
        React.createElement(Histogram, { data: histogram }),
        'histogram'
      );
    }
  }

  private cleanup(): void {
    const pageObject = this.container.inject(boardPagePageObjectToken);
    const swimlanes = pageObject.getSwimlanes();

    for (const swimlane of swimlanes) {
      pageObject.removeSwimlaneComponent(swimlane.header, 'histogram');
    }

    this.histogramModel?.dispose();
    this.histogramModel = null;
  }
}

export const histogramModificationToken = new Token<HistogramModification>('HistogramModification');
