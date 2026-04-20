/**
 * PropertyModel для управления настройками цветов карточек в свойствах доски.
 *
 * @module PropertyModel
 */

import { Result, Ok, Err } from 'ts-results';
import type { PropertyValue, CardColorsSettings } from '../types';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import type { Logger } from 'src/infrastructure/logging/Logger';

/**
 * Состояние загрузки данных.
 */
type LoadingState = 'initial' | 'loading' | 'loaded' | 'error';

/**
 * Ключ для хранения настроек цветов карточек в свойствах доски.
 */
const BOARD_PROPERTY_KEY = 'card-colors';

/**
 * Модель для работы с настройками цветов карточек в свойствах доски Jira.
 * Управляет загрузкой, сохранением и состоянием настроек.
 */
export class PropertyModel {
  /**
   * Текущие настройки цветов карточек.
   */
  settings: CardColorsSettings = { enabled: false };

  /**
   * Состояние загрузки данных.
   */
  state: LoadingState = 'initial';

  /**
   * Ошибка загрузки или сохранения.
   */
  error: string | null = null;

  constructor(
    private boardPropertyService: BoardPropertyServiceI,
    private logger: Logger
  ) {}

  /**
   * Загружает настройки цветов карточек из свойств доски.
   *
   * @returns Результат с настройками или ошибкой
   */
  async load(): Promise<Result<CardColorsSettings, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.load');

    if (this.state === 'loading') {
      log('Already loading, skip');
      return Ok(this.settings);
    }

    this.state = 'loading';

    try {
      const propertyValue = await this.boardPropertyService.getBoardProperty<PropertyValue>(BOARD_PROPERTY_KEY);

      // Преобразуем PropertyValue в CardColorsSettings
      const settings: CardColorsSettings = {
        enabled: propertyValue?.value ?? false,
      };

      this.settings = settings;
      this.state = 'loaded';
      this.error = null;

      log(`Loaded settings: enabled=${settings.enabled}`);
      return Ok(settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state = 'error';
      this.error = errorMessage;
      log(`Failed to load: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  /**
   * Сохраняет настройки цветов карточек в свойства доски.
   *
   * @param settings - настройки для сохранения
   * @returns Результат операции
   */
  async save(settings: CardColorsSettings): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.save');

    try {
      // Преобразуем CardColorsSettings в PropertyValue
      const propertyValue: PropertyValue = {
        value: settings.enabled,
      };

      await this.boardPropertyService.updateBoardProperty(BOARD_PROPERTY_KEY, propertyValue, {});

      this.settings = settings;

      log(`Saved settings: enabled=${settings.enabled}`);
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Failed to save: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  /**
   * Обновляет настройку включения/выключения функции.
   *
   * @param enabled - включена ли функция
   */
  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
  }

  /**
   * Проверяет, включена ли функция цветов карточек.
   *
   * @returns true если функция включена
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Сбрасывает состояние модели к начальному.
   */
  reset(): void {
    this.settings = { enabled: false };
    this.state = 'initial';
    this.error = null;
  }
}
