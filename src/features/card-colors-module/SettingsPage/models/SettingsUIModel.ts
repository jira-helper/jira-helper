/**
 * @module SettingsUIModel
 *
 * Модель для состояния UI настроек цветов карточек.
 *
 * ## Жизненный цикл
 * Создаётся при открытии Settings popup, сбрасывается при закрытии.
 */

import { Result, Ok, Err } from 'ts-results';
import type { CardColorsSettings } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/infrastructure/logging/Logger';

/**
 * Модель для управления состоянием UI настроек цветов карточек.
 * Управляет состоянием модального окна, черновиком настроек и операциями сохранения.
 */
export class SettingsUIModel {
  // === State ===

  /** Modal открыт */
  isOpen: boolean = false;

  /** Черновик настроек (редактируемая копия) */
  draft: CardColorsSettings = { enabled: false };

  /** Сообщение об ошибке */
  error: string | null = null;

  /** Состояние сохранения */
  isSaving: boolean = false;

  /** Состояние загрузки */
  isLoading: boolean = false;

  constructor(
    private propertyModel: PropertyModel,
    private logger: Logger
  ) {}

  /**
   * Открыть modal настроек.
   * Загружает текущие настройки.
   */
  async open(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('SettingsUIModel.open');

    // Открываем модалку сразу, показываем спиннер внутри
    this.isOpen = true;
    this.isLoading = true;
    this.error = null;

    try {
      const settingsResult = await this.propertyModel.load();

      if (settingsResult.err) {
        this.error = settingsResult.val.message;
        this.isLoading = false;
        log(`Failed to load settings: ${settingsResult.val.message}`);
        return Err(settingsResult.val);
      }

      this.draft = { ...(settingsResult.val as CardColorsSettings) };
      this.isLoading = false;

      log(`Opened modal, enabled=${this.draft.enabled}`);
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.error = errorMessage;
      this.isLoading = false;
      log(`Failed to load settings: ${errorMessage}`);
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

    this.isSaving = false;
    log(`Saved, enabled=${this.draft.enabled}`);
    return Ok(undefined);
  }

  /**
   * Закрыть modal без сохранения.
   */
  close(): void {
    this.isOpen = false;
    this.draft = { enabled: false };
    this.error = null;
    this.isSaving = false;
    this.isLoading = false;
  }

  /**
   * Обновить черновик настроек.
   */
  updateDraft(update: Partial<CardColorsSettings>): void {
    this.draft = {
      ...this.draft,
      ...update,
    };
  }

  /**
   * Включить/выключить функцию цветов карточек.
   */
  setEnabled(enabled: boolean): void {
    this.draft.enabled = enabled;
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
