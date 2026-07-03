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
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';

const REPAINT_DEBOUNCE_MS = 1000;
const DEBUG_FLAG = 'jh-card-colors-debug';
const DEBUG_PREFIX = '[JH_CARD_COLORS_DEBUG]';

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
   * ID отложенной обработки карточек после DOM-мутаций.
   */
  private repaintTimeoutId: number | null = null;

  private styleDiagnosticsObserver: MutationObserver | null = null;

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
      this.safeProcessCards('activate');

      // Устанавливаем интервал для периодической обработки
      this.intervalId = window.setInterval(() => {
        this.safeProcessCards('interval');
      }, REPAINT_DEBOUNCE_MS);

      this.addCleanup(() => {
        if (this.intervalId) {
          window.clearInterval(this.intervalId);
          this.intervalId = null;
        }
      });

      const diagnosticsTimeoutId = window.setTimeout(() => {
        this.ensureStyleDiagnostics();
      }, 0);
      this.addCleanup(() => window.clearTimeout(diagnosticsTimeoutId));

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
    this.clearScheduledRepaint();
    this.stopStyleDiagnostics();

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

    this.debugLog('process-cards', {
      count: cards.length,
      reason: 'interval-or-scheduled-repaint',
    });

    // Импортируем функцию преобразования цвета
    import('src/shared/utils')
      .then(({ hslFromRGB }) => {
        // Импортируем утилиты обработки карточек
        import('../../utils/processCard').then(({ processCard }) => {
          cards.forEach(card => {
            this.debugLogCard('before-paint', card as HTMLElement);
            processCard(
              { card: card as HTMLElement, processedAttribute: this.processedAttribute },
              this.boardPage.selectors,
              this.boardPage.classlist.flagged,
              hslFromRGB
            );
            this.debugLogCard('after-paint', card as HTMLElement);
          });
        });
      })
      .catch(error => {
        this.logger.getPrefixedLog('RuntimeModel.processCards')(`Failed to import utils: ${error.message}`, 'error');
      });
  }

  /**
   * Запланировать обработку карточек после серии DOM-мутаций.
   */
  scheduleProcessCards(): void {
    if (!this.isActive) {
      return;
    }

    this.clearScheduledRepaint();
    this.debugLog('schedule-process-cards', { delayMs: REPAINT_DEBOUNCE_MS });

    this.repaintTimeoutId = window.setTimeout(() => {
      this.repaintTimeoutId = null;
      this.debugLog('run-scheduled-process-cards');
      this.safeProcessCards('scheduled');
    }, REPAINT_DEBOUNCE_MS);
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
          this.debugLogCard('before-single-card-paint', card);
          processCard(
            { card, processedAttribute: this.processedAttribute },
            this.boardPage.selectors,
            this.boardPage.classlist.flagged,
            hslFromRGB
          );
          this.debugLogCard('after-single-card-paint', card);
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

  private clearScheduledRepaint(): void {
    if (this.repaintTimeoutId === null) {
      return;
    }

    window.clearTimeout(this.repaintTimeoutId);
    this.repaintTimeoutId = null;
  }

  private safeProcessCards(reason: string): void {
    try {
      this.processCards();
    } catch (error) {
      this.debugFailure('process-cards-failed', error, { reason });
      this.logger.getPrefixedLog('RuntimeModel.processCards')(
        `Synchronous processCards failure: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  }

  private ensureStyleDiagnostics(): void {
    try {
      if (this.styleDiagnosticsObserver || !this.isDebugEnabled()) {
        return;
      }

      const pool = document.querySelector(this.boardPage.selectors.pool);
      if (!pool) {
        return;
      }

      this.debugLog('style-diagnostics-started');

      this.styleDiagnosticsObserver = new MutationObserver(records => {
        records.forEach(record => {
          const card = (record.target as Element).closest(this.boardPage.selectors.issue) as HTMLElement | null;
          if (!card) {
            return;
          }

          this.debugLog('card-style-mutated', {
            issueKey: this.getIssueKey(card),
            processed: card.hasAttribute(this.processedAttribute),
            oldStyle: record.oldValue,
            newStyle: card.getAttribute('style'),
            backgroundColor: card.style.backgroundColor,
            className: card.className,
          });
        });
      });

      this.styleDiagnosticsObserver.observe(pool, {
        attributes: true,
        attributeFilter: ['style'],
        attributeOldValue: true,
        subtree: true,
      });
    } catch (error) {
      this.stopStyleDiagnostics();
      this.debugFailure('style-diagnostics-failed', error);
    }
  }

  private stopStyleDiagnostics(): void {
    this.styleDiagnosticsObserver?.disconnect();
    this.styleDiagnosticsObserver = null;
  }

  private isDebugEnabled(): boolean {
    try {
      return window.localStorage.getItem(DEBUG_FLAG) === '1';
    } catch {
      return false;
    }
  }

  private debugLog(event: string, payload: Record<string, unknown> = {}): void {
    try {
      if (!this.isDebugEnabled()) {
        return;
      }

      // eslint-disable-next-line no-console
      console.info.call(console, DEBUG_PREFIX, {
        event,
        time: new Date().toISOString(),
        now: Math.round(performance.now.call(performance)),
        ...payload,
      });
    } catch (error) {
      this.debugFailure('debug-log-failed', error);
    }
  }

  private debugLogCard(event: string, card: HTMLElement): void {
    try {
      this.debugLog(event, {
        issueKey: this.getIssueKey(card),
        processed: card.hasAttribute(this.processedAttribute),
        style: card.getAttribute('style'),
        backgroundColor: card.style.backgroundColor,
        grabberBackgroundColor: (card.querySelector(this.boardPage.selectors.grabber) as HTMLElement | null)?.style
          .backgroundColor,
        className: card.className,
      });
    } catch (error) {
      this.debugFailure('debug-log-card-failed', error);
    }
  }

  private getIssueKey(card: HTMLElement): string | null {
    try {
      return card.getAttribute('data-issue-key') ?? card.querySelector('.ghx-key')?.textContent?.trim() ?? null;
    } catch {
      return null;
    }
  }

  private debugFailure(event: string, error: unknown, payload: Record<string, unknown> = {}): void {
    try {
      if (!this.isDebugEnabled()) {
        return;
      }

      // eslint-disable-next-line no-console
      console.warn.call(console, DEBUG_PREFIX, {
        event,
        message: error instanceof Error ? error.message : String(error),
        ...payload,
      });
    } catch {
      // Diagnostics must never break card colors runtime.
    }
  }

  /**
   * Проверить, включена ли функция цветов карточек.
   */
  isEnabled(): boolean {
    return this.propertyModel.isEnabled();
  }

  /**
   * Read-only diagnostic snapshot: runtime flags only, no DOM or private fields.
   */
  getDiagnosticSnapshot(): FeatureDiagnosticData {
    return {
      isActive: this.isActive,
      error: this.error,
      intervalActive: this.intervalId !== null,
    };
  }

  /**
   * Сбросить состояние модели.
   */
  reset(): void {
    this.deactivate();
    this.error = null;
  }
}
