/**
 * PageModification для страницы настроек цветов карточек.
 *
 * @module CardColorsSettingsPage
 */

import { createRoot } from 'react-dom/client';
import React from 'react';
import { Token } from 'dioma';
import { PageModification } from 'src/infrastructure/page-modification/PageModification';
import { WithDi } from 'src/infrastructure/di/diContext';
import { settingsPagePageObjectToken } from 'src/infrastructure/page-objects/SettingsPage';
import { CardColorsSettingsContainer } from './SettingsPage/components/CardColorsSettingsContainer';
import { settingsUIModelToken } from './tokens';

/**
 * PageModification для страницы настроек цветов карточек.
 * Вставляет React компонент настроек и использует SettingsUIModel для управления состоянием.
 */
export default class CardColorsSettingsPage extends PageModification<undefined, Element> {
  /**
   * Токен для регистрации PageModification в DI контейнере.
   */
  static readonly token = new Token<CardColorsSettingsPage>('CardColorsSettingsPage');

  /**
   * Получить доступ к объекту страницы настроек.
   */
  private get settingsPage() {
    return this.container.inject(settingsPagePageObjectToken);
  }

  constructor(container: Container) {
    super(container);
  }

  /**
   * Получить уникальный ID модификации.
   */
  getModificationId(): string {
    return `card-colors-settings-${this.getBoardId()}`;
  }

  /**
   * Проверить, должна ли модификация применяться.
   * Проверяет активна ли вкладка настроек цветов карточек.
   */
  async shouldApply(): Promise<boolean> {
    return (await this.getSettingsTab()) === 'cardColors';
  }

  /**
   * Дождаться загрузки необходимых DOM элементов.
   */
  waitForLoading(): Promise<Element> {
    return this.waitForElement(this.settingsPage.selectors.settingsContent);
  }

  /**
   * Загрузить данные (не требуется для этой фичи).
   */
  loadData(): Promise<undefined> {
    return Promise.resolve(undefined);
  }

  /**
   * Применить модификации на странице.
   * Вставляет React компонент настроек цветов карточек.
   */
  async apply(): Promise<void> {
    const CardColorsSettings = this.settingsPage.getCardColorsSettingsTabPageObject();

    const el = CardColorsSettings.createSpaceBeforeColorsTable();
    if (!el) {
      // eslint-disable-next-line no-console
      console.error('Cannot insert CardColors settings component');
      return;
    }

    // Получаем модель для управления состоянием UI
    const settingsUIModelEntry = this.container.inject(settingsUIModelToken);

    createRoot(el).render(
      <WithDi container={this.container}>
        <CardColorsSettingsContainer settingsUIModel={settingsUIModelEntry} />
      </WithDi>
    );
  }

  /**
   * Очистить модификации.
   */
  clear(): void {
    // При закрытии страницы сбрасываем состояние модели
    const settingsUIModelEntry = this.container.inject(settingsUIModelToken);
    settingsUIModelEntry.model.reset();

    super.clear();
  }
}

// Экспорт токена
export const cardColorsSettingsPageToken = CardColorsSettingsPage.token;

// Импорты типов
import type { Container } from 'dioma';
