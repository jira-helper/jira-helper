/**
 * CardColors - настройки цветов карточек.
 * Хранятся в Jira Board Property под ключом 'card-colors'.
 *
 * @module CardColorsTypes
 */

/**
 * PropertyValue - значение настройки для цветов карточек.
 * undefined означает, что настройка не установлена (по умолчанию отключено).
 */
export type PropertyValue =
  | {
      value: boolean;
    }
  | undefined;

/**
 * Настройки цветов карточек.
 * Включает только один флаг включения/выключения функции.
 */
export type CardColorsSettings = {
  enabled: boolean;
};

/**
 * Конфигурация для преобразования цветов карточек.
 */
export type CardColorsConfig = {
  /**
   * Минимальная яркость (lightness) для применения цвета.
   * Если цвет слишком светлый, он будет усилен.
   */
  minLightness: number;

  /**
   * Шаг увеличения яркости при применении цвета к карточке.
   */
  lightnessBoost: number;

  /**
   * Цвета, которые игнорируются как уже окрашенные другими инструментами.
   */
  excludedColors: string[];
};
