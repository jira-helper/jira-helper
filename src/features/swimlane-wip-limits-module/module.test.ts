import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { swimlaneWipLimitsModule } from './module';
import { propertyModelToken, settingsUIModelToken, boardRuntimeModelToken } from './tokens';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { BoardPagePageObjectMock } from 'src/infrastructure/page-objects/BoardPage.mock';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({}),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

describe('swimlaneWipLimitsModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObjectMock });
    container.register({ token: loggerToken, value: new Logger() });
  });

  it('should register PropertyModel token', () => {
    swimlaneWipLimitsModule.ensure(container);

    const { model } = container.inject(propertyModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
  });

  it('should register SettingsUIModel token', () => {
    swimlaneWipLimitsModule.ensure(container);

    const { model } = container.inject(settingsUIModelToken);
    expect(model).toBeDefined();
    expect(model.isOpen).toBe(false);
  });

  it('should register BoardRuntimeModel token', () => {
    swimlaneWipLimitsModule.ensure(container);

    const { model } = container.inject(boardRuntimeModelToken);
    expect(model).toBeDefined();
    expect(model.isInitialized).toBe(false);
  });

  it('should create singletons (same instance on multiple injects)', () => {
    swimlaneWipLimitsModule.ensure(container);

    const first = container.inject(propertyModelToken);
    const second = container.inject(propertyModelToken);

    expect(first.model).toBe(second.model);
  });
});
