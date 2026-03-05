import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { registerSwimlaneWipLimitsModule } from './module';
import { propertyModelToken, settingsUIModelToken, boardRuntimeModelToken } from './tokens';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { BoardPagePageObjectMock } from 'src/page-objects/BoardPage.mock';
import { loggerToken, Logger } from 'src/shared/Logger';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({}),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

describe('registerSwimlaneWipLimitsModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObjectMock });
    container.register({ token: loggerToken, value: new Logger() });
  });

  it('should register PropertyModel token', () => {
    registerSwimlaneWipLimitsModule(container);

    const { model } = container.inject(propertyModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
  });

  it('should register SettingsUIModel token', () => {
    registerSwimlaneWipLimitsModule(container);

    const { model } = container.inject(settingsUIModelToken);
    expect(model).toBeDefined();
    expect(model.isOpen).toBe(false);
  });

  it('should register BoardRuntimeModel token', () => {
    registerSwimlaneWipLimitsModule(container);

    const { model } = container.inject(boardRuntimeModelToken);
    expect(model).toBeDefined();
    expect(model.isInitialized).toBe(false);
  });

  it('should create singletons (same instance on multiple injects)', () => {
    registerSwimlaneWipLimitsModule(container);

    const first = container.inject(propertyModelToken);
    const second = container.inject(propertyModelToken);

    expect(first.model).toBe(second.model);
  });
});
