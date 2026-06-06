/**
 * Определяет цвет badge в зависимости от количества issues и WIP лимита.
 *
 * @param issueCount - текущее количество issues
 * @param wipLimit - установленный WIP лимит
 * @returns hex-цвет для badge:
 *   - `#1b855c` (зелёный) если issueCount < wipLimit
 *   - `#ffd700` (жёлтый) если issueCount === wipLimit
 *   - `#ff5630` (красный) если issueCount > wipLimit
 *
 * @example
 * getBadgeColor(3, 5); // "#1b855c" - зелёный
 * getBadgeColor(5, 5); // "#ffd700" - жёлтый
 * getBadgeColor(7, 5); // "#ff5630" - красный
 */
export function getBadgeColor(issueCount: number, wipLimit: number): string {
  if (issueCount < wipLimit) {
    return '#1b855c';
  }
  if (issueCount === wipLimit) {
    return '#ffd700';
  }
  return '#ff5630';
}

/**
 * Генерирует HTML для badge с количеством issues и WIP лимитом.
 *
 * @param issueCount - текущее количество issues
 * @param wipLimit - установленный WIP лимит
 * @param color - цвет фона badge (hex)
 * @returns HTML-строка для badge
 *
 * @example
 * getBadgeHtml(3, 5, '#1b855c');
 * // '<div class="WipLimitCellsBadge field-issues-count " style = "background-color: #1b855c">3/5</div>'
 */
export function getBadgeHtml(issueCount: number, wipLimit: number, color: string): string {
  return `<div class="WipLimitCellsBadge field-issues-count " style = "background-color: ${color}">${issueCount}/${wipLimit}</div>`;
}
