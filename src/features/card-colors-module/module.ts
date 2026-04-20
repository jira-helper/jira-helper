/**
 * Модуль card-colors для регистрации в DI контейнере.
 *
 * @module CardColorsModule
 */

import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { loggerToken } from 'src/infrastructure/logging/Logger';
import { propertyModelToken, settingsUIModelToken, runtimeModelToken } from './tokens';
import { PropertyModel } from './property/PropertyModel';
import { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import { RuntimeModel } from './BoardPage/models/RuntimeModel';

/**
 * Модуль карточных цветов.
 * Регистрирует все модели фичи в DI контейнере.
 */
class CardColorsModule extends Module {
  register(container: Container): void {
    // PropertyModel - управление настройками в Board Properties
    this.lazy(container, propertyModelToken, c =>
      modelEntry(new PropertyModel(c.inject(BoardPropertyServiceToken), c.inject(loggerToken)))
    );

    // SettingsUIModel - состояние UI настроек
    this.lazy(container, settingsUIModelToken, c => {
      const { model: propertyModel } = c.inject(propertyModelToken);
      return modelEntry(new SettingsUIModel(propertyModel, c.inject(loggerToken)));
    });

    // RuntimeModel - логика применения цветов на доске
    this.lazy(container, runtimeModelToken, c => {
      const { model: propertyModel } = c.inject(propertyModelToken);
      return modelEntry(new RuntimeModel(propertyModel, c.inject(boardPagePageObjectToken), c.inject(loggerToken)));
    });
  }
}

export const cardColorsModule = new CardColorsModule();
