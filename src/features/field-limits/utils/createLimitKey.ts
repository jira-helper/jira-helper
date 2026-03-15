/**
 * Генерирует уникальный ключ лимита.
 * Формат: `${timestamp}@@${fieldId}@@${fieldValue}`
 */
export function createLimitKey(params: { fieldValue: string; fieldId: string }): string {
  return `${new Date().toISOString()}@@${params.fieldId}@@${params.fieldValue}`;
}
