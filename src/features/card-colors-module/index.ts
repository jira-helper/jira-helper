/**
 * Экспорты модуля card-colors.
 *
 * @module CardColorsModule
 */

// Экспорты токенов
export { propertyModelToken, settingsUIModelToken, runtimeModelToken } from './tokens';

// Экспорты модуля
export { cardColorsModule } from './module';

// Экспорты типов
export type { PropertyValue, CardColorsSettings, CardColorsConfig } from './types';

// Экспорты утилит
export {
  processCard,
  isFlagged,
  isAlreadyColoredByOtherTools,
  paintCard,
  markCardAsProcessed,
  type ProcessCardOptions,
} from './utils/processCard';
