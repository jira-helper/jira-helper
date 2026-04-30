/**
 * Pure normalization for persisted/imported template rows before schema validation (TASK-80).
 */

import type { CommentTemplate, CommentTemplateId } from '../../types';
import { toCommentTemplateId } from '../../types';
import { canonicalCommentTemplateHexColor } from '../../utils/resolveCommentTemplateHexColor';

/** Row shape acceptable at storage/import boundaries before strict validation. */
export type NormalizableCommentTemplateInput = Partial<CommentTemplate> & Record<string, unknown>;

function coerceTrimmedString(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function coerceIdCandidate(raw: unknown): string | null {
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t.length > 0 ? t : null;
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return String(raw);
  }
  return null;
}

function normalizeWatchersList(raw: unknown): string[] | undefined {
  if (raw === undefined || raw === null) {
    return undefined;
  }

  let pieces: string[];
  if (Array.isArray(raw)) {
    pieces = raw.map(entry => coerceTrimmedString(entry)).filter(Boolean);
  } else if (typeof raw === 'string') {
    pieces = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  } else {
    return undefined;
  }

  return pieces.length > 0 ? pieces : undefined;
}

/**
 * Returns a new array of {@link CommentTemplate} with trimmed fields, cleaned watchers,
 * and guaranteed unique ids (missing or duplicate ids receive deterministic minted ids).
 * Minted `__jh-ct-*` values never collide with any non-empty explicit id appearing anywhere
 * in {@link input}, so later rows keep persisted mint-shaped ids.
 */
export function normalizeTemplates(input: NormalizableCommentTemplateInput[]): CommentTemplate[] {
  const explicitIdsFromInput = new Set<string>();
  for (const item of input) {
    const explicit = coerceIdCandidate(item.id);
    if (explicit !== null) {
      explicitIdsFromInput.add(explicit);
    }
  }

  const used = new Set<string>();
  let mintSeq = 0;

  function mintId(): CommentTemplateId {
    let candidate: string;
    do {
      candidate = `__jh-ct-${mintSeq}`;
      mintSeq += 1;
    } while (used.has(candidate) || explicitIdsFromInput.has(candidate));
    used.add(candidate);
    return toCommentTemplateId(candidate);
  }

  function allocateId(raw: unknown): CommentTemplateId {
    const candidate = coerceIdCandidate(raw);
    if (candidate !== null && !used.has(candidate)) {
      used.add(candidate);
      return toCommentTemplateId(candidate);
    }
    return mintId();
  }

  return input.map(item => {
    const id = allocateId(item.id);
    const label = coerceTrimmedString(item.label);
    const text = coerceTrimmedString(item.text);
    const color = canonicalCommentTemplateHexColor(coerceTrimmedString(item.color));
    const watchers = normalizeWatchersList(item.watchers);

    const row: CommentTemplate = {
      id,
      label,
      color,
      text,
    };

    if (watchers !== undefined) {
      row.watchers = watchers;
    }

    return row;
  });
}
