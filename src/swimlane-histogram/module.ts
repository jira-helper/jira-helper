import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';
import { histogramModelToken } from './tokens';
import { HistogramModel } from './models/HistogramModel';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from 'src/shared/Logger';

type HistogramModelInjection = {
  model: HistogramModel;
  useModel: () => HistogramModel;
};

const histogramModelCache = new WeakMap<Container, HistogramModelInjection>();

/**
 * Регистрирует HistogramModel в DI-контейнере.
 */
export function registerSwimlaneHistogramModule(container: Container = globalContainer): void {
  container.register({
    token: histogramModelToken,
    factory: c => {
      let cached = histogramModelCache.get(c);
      if (!cached) {
        const pageObject = c.inject(boardPagePageObjectToken);
        const logger = c.inject(loggerToken);

        const model = proxy(new HistogramModel(pageObject, logger));
        cached = {
          model,
          useModel: () => useSnapshot(model) as HistogramModel,
        };
        histogramModelCache.set(c, cached);
      }
      return cached;
    },
  });
}
