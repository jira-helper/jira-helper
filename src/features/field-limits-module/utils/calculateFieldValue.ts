import { CalcType } from '../types';

/**
 * Считает карточки с заполненным полем — возвращает 1, если хотя бы один текст непустой.
 */
export function countByHasField(texts: string[]): number {
  return texts.some(text => text.length > 0) ? 1 : 0;
}

/**
 * Считает карточки — возвращает 1, если хотя бы один текст содержит fieldValue.
 */
export function countByCard(texts: string[], fieldValue: string): number {
  for (const text of texts) {
    const parts = text.split(',');
    if (parts.some(part => part.trim() === fieldValue)) {
      return 1;
    }
  }
  return 0;
}

/**
 * Суммирует числовые значения из текстов.
 */
export function countBySumNumbers(texts: string[]): number {
  let result = 0;
  for (const text of texts) {
    const val = Number.parseFloat(text);
    result += Number.isNaN(val) ? 0 : val;
  }
  return result;
}

/**
 * Проверяет наличие хотя бы одного из значений, разделённых запятой.
 * fieldValue: "Bug, Task"
 */
export function countByMultipleValues(texts: string[], fieldValue: string): number {
  const values = fieldValue
    .split(/\s*,\s*/)
    .map(v => v.trim())
    .filter(Boolean);
  for (const text of texts) {
    const parts = text.split(',');
    if (parts.some(part => values.includes(part.trim()))) {
      return 1;
    }
  }
  return 0;
}

/**
 * Диспетчер — вызывает нужную функцию по calcType.
 */
export function calculateFieldValue(texts: string[], fieldValue: string, calcType: CalcType): number {
  switch (calcType) {
    case CalcType.HAS_FIELD:
      return countByHasField(texts);
    case CalcType.EXACT_VALUE:
      return countByCard(texts, fieldValue);
    case CalcType.MULTIPLE_VALUES:
      return countByMultipleValues(texts, fieldValue);
    case CalcType.SUM_NUMBERS:
      return countBySumNumbers(texts);
    default:
      return countByCard(texts, fieldValue);
  }
}
