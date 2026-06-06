/**
 * Утилиты для обработки цветов карточек.
 * Чистые функции без side effects, могут импортироваться напрямую.
 *
 * @module CardColorsUtils
 */

/**
 * Конфигурация исключаемых цветов.
 * Цвета, которые уже используются другими инструментами jira-helper.
 */
const EXCLUDED_COLORS = {
  jiraHelperWIP: 'rgb(255, 86, 48)',
} as const;

/**
 * Конфигурация преобразования цветов.
 */
const COLOR_CONFIG = {
  lightnessBoost: 0.3,
  minLightness: 0.95,
} as const;

/**
 * Опции для обработки карточки.
 */
export interface ProcessCardOptions {
  card: HTMLElement;
  processedAttribute: string;
}

/**
 * Проверяет, окрашена ли карточка другими инструментами jira-helper.
 *
 * @param card - HTML элемент карточки
 * @returns true если карточка уже окрашена другими инструментами
 */
export function isAlreadyColoredByOtherTools(card: HTMLElement): boolean {
  const color = card.style.backgroundColor;
  return Object.values(EXCLUDED_COLORS).some(c => c === color);
}

/**
 * Проверяет, помечена ли карточка флагом (flagged).
 *
 * @param card - HTML элемент карточки
 * @param flaggedClass - CSS класс для помеченных карточек
 * @returns true если карточка помечена флагом
 */
export function isFlagged(card: HTMLElement, flaggedClass: string): boolean {
  return card.classList.contains(flaggedClass);
}

/**
 * Применяет цвет к карточке, увеличивая яркость.
 *
 * @param card - HTML элемент карточки
 * @param grabber - HTML элемент захвата (grabber) с исходным цветом
 * @param hslFromRGB - функция преобразования RGB в HSL
 */
export function paintCard(
  card: HTMLElement,
  grabber: HTMLElement,
  hslFromRGB: (r: number, g: number, b: number) => number[]
): void {
  const color = grabber.style.backgroundColor;
  const colorIsOk = color.match(/rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)/);

  if (!colorIsOk) {
    return;
  }

  const [rgbString] = colorIsOk;
  const [r, g, b] = rgbString.match(/\d{1,3}/g)!.map(Number);
  const result = hslFromRGB(r, g, b);
  const [h, s, l] = result;

  const newL = l + COLOR_CONFIG.lightnessBoost > 1 ? 1 : l + COLOR_CONFIG.lightnessBoost;

  // Если цвет становится слишком светлым (близким к белому),
  // используем среднее значение между текущей яркостью и максимальной
  let finalL: number;
  if (newL >= COLOR_CONFIG.minLightness) {
    finalL = (l + COLOR_CONFIG.minLightness) / 2;
  } else {
    finalL = newL;
  }

  const finalColor = `hsl(${h}, ${s * 100}%, ${finalL * 100}%)`;

  // Сохраняем оригинальный цвет только при первой покраске. При перепокраске после
  // Jira-перезатирания `style` `backgroundColor` уже пустой, и сохранять его не нужно.
  if (!card.hasAttribute('current-color')) {
    card.setAttribute('current-color', card.style.backgroundColor);
  }
  card.style.backgroundColor = finalColor;
}

/**
 * Помечает карточку как обработанную.
 *
 * @param card - HTML элемент карточки
 * @param processedAttribute - атрибут для пометки обработки
 */
export function markCardAsProcessed(card: Element, processedAttribute: string): void {
  card.setAttribute(processedAttribute, '');
}

/**
 * Основная функция обработки карточки.
 * Находит элемент захвата, проверяет условия и применяет цвет.
 *
 * @param options - опции обработки карточки
 * @param selectors - селекторы DOM элементов
 * @param hslFromRGB - функция преобразования RGB в HSL
 */
export function processCard(
  options: ProcessCardOptions,
  selectors: { grabber: string },
  flaggedClass: string,
  hslFromRGB: (r: number, g: number, b: number) => number[]
): void {
  const { card, processedAttribute } = options;
  const grabber = card.querySelector(selectors.grabber) as HTMLElement;

  if (!grabber) {
    return;
  }

  const color = grabber.style.backgroundColor;

  // Пропускаем прозрачные или отсутствующие цвета
  if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)' || color === '') {
    return;
  }

  markCardAsProcessed(card, processedAttribute);

  if (isFlagged(card, flaggedClass)) {
    return;
  }

  if (isAlreadyColoredByOtherTools(card)) {
    return;
  }

  paintCard(card, grabber, hslFromRGB);
}
