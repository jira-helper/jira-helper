import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import { histogramModelToken } from './tokens';
import { HistogramModel } from './models/HistogramModel';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { loggerToken } from 'src/infrastructure/logging/Logger';

class SwimlaneHistogramModule extends Module {
  register(container: Container): void {
    this.lazy(container, histogramModelToken, c =>
      modelEntry(new HistogramModel(c.inject(boardPagePageObjectToken), c.inject(loggerToken)))
    );
  }
}

export const swimlaneHistogramModule = new SwimlaneHistogramModule();
