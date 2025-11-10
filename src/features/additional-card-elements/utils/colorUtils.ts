/**
 * Массив из 50 пастельных цветов для автоматического выбора цвета связей
 */
export const PASTEL_COLORS = [
  '#FFB3BA', // Pastel Red
  '#FFDFBA', // Pastel Orange
  '#FFFFBA', // Pastel Yellow
  '#BAFFC9', // Pastel Green
  '#BAE1FF', // Pastel Blue
  '#E1BAFF', // Pastel Purple
  '#FFB3E6', // Pastel Pink
  '#B3FFE6', // Pastel Mint
  '#FFE6B3', // Pastel Peach
  '#E6FFB3', // Pastel Lime
  '#B3E6FF', // Pastel Sky
  '#E6B3FF', // Pastel Lavender
  '#FFB3D9', // Pastel Rose
  '#B3FFD9', // Pastel Aqua
  '#FFD9B3', // Pastel Apricot
  '#D9FFB3', // Pastel Chartreuse
  '#B3D9FF', // Pastel Cornflower
  '#D9B3FF', // Pastel Orchid
  '#FFB3C7', // Pastel Coral
  '#B3FFC7', // Pastel Emerald
  '#FFC7B3', // Pastel Salmon
  '#C7FFB3', // Pastel Spring
  '#B3C7FF', // Pastel Periwinkle
  '#C7B3FF', // Pastel Violet
  '#FFB3B3', // Pastel Light Red
  '#B3FFB3', // Pastel Light Green
  '#B3B3FF', // Pastel Light Blue
  '#FFB3FF', // Pastel Light Magenta
  '#B3FFFF', // Pastel Light Cyan
  '#FFFFB3', // Pastel Light Yellow
  '#FFCCCC', // Pastel Pink Red
  '#CCFFCC', // Pastel Mint Green
  '#CCCCFF', // Pastel Lavender Blue
  '#FFCCFF', // Pastel Lavender Pink
  '#CCFFFF', // Pastel Light Blue
  '#FFFFCC', // Pastel Light Yellow
  '#FFE6CC', // Pastel Peach
  '#E6FFCC', // Pastel Light Green
  '#CCE6FF', // Pastel Light Blue
  '#E6CCFF', // Pastel Light Purple
  '#FFCCE6', // Pastel Light Pink
  '#CCFFE6', // Pastel Light Mint
  '#E6FFE6', // Pastel Light Green
  '#E6E6FF', // Pastel Light Blue
  '#FFE6E6', // Pastel Light Pink
  '#F0E6FF', // Pastel Light Purple
  '#E6F0FF', // Pastel Light Blue
  '#FFE6F0', // Pastel Light Pink
  '#E6FFFF', // Pastel Light Cyan
  '#FFFFE6', // Pastel Light Yellow
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
    hash = (hash << 5) - hash + char;
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
