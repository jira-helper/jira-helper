/**
 * Utility to extract issue types from DOM cards on the board
 * Used as fallback when API is unavailable
 */
export function getIssueTypesFromDOM(): string[] {
  const typeElements = document.querySelectorAll('.ghx-type[title]');
  const issueTypes = new Set<string>();

  typeElements.forEach(element => {
    const title = element.getAttribute('title');
    if (title) {
      // Extract type name from title attribute
      // Title format can be: "Idea", "Тип запроса: Idea", etc.
      const typeName = title.includes(':') ? title.split(':')[1].trim() : title.trim();
      if (typeName) {
        issueTypes.add(typeName);
      }
    }
  });

  return Array.from(issueTypes).sort();
}
