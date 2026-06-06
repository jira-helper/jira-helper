/**
 * DI токены для модуля card-colors.
 *
 * @module CardColorsTokens
 */

import { createModelToken } from 'src/infrastructure/di/Module';
import type { PropertyModel } from './property/PropertyModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import type { RuntimeModel } from './BoardPage/models/RuntimeModel';

/**
 * Токен для PropertyModel.
 * Управляет настройками цветов карточек в свойствах доски Jira.
 */
export const propertyModelToken = createModelToken<PropertyModel>('card-colors/propertyModel');

/**
 * Токен для SettingsUIModel.
 * Управляет состоянием UI на странице настроек.
 */
export const settingsUIModelToken = createModelToken<SettingsUIModel>('card-colors/settingsUIModel');

/**
 * Токен для RuntimeModel.
 * Управляет логикой применения цветов на странице доски.
 */
export const runtimeModelToken = createModelToken<RuntimeModel>('card-colors/runtimeModel');
