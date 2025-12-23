/**
 * Массив из 20 легко различимых цветов для автоматического выбора цвета связей
 * Включает пастельные и более насыщенные оттенки для лучшей визуальной различимости
 */
export const PASTEL_COLORS = [
  '#FF6B6B', // Coral Red - яркий, хорошо различимый
  '#4ECDC4', // Turquoise - насыщенный бирюзовый
  '#45B7D1', // Sky Blue - яркий голубой
  '#FFA07A', // Light Salmon - мягкий оранжево-розовый
  '#98D8C8', // Mint Green - пастельный мятный
  '#F7DC6F', // Soft Yellow - мягкий желтый
  '#BB8FCE', // Lavender - пастельный фиолетовый
  '#85C1E2', // Light Blue - светлый голубой
  '#F8B739', // Golden Yellow - золотисто-желтый
  '#52BE80', // Emerald Green - изумрудный зеленый
  '#EC7063', // Soft Red - мягкий красный
  '#5DADE2', // Bright Blue - яркий синий
  '#F1948A', // Pink Coral - розово-коралловый
  '#7FB3D3', // Powder Blue - пудрово-голубой
  '#F4D03F', // Bright Yellow - яркий желтый
  '#82E0AA', // Light Green - светлый зеленый
  '#D7BDE2', // Light Purple - светлый фиолетовый
  '#F5B7B1', // Peach Pink - персиково-розовый
  '#AED6F1', // Baby Blue - детский голубой
  '#A9DFBF', // Light Mint - светлый мятный
];

/**
 * Простая хеш-функция для строки
 * @param str - входная строка
 * @returns хеш-число
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + char;
    // eslint-disable-next-line no-bitwise
    hash &= hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Получает автоматический цвет для связи на основе ключа и заголовка задачи
 * @param issueKey - ключ задачи (например, "PROJ-123")
 * @param issueSummary - заголовок задачи
 * @returns пастельный цвет в формате HEX
 */
export function getAutoColor(issueKey: string, issueSummary: string): string {
  const hashInput = issueKey + issueSummary;
  const hash = simpleHash(hashInput);
  const colorIndex = hash % PASTEL_COLORS.length;
  return PASTEL_COLORS[colorIndex];
}

/**
 * Получает цвет для отображения связи
 * @param customColor - кастомный цвет из настроек (может быть undefined)
 * @param issueKey - ключ задачи
 * @param issueSummary - заголовок задачи
 * @returns цвет для отображения
 */
export function getLinkColor(customColor: string | undefined, issueKey: string, issueSummary: string): string {
  if (customColor) {
    return customColor;
  }
  return getAutoColor(issueKey, issueSummary);
}

/**
 * Проверяет, является ли цвет светлым (для определения цвета текста)
 * @param hexColor - цвет в формате HEX
 * @returns true если цвет светлый, false если темный
 */
export function isLightColor(hexColor: string): boolean {
  // Убираем # если есть
  const color = hexColor.replace('#', '');

  // Конвертируем в RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Вычисляем яркость по формуле
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128;
}

/**
 * Получает контрастный цвет текста для фона
 * @param backgroundColor - цвет фона
 * @returns цвет текста (#000000 или #FFFFFF)
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
}
