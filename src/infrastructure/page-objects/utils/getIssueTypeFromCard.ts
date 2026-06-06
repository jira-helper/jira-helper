/**
 * Извлекает имя типа задачи из карточки на доске.
 *
 * Тип берётся из атрибута `title` элемента `.ghx-type`, который имеет один из
 * форматов:
 *   - `Bug`
 *   - `Тип запроса: Bug`
 * Часть после `:` (если есть) считается именем типа.
 *
 * Возвращает `null`, если элемент или title отсутствуют.
 */
export function getIssueTypeFromCard(card: Element): string | null {
  const typeElement = card.querySelector('.ghx-type');
  if (!typeElement) return null;
  const title = typeElement.getAttribute('title');
  if (!title) return null;
  const typeName = title.includes(':') ? title.split(':')[1].trim() : title.trim();
  return typeName || null;
}
