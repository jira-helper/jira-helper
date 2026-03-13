import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';
import { histogramModelToken } from './tokens';
import { HistogramModel } from './models/HistogramModel';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from 'src/shared/Logger';

/**
 * Регистрирует HistogramModel в DI-контейнере.
 */
export function registerSwimlaneHistogramModule(container: Container = globalContainer): void {
  const pageObject = container.inject(boardPagePageObjectToken);
  const logger = container.inject(loggerToken);

  const model = proxy(new HistogramModel(pageObject, logger));

  container.register({
    token: histogramModelToken,
    value: {
      model,
      useModel: () => useSnapshot(model) as HistogramModel,
    },
  });
}
