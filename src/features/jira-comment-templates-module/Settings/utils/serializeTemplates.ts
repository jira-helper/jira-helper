/**
 * Serializes templates to the v1 storage/settings export JSON shape (pretty-printed).
 */

import { COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION } from '../../constants';
import type { CommentTemplate } from '../../types';

/** Canonical export row — only persisted fields; watchers omitted when absent or empty. */
function toExportRow(template: CommentTemplate): Record<string, unknown> {
  const row: Record<string, unknown> = {
    id: String(template.id),
    label: template.label,
    color: template.color,
    text: template.text,
  };
  if (template.watchers !== undefined && template.watchers.length > 0) {
    row.watchers = template.watchers;
  }
  return row;
}

/**
 * Builds canonical JSON text `{ version, templates }` for download/export.
 * Each template is `{ id, label, color, text }` plus optional non-empty `watchers`; UI-only or unknown
 * enumerable fields on the input objects are not copied.
 * Uses 2-space indentation for readability in Settings UI / file preview.
 */
export function serializeTemplates(templates: CommentTemplate[]): string {
  const payload = {
    version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
    templates: templates.map(toExportRow),
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}
