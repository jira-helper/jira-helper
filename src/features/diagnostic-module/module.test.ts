import { describe, it, expect, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { diagnosticModule } from './module';
import { diagnosticModelToken } from './tokens';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';

describe('diagnosticModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
  });

  it('should resolve diagnosticModelToken after ensure', () => {
    diagnosticModule.ensure(container);

    const { model } = container.inject(diagnosticModelToken);
    expect(model).toBeDefined();
    expect(model.registerDiagnosticData).toBeTypeOf('function');
    expect(model.saveDiagnosticData).toBeTypeOf('function');
    expect(model.getInitialState()).toEqual({ callbacksCount: 0, registeredFeatures: [] });
  });

  it('should return singleton model entry on repeated injects', () => {
    diagnosticModule.ensure(container);

    const first = container.inject(diagnosticModelToken);
    const second = container.inject(diagnosticModelToken);

    expect(first.model).toBe(second.model);
  });
});
