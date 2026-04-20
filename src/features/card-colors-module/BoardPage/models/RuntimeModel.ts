/**
 * @module RuntimeModel
 *
 * Модель для логики применения цветов карточек на странице доски.
 *
 * ## Жизненный цикл
 * Создаётся при загрузке страницы доски, работает пока страница открыта.
 */

import { Result, Ok, Err } from 'ts-results';
import type { CardColorsSettings } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { Logger } from 'src/infrastructure/logging/Logger';

/**
 * Модель для логики применения цветов карточек на странице доски.
 * Управляет обработкой карточек, интервалами обновления и DOM изменениями.
 */
export class RuntimeModel {
  /**
   * Атрибут для пометки обработанных карточек.
   */
  private processedAttribute = 'jh-card-colors-processed';

  /**
   * ID интервала для периодической обработки.
   */
  private intervalId: number | null = null;

  /**
   * Функция для очистки side effects.
   */
  private cleanupCallbacks: Array<() => void> = [];

  /**
   * Состояние модели.
   */
  isActive: boolean = false;
  error: string | null = null;

  constructor(
    private propertyModel: PropertyModel,
    private boardPage: IBoardPagePageObject,
    private logger: Logger
  ) {}

  /**
   * Активировать обработку цветов карточек.
   */
  async activate(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('RuntimeModel.activate');

    if (this.isActive) {
      log('Already active');
      return Ok(undefined);
    }

    try {
      // Загружаем настройки
      const settingsResult = await this.propertyModel.load();

      if (settingsResult.err) {
        this.error = settingsResult.val.message;
        log(`Failed to load settings: ${settingsResult.val.message}`, 'error');
        return Err(settingsResult.val);
      }

      // TypeScript знает, что после проверки err, val это CardColorsSettings
      const settings = settingsResult.val as CardColorsSettings;

      // Проверяем, включена ли функция
      if (!settings.enabled) {
        log('Card colors disabled');
        this.isActive = false;
        return Ok(undefined);
      }

      this.isActive = true;
      this.error = null;

      // Запускаем обработку
      this.processCards();

      // Устанавливаем интервал для периодической обработки
      this.intervalId = window.setInterval(() => {
        this.processCards();
      }, 200);

      this.addCleanup(() => {
        if (this.intervalId) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }
      });

      log('Activated card colors processing');
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.error = errorMessage;
      log(`Failed to activate: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  /**
   * Деактивировать обработку цветов карточек.
   */
  deactivate(): void {
    const log = this.logger.getPrefixedLog('RuntimeModel.deactivate');

    this.isActive = false;

    // Выполняем cleanup
    this.cleanupCallbacks.forEach(callback => callback());
    this.cleanupCallbacks = [];

    log('Deactivated card colors processing');
  }

  /**
   * Обработать все карточки на странице.
   */
  processCards(): void {
    if (!this.isActive) {
      return;
    }

    // Берём карточки в двух случаях:
    //   1) ещё не обработаны — `:not([processedAttribute])`;
    //   2) уже обработаны, но Jira перезатёрла `style` (например, при ленивой гидратации карточки,
    //      попадающей во viewport) — `[processedAttribute]:not([style])` или `[style=""]`.
    // Без второй части цвет на видимых карточках сбрасывается «навсегда»: маркер обработки остаётся,
    // селектор без проверки `style` карточку больше не подхватит.
    const baseSelector = `${this.boardPage.selectors.issue}:not(${this.boardPage.selectors.flagged})`;
    const cards = document.querySelectorAll(
      `${baseSelector}:not([${this.processedAttribute}]),` +
        `${baseSelector}[${this.processedAttribute}]:not([style]),` +
        `${baseSelector}[${this.processedAttribute}][style=""]`
    );

    // Импортируем функцию преобразования цвета
    import('src/shared/utils')
      .then(({ hslFromRGB }) => {
        // Импортируем утилиты обработки карточек
        import('../../utils/processCard').then(({ processCard }) => {
          cards.forEach(card => {
            processCard(
              { card: card as HTMLElement, processedAttribute: this.processedAttribute },
              this.boardPage.selectors,
              this.boardPage.classlist.flagged,
              hslFromRGB
            );
          });
        });
      })
      .catch(error => {
        this.logger.getPrefixedLog('RuntimeModel.processCards')(`Failed to import utils: ${error.message}`, 'error');
      });
  }

  /**
   * Обработать конкретную карточку.
   */
  processCard(card: HTMLElement): void {
    if (!this.isActive) {
      return;
    }

    import('src/shared/utils')
      .then(({ hslFromRGB }) => {
        import('../../utils/processCard').then(({ processCard }) => {
          processCard(
            { card, processedAttribute: this.processedAttribute },
            this.boardPage.selectors,
            this.boardPage.classlist.flagged,
            hslFromRGB
          );
        });
      })
      .catch(error => {
        this.logger.getPrefixedLog('RuntimeModel.processCard')(`Failed to import utils: ${error.message}`, 'error');
      });
  }

  /**
   * Добавить callback для очистки side effects.
   */
  private addCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Проверить, включена ли функция цветов карточек.
   */
  isEnabled(): boolean {
    return this.propertyModel.isEnabled();
  }

  /**
   * Сбросить состояние модели.
   */
  reset(): void {
    this.deactivate();
    this.error = null;
  }
}
