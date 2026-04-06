import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { columnLimitsModule } from './module';
import { boardRuntimeModelToken, propertyModelToken, settingsUIModelToken } from './tokens';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { loggerToken, Logger } from 'src/shared/Logger';
import type { IBoardPagePageObject } from 'src/page-objects/BoardPage';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({}),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

const mockBoardPagePageObject: IBoardPagePageObject = {
  getOrderedColumnIds: vi.fn(() => []),
  getColumnHeaderElement: vi.fn(() => null),
  getSwimlaneIds: vi.fn(() => []),
  getIssueCountInColumn: vi.fn(() => 0),
  styleColumnHeader: vi.fn(),
  insertColumnHeaderHtml: vi.fn(),
  removeColumnHeaderElements: vi.fn(),
  highlightColumnCells: vi.fn(),
  resetColumnCellStyles: vi.fn(),
} as unknown as IBoardPagePageObject;

describe('columnLimitsModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: mockBoardPagePageObject });
  });

  it('should register PropertyModel token', () => {
    columnLimitsModule.ensure(container);

    const { model } = container.inject(propertyModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
  });

  it('should create singletons (same instance on multiple injects)', () => {
    columnLimitsModule.ensure(container);

    const first = container.inject(propertyModelToken);
    const second = container.inject(propertyModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should register BoardRuntimeModel token', () => {
    columnLimitsModule.ensure(container);

    const { model } = container.inject(boardRuntimeModelToken);
    expect(model).toBeDefined();
    expect(model.groupStats).toEqual([]);
  });

  it('should reuse same BoardRuntimeModel on multiple injects', () => {
    columnLimitsModule.ensure(container);

    const first = container.inject(boardRuntimeModelToken);
    const second = container.inject(boardRuntimeModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should register SettingsUIModel token', () => {
    columnLimitsModule.ensure(container);

    const { model } = container.inject(settingsUIModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
    expect(model.groups).toEqual([]);
  });

  it('should reuse same SettingsUIModel on multiple injects', () => {
    columnLimitsModule.ensure(container);

    const first = container.inject(settingsUIModelToken);
    const second = container.inject(settingsUIModelToken);

    expect(first.model).toBe(second.model);
  });
});
