/**
 * LimitParams - параметры лимита для вычисления ID.
 */
export type LimitParams = {
  person: { name: string };
  columns: Array<{ id: string }>;
  swimlanes: Array<{ id: string }>;
  includedIssueTypes?: string[];
};

/**
 * hashString - вычисляет хеш-сумму строки (алгоритм djb2).
 * Используется для генерации стабильных числовых ID на основе параметров.
 *
 * @param str - входная строка
 * @returns 32-битное беззнаковое целое число
 */
const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // eslint-disable-next-line no-bitwise
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // eslint-disable-next-line no-bitwise
  return hash >>> 0; // Convert to unsigned 32-bit integer
};

/**
 * computeLimitId - вычисляет стабильный ID лимита на основе его параметров.
 * Позволяет сопоставлять лимиты без явного ID (обратная совместимость).
 *
 * Формирует ключ: `${person.name}|${columnIds}|${swimlaneIds}|${issueTypes}`
 * Все списки ID сортируются перед объединением для обеспечения стабильности.
 *
 * @param limit - параметры лимита
 * @returns хеш-сумма параметров
 */
export const computeLimitId = (limit: LimitParams): number => {
  const personName = limit.person.name;
  const columnIds = limit.columns
    .map(c => c.id)
    .sort()
    .join(',');
  const swimlaneIds = limit.swimlanes
    .map(s => s.id)
    .sort()
    .join(',');
  const issueTypes = (limit.includedIssueTypes || []).slice().sort().join(',');

  const key = `${personName}|${columnIds}|${swimlaneIds}|${issueTypes}`;
  return hashString(key);
};
