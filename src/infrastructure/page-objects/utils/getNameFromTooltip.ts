/**
 * Parses assignee name from tooltip string.
 * Format: "Assignee: Pavel [x]" -> "Pavel"
 * Handles names with brackets like "Иван [В]" correctly.
 * Only removes trailing " [x]" suffix (inactive user marker), preserves other brackets.
 */
export const getNameFromTooltip = (tooltip: string): string => {
  const parts = tooltip.split(':');
  const name = parts.length < 2 ? tooltip : parts.slice(1).join(':');
  return name.replace(/ \[x\]$/, '').trim();
};
