import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { swimlaneHistogramModule } from './module';
import { histogramModelToken } from './tokens';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { BoardPagePageObjectMock } from 'src/page-objects/BoardPage.mock';
import { loggerToken, Logger } from 'src/shared/Logger';

describe('swimlaneHistogramModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObjectMock });
    container.register({ token: loggerToken, value: new Logger() });
  });

  it('should register HistogramModel token', () => {
    swimlaneHistogramModule.ensure(container);

    const { model } = container.inject(histogramModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
  });

  it('should return same instance on multiple injects (singleton)', () => {
    swimlaneHistogramModule.ensure(container);

    const first = container.inject(histogramModelToken);
    const second = container.inject(histogramModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should provide useModel function', () => {
    swimlaneHistogramModule.ensure(container);

    const { useModel } = container.inject(histogramModelToken);
    expect(typeof useModel).toBe('function');
  });
});
