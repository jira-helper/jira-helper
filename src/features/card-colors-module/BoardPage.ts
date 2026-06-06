/**
 * PageModification для применения цветов карточек на странице доски.
 *
 * @module CardColorsBoardPage
 */

import { Token } from 'dioma';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import { runtimeModelToken } from './tokens';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';

/**
 * PageModification для применения цветов карточек на странице доски.
 * Активирует RuntimeModel и настраивает обработку DOM изменений.
 */
export class CardColorsBoardPage extends PageModification<undefined, Element> {
  /**
   * Токен для регистрации PageModification в DI контейнере.
   */
  static readonly token = new Token<CardColorsBoardPage>('CardColorsBoardPage');

  /**
   * Атрибут для пометки обработанных карточек (наследуется из RuntimeModel через модели).
   */
  private processedAttribute = 'jh-card-colors-processed';

  constructor(container: Container) {
    super(container);
  }

  /**
   * Получить уникальный ID модификации.
   */
  getModificationId(): string {
    return `card-colors-board-${this.getBoardId()}`;
  }

  /**
   * Дождаться загрузки необходимых DOM элементов.
   */
  waitForLoading(): Promise<Element> {
    const boardPage = this.container.inject(boardPagePageObjectToken);
    return this.waitForElement(boardPage.selectors.pool);
  }

  /**
   * Загрузить данные (не требуется для этой фичи).
   */
  loadData(): Promise<undefined> {
    return Promise.resolve(undefined);
  }

  /**
   * Применить модификации на странице.
   */
  async apply(): Promise<void> {
    const runtimeModelEntry = this.container.inject(runtimeModelToken);
    const runtimeModel = runtimeModelEntry.model;

    // Активируем обработку цветов
    const activationResult = await runtimeModel.activate();

    if (activationResult.err) {
      // eslint-disable-next-line no-console
      console.error('Failed to activate card colors:', activationResult.val.message);
      return;
    }

    // Если функция отключена, ничего не делаем
    if (!runtimeModel.isActive) {
      return;
    }

    // Настраиваем обработку DOM изменений
    const boardPage = this.container.inject(boardPagePageObjectToken);

    this.onDOMChange(boardPage.selectors.pool, () => {
      runtimeModel.processCards();
    });

    // Добавляем cleanup для деактивации модели
    this.sideEffects.push(() => {
      runtimeModel.deactivate();
    });
  }

  /**
   * Очистить модификации.
   */
  clear(): void {
    // Деактивация модели происходит через sideEffects
    super.clear();
  }
}

// Экспорт токена
export const cardColorsBoardPageToken = CardColorsBoardPage.token;

// Импорты типов
import type { Container } from 'dioma';
