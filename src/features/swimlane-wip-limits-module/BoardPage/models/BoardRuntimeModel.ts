/**
 * @module BoardRuntimeModel
 *
 * Модель для runtime-данных WIP-лимитов на доске.
 * Хранит кеш подсчёта задач и управляет рендерингом badge.
 *
 * ## Жизненный цикл
 * Создаётся при активации фичи на доске, сбрасывается при уходе со страницы.
 */
import { Result, Ok, Err } from 'ts-results';
import type { SwimlaneSettings, SwimlaneSetting, SwimlaneIssueStats } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { Logger } from 'src/infrastructure/logging/Logger';

export class BoardRuntimeModel {
  // === State ===

  /** Настройки (копия для быстрого доступа) */
  settings: SwimlaneSettings = {};

  /** Статистика по swimlanes */
  stats: { [swimlaneId: string]: SwimlaneIssueStats } = {};

  /** Названия колонок */
  columnNames: string[] = [];

  /** Флаг инициализации */
  isInitialized: boolean = false;

  constructor(
    private propertyModel: PropertyModel,
    private pageObject: IBoardPagePageObject,
    private logger: Logger
  ) {}

  /**
   * Инициализировать фичу на доске.
   * Загружает настройки и выполняет первичный рендер.
   */
  async initialize(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('BoardRuntimeModel.initialize');

    const settingsResult = await this.propertyModel.load();
    if (settingsResult.err) {
      return Err(settingsResult.val);
    }

    this.columnNames = this.pageObject.getColumns();
    this.settings = settingsResult.val;
    this.stats = {};
    this.isInitialized = true;

    this.render();

    log('Initialized');
    return Ok(undefined);
  }

  /**
   * Рендер лимитов и статистики на доске.
   * Вызывается при инициализации и изменениях DOM.
   *
   * ВАЖНО: НЕ рендерит React-компоненты в этой модели.
   * Это делает BoardPageModification через pageObject.insertSwimlaneComponent.
   * Модель только вычисляет статистику.
   */
  render(): void {
    const log = this.logger.getPrefixedLog('BoardRuntimeModel.render');

    const swimlanes = this.pageObject.getSwimlanes();
    const allStats: { [id: string]: SwimlaneIssueStats } = {};

    for (const swimlane of swimlanes) {
      const swimlaneId = swimlane.id;

      const setting = this.settings[swimlaneId];
      if (!setting?.limit) continue;

      const stats = this.calculateStats(swimlaneId, setting);
      allStats[swimlaneId] = stats;
    }

    this.stats = allStats;

    log(`Rendered (${swimlanes.length} swimlanes)`);
  }

  /**
   * Подсчёт статистики для swimlane с учётом выбранных колонок.
   *
   * @param swimlaneId - ID swimlane
   * @param setting - настройки swimlane (лимит + колонки)
   * @returns статистика: количество, распределение по колонкам, превышение
   */
  calculateStats(swimlaneId: string, setting: SwimlaneSetting): SwimlaneIssueStats {
    const wipOptions = {
      excludeDone: true,
      excludeSubtasks: true,
      ...(setting.includedIssueTypes?.length ? { includedIssueTypes: setting.includedIssueTypes } : {}),
    };

    const useAllColumns = setting.columns.length === 0;

    const count = useAllColumns
      ? this.pageObject.getIssueCountInSwimlane(swimlaneId, wipOptions)
      : this.pageObject.getIssueCountForColumns(swimlaneId, setting.columns, wipOptions);

    const columnCounts = this.pageObject.getIssueCountByColumn(swimlaneId, wipOptions);
    const isOverLimit = setting.limit ? count > setting.limit : false;

    return { count, columnCounts, isOverLimit };
  }

  /**
   * Cleanup при destroy.
   */
  destroy(): void {
    const swimlanes = this.pageObject.getSwimlanes();
    for (const swimlane of swimlanes) {
      const header = this.pageObject.getSwimlaneHeader(swimlane.id);
      if (header) {
        this.pageObject.removeSwimlaneComponent(header, 'swimlane-limit-badge');
      }
    }
    this.reset();
  }

  /**
   * Сбросить модель.
   */
  reset(): void {
    this.settings = {};
    this.stats = {};
    this.columnNames = [];
    this.isInitialized = false;
  }

  // === Queries (derived data) ===

  getSwimlaneStats(swimlaneId: string): SwimlaneIssueStats | undefined {
    return this.stats[swimlaneId];
  }

  isOverLimit(swimlaneId: string): boolean {
    const stats = this.stats[swimlaneId];
    const setting = this.settings[swimlaneId];

    if (!stats || !setting?.limit) return false;
    return stats.count > setting.limit;
  }

  getBadgeText(swimlaneId: string): string | null {
    const stats = this.stats[swimlaneId];
    const setting = this.settings[swimlaneId];

    if (!stats || !setting?.limit) return null;
    return `${stats.count}/${setting.limit}`;
  }
}
