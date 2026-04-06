import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Container } from 'dioma';
import { personLimitsModule } from './module';
import { boardRuntimeModelToken, propertyModelToken, settingsUIModelToken } from './tokens';
import { boardPagePageObjectToken, BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { loggerToken, Logger } from 'src/shared/Logger';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({ limits: [] }),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

describe('personLimitsModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObject });
  });

  it('should register PropertyModel token', () => {
    personLimitsModule.ensure(container);

    const { model } = container.inject(propertyModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
  });

  it('should create singletons (same instance on multiple injects)', () => {
    personLimitsModule.ensure(container);

    const first = container.inject(propertyModelToken);
    const second = container.inject(propertyModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should register BoardRuntimeModel token', () => {
    personLimitsModule.ensure(container);

    const { model } = container.inject(boardRuntimeModelToken);
    expect(model).toBeDefined();
    expect((model as { calculateStats: unknown }).calculateStats).toBeTypeOf('function');
  });

  it('should register SettingsUIModel token', () => {
    personLimitsModule.ensure(container);

    const { model } = container.inject(settingsUIModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
  });
});
