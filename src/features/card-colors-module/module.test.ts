import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { cardColorsModule } from './module';
import { propertyModelToken, settingsUIModelToken, runtimeModelToken } from './tokens';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';

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
  resetColumnHeaderStyles: vi.fn(),
  insertColumnHeaderHtml: vi.fn(),
  removeColumnHeaderElements: vi.fn(),
  highlightColumnCells: vi.fn(),
  resetColumnCellStyles: vi.fn(),
  selectors: {
    pool: '.ghx-pool',
    issue: '.ghx-issue',
    column: '.ghx-column',
    columnHeader: '.ghx-column-header',
    columnTitle: '.ghx-column-title',
    swimlaneRow: '.ghx-swimlane',
    swimlaneHeader: '.ghx-swimlane-header',
    grabber: '.ghx-grabber',
  },
  classlist: {
    flagged: 'jh-flagged',
  },
} as unknown as IBoardPagePageObject;

describe('cardColorsModule', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: mockBoardPagePageObject });
  });

  it('should register PropertyModel token', () => {
    cardColorsModule.ensure(container);

    const { model } = container.inject(propertyModelToken);
    expect(model).toBeDefined();
    expect(model.state).toBe('initial');
    expect(model.settings).toEqual({ enabled: false });
  });

  it('should create singletons (same instance on multiple injects)', () => {
    cardColorsModule.ensure(container);

    const first = container.inject(propertyModelToken);
    const second = container.inject(propertyModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should register SettingsUIModel token', () => {
    cardColorsModule.ensure(container);

    const { model } = container.inject(settingsUIModelToken);
    expect(model).toBeDefined();
    expect(model.isOpen).toBe(false);
    expect(model.draft).toEqual({ enabled: false });
  });

  it('should reuse same SettingsUIModel on multiple injects', () => {
    cardColorsModule.ensure(container);

    const first = container.inject(settingsUIModelToken);
    const second = container.inject(settingsUIModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should register RuntimeModel token', () => {
    cardColorsModule.ensure(container);

    const { model } = container.inject(runtimeModelToken);
    expect(model).toBeDefined();
    expect(model.isActive).toBe(false);
  });

  it('should reuse same RuntimeModel on multiple injects', () => {
    cardColorsModule.ensure(container);

    const first = container.inject(runtimeModelToken);
    const second = container.inject(runtimeModelToken);

    expect(first.model).toBe(second.model);
  });

  it('should be idempotent (multiple ensure calls are safe)', () => {
    cardColorsModule.ensure(container);
    cardColorsModule.ensure(container);
    cardColorsModule.ensure(container);

    const { model } = container.inject(propertyModelToken);
    expect(model).toBeDefined();
  });
});
