/**
 * Pure validation + normalization for settings import (draft only; no storage IO).
 *
 * **Watchers policy**: `watchers` may be omitted, `null`, a string (comma-separated logins), or an array of strings.
 * Non-string array entries or other root types yield a row-level {@link TemplateValidationError} on `watchers`.
 *
 * **Required fields**: `label`, `color`, and `text` must be strings with non-empty `.trim()` — not numbers/booleans/objects.
 */

import { Err, Ok } from 'ts-results';
import type { Result } from 'ts-results';
import { COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION } from '../../constants';
import { normalizeTemplates } from '../../Storage/utils/normalizeTemplates';
import type { NormalizableCommentTemplateInput } from '../../Storage/utils/normalizeTemplates';
import type { CommentTemplate, TemplateValidationError } from '../../types';
import { toCommentTemplateId } from '../../types';

function optionalTemplateIdFromRaw(record: Record<string, unknown>): CommentTemplate['id'] | undefined {
  const raw = record.id;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return toCommentTemplateId(raw.trim());
  }
  return undefined;
}

function pushRequiredStringFieldErrors(
  record: Record<string, unknown>,
  index: number,
  field: 'label' | 'color' | 'text',
  errors: TemplateValidationError[]
): void {
  const value = record[field];
  const templateId = optionalTemplateIdFromRaw(record);

  if (typeof value !== 'string') {
    errors.push({
      templateId,
      field,
      message: `Template at index ${index}: ${field} must be a string (non-empty after trim).`,
    });
    return;
  }
  if (value.trim().length === 0) {
    errors.push({
      templateId,
      field,
      message: `Template at index ${index}: ${field} is required (non-empty after trim).`,
    });
  }
}

function validateWatchersField(raw: unknown, index: number): TemplateValidationError[] {
  if (raw === undefined || raw === null) {
    return [];
  }
  if (typeof raw === 'string') {
    return [];
  }
  if (Array.isArray(raw)) {
    for (let j = 0; j < raw.length; j += 1) {
      if (typeof raw[j] !== 'string') {
        return [
          {
            field: 'watchers',
            message: `Template at index ${index}: watchers array entries must be strings.`,
          },
        ];
      }
    }
    return [];
  }
  return [
    {
      field: 'watchers',
      message: `Template at index ${index}: watchers must be a comma-separated string or an array of strings.`,
    },
  ];
}

function validateTemplateRow(
  raw: unknown,
  index: number
): Result<NormalizableCommentTemplateInput, TemplateValidationError[]> {
  const errors: TemplateValidationError[] = [];

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    errors.push({
      field: 'file',
      message: `Template at index ${index} must be an object.`,
    });
    return Err(errors);
  }

  const record = raw as Record<string, unknown>;
  const templateId = optionalTemplateIdFromRaw(record);

  pushRequiredStringFieldErrors(record, index, 'label', errors);
  pushRequiredStringFieldErrors(record, index, 'color', errors);
  pushRequiredStringFieldErrors(record, index, 'text', errors);

  errors.push(
    ...validateWatchersField(record.watchers, index).map(e => (templateId !== undefined ? { ...e, templateId } : e))
  );

  if (errors.length > 0) {
    return Err(errors);
  }

  const row: NormalizableCommentTemplateInput = {
    id: record.id,
    label: record.label,
    color: record.color,
    text: record.text,
  } as NormalizableCommentTemplateInput;

  if (record.watchers !== undefined && record.watchers !== null) {
    row.watchers = record.watchers as NormalizableCommentTemplateInput['watchers'];
  }

  return Ok(row);
}

function extractTemplatesRows(parsed: unknown): Result<unknown[], TemplateValidationError[]> {
  if (parsed === null || parsed === undefined) {
    return Err([
      { field: 'file', message: 'JSON must be an array of templates or an object with version and templates.' },
    ]);
  }

  if (Array.isArray(parsed)) {
    return Ok(parsed);
  }

  if (typeof parsed !== 'object') {
    return Err([{ field: 'file', message: 'JSON root must be an array or an object with version and templates.' }]);
  }

  const root = parsed as Record<string, unknown>;
  if (!('templates' in root)) {
    return Err([
      {
        field: 'file',
        message: 'JSON must be an array of templates or an object with "version" and "templates".',
      },
    ]);
  }

  const { version } = root;
  if (version !== COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION) {
    return Err([
      {
        field: 'file',
        message: `Unsupported payload version: expected ${String(COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION)}, received ${String(version)}.`,
      },
    ]);
  }

  const { templates } = root;
  if (!Array.isArray(templates)) {
    return Err([{ field: 'file', message: 'Field "templates" must be an array.' }]);
  }

  return Ok(templates);
}

/**
 * Parses import JSON (v1 `{ version, templates }` or legacy array), validates schema and required fields,
 * then returns {@link normalizeTemplates normalized} templates. Does not read or write storage.
 */
export function validateImportedTemplates(jsonText: string): Result<CommentTemplate[], TemplateValidationError[]> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText) as unknown;
  } catch {
    return Err([{ field: 'file', message: 'Invalid JSON: could not parse file.' }]);
  }

  const rowsResult = extractTemplatesRows(parsed);
  if (rowsResult.err) {
    return Err(rowsResult.val);
  }

  const rows = rowsResult.val;
  const allErrors: TemplateValidationError[] = [];
  const normalizedInputs: NormalizableCommentTemplateInput[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const rowResult = validateTemplateRow(rows[i], i);
    if (rowResult.err) {
      allErrors.push(...rowResult.val);
    } else {
      normalizedInputs.push(rowResult.val);
    }
  }

  if (allErrors.length > 0) {
    return Err(allErrors);
  }

  return Ok(normalizeTemplates(normalizedInputs));
}
