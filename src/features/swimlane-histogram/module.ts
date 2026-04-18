import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/shared/di/Module';
import { histogramModelToken } from './tokens';
import { HistogramModel } from './models/HistogramModel';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from 'src/shared/Logger';

class SwimlaneHistogramModule extends Module {
  register(container: Container): void {
    this.lazy(container, histogramModelToken, c =>
      modelEntry(new HistogramModel(c.inject(boardPagePageObjectToken), c.inject(loggerToken)))
    );
  }
}

export const swimlaneHistogramModule = new SwimlaneHistogramModule();
