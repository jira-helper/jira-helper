/**
 * @module SettingsUIModel
 *
 * Модель для состояния модального окна настроек WIP-лимитов.
 *
 * ## Жизненный цикл
 * Создаётся при открытии Settings popup, сбрасывается при закрытии.
 */
import { Result, Ok, Err } from 'ts-results';
import type { SwimlaneSettings, Swimlane, SwimlaneSetting, BoardData } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/shared/Logger';

export class SettingsUIModel {
  // === State ===

  /** Modal открыт */
  isOpen: boolean = false;

  /** Черновик настроек (редактируемая копия) */
  draft: SwimlaneSettings = {};

  /** Список swimlanes для отображения */
  swimlanes: Swimlane[] = [];

  /** ID swimlane в режиме редактирования */
  editingSwimlaneId: string | null = null;

  /** Сообщение об ошибке */
  error: string | null = null;

  /** Состояние сохранения */
  isSaving: boolean = false;

  /** Состояние загрузки */
  isLoading: boolean = false;

  constructor(
    private propertyModel: PropertyModel,
    private getBoardEditData: () => Promise<BoardData>,
    private logger: Logger
  ) {}

  /**
   * Открыть modal настроек.
   * Загружает текущие настройки и данные доски.
   */
  async open(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('SettingsUIModel.open');

    // Открываем модалку сразу, показываем спиннер внутри
    this.isOpen = true;
    this.isLoading = true;
    this.error = null;

    try {
      const [settingsResult, boardData] = await Promise.all([this.propertyModel.load(), this.getBoardEditData()]);

      if (settingsResult.err) {
        this.error = settingsResult.val.message;
        this.isLoading = false;
        log(`Failed to load settings: ${settingsResult.val.message}`);
        return Err(settingsResult.val);
      }

      this.draft = { ...settingsResult.val };
      this.swimlanes = boardData.swimlanesConfig?.swimlanes ?? [];
      this.editingSwimlaneId = null;
      this.isLoading = false;

      log('Opened modal');
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.error = errorMessage;
      this.isLoading = false;
      log(`Failed to load board data: ${errorMessage}`);
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  /**
   * Сохранить изменения и закрыть modal.
   */
  async save(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('SettingsUIModel.save');

    this.isSaving = true;
    this.error = null;

    const result = await this.propertyModel.save(this.draft);

    if (result.err) {
      this.error = result.val.message;
      this.isSaving = false;
      log(`Failed to save: ${result.val.message}`);
      return Err(result.val);
    }

    this.close();
    log('Saved and closed');
    return Ok(undefined);
  }

  /**
   * Закрыть modal без сохранения.
   */
  close(): void {
    this.isOpen = false;
    this.draft = {};
    this.swimlanes = [];
    this.editingSwimlaneId = null;
    this.error = null;
    this.isSaving = false;
    this.isLoading = false;
  }

  /**
   * Обновить черновик для swimlane.
   */
  updateDraft(swimlaneId: string, update: Partial<SwimlaneSetting>): void {
    const existing = this.draft[swimlaneId] || { columns: [] };
    this.draft = {
      ...this.draft,
      [swimlaneId]: { ...existing, ...update },
    };
  }

  /**
   * Установить ID редактируемого swimlane.
   */
  setEditingSwimlaneId(id: string | null): void {
    this.editingSwimlaneId = id;
  }

  /**
   * Сбросить в начальное состояние.
   */
  reset(): void {
    this.close();
  }

  /**
   * Проверка: есть ли несохранённые изменения.
   */
  get hasUnsavedChanges(): boolean {
    return JSON.stringify(this.draft) !== JSON.stringify(this.propertyModel.settings);
  }
}
