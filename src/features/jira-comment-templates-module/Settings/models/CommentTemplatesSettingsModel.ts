/**
 * @module CommentTemplatesSettingsModel
 *
 * Draft lifecycle for comment templates in Settings: CRUD on draft rows, import/export JSON,
 * reset-to-defaults (draft only), persist via {@link ITemplatesStorageModel}.
 */

import { Err, Ok, type Result } from 'ts-results';
import { COMMENT_TEMPLATE_HEX_COLOR_FALLBACK } from '../../constants';
import type {
  CommentTemplate,
  CommentTemplateId,
  EditableCommentTemplate,
  EditableCommentTemplatePatch,
  ICommentTemplatesSettingsModel,
  ITemplatesStorageModel,
  TemplateValidationError,
} from '../../types';
import { toCommentTemplateId } from '../../types';
import { DEFAULT_COMMENT_TEMPLATES } from '../../Storage/utils/defaultTemplates';
import { serializeTemplates } from '../utils/serializeTemplates';
import { validateImportedTemplates } from '../utils/validateImportedTemplates';
import {
  canonicalCommentTemplateHexColor,
  resolveCommentTemplateHexColor,
} from '../../utils/resolveCommentTemplateHexColor';

/** Deep-clone persisted templates into editable draft rows (no `isNew`). */
export function cloneTemplatesToEditable(templates: CommentTemplate[]): EditableCommentTemplate[] {
  return templates.map(t => ({
    id: t.id,
    label: t.label,
    color: canonicalCommentTemplateHexColor(resolveCommentTemplateHexColor(t.color)),
    text: t.text,
    ...(t.watchers !== undefined && t.watchers.length > 0 ? { watchers: [...t.watchers] } : {}),
  }));
}

/**
 * Validates draft rows before save/export (non-empty draft; trimmed non-empty label/color/text; watchers shape).
 */
export function validateDraftTemplates(drafts: EditableCommentTemplate[]): TemplateValidationError[] {
  const errors: TemplateValidationError[] = [];

  if (drafts.length === 0) {
    errors.push({
      field: 'file',
      message: 'At least one comment template is required.',
    });
    return errors;
  }

  drafts.forEach((row, index) => {
    const templateId = row.id;
    const templateLabel = `Template ${index + 1}`;

    const push = (field: TemplateValidationError['field'], message: string): void => {
      errors.push({ templateId, field, message });
    };

    if (typeof row.label !== 'string' || row.label.trim().length === 0) {
      push('label', `${templateLabel}: label is required.`);
    }
    if (typeof row.color !== 'string' || row.color.trim().length === 0) {
      push('color', `${templateLabel}: color is required.`);
    }
    if (typeof row.text !== 'string' || row.text.trim().length === 0) {
      push('text', `${templateLabel}: text is required.`);
    }

    if (row.watchers !== undefined) {
      if (!Array.isArray(row.watchers)) {
        push('watchers', `${templateLabel}: watchers must be a list of Jira usernames.`);
      } else {
        for (let i = 0; i < row.watchers.length; i += 1) {
          if (typeof row.watchers[i] !== 'string') {
            push('watchers', `${templateLabel}: watchers must be Jira usernames.`);
            break;
          }
        }
      }
    }
  });

  return errors;
}

function summarizeValidationErrors(errors: TemplateValidationError[]): string {
  return errors[0]?.message ?? 'Validation failed.';
}

function mintDraftTemplateId(existingIds: ReadonlySet<string>): CommentTemplateId {
  let n = 0;
  for (;;) {
    const candidate = `__jh-draft-${n}`;
    if (!existingIds.has(candidate)) {
      return toCommentTemplateId(candidate);
    }
    n += 1;
  }
}

/** Normalizes `watchers` from patch at runtime (array of strings or comma-separated string). */
function normalizeWatchersFromPatch(raw: unknown): string[] | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (Array.isArray(raw)) {
    const pieces = raw.map(entry => (typeof entry === 'string' ? entry.trim() : '')).filter(Boolean);
    return pieces.length > 0 ? pieces : [];
  }
  if (typeof raw === 'string') {
    const pieces = raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return pieces.length > 0 ? pieces : [];
  }
  return undefined;
}

function watchersDomainEqual(a: string[] | undefined, b: string[] | undefined): boolean {
  const emptyA = a === undefined || a.length === 0;
  const emptyB = b === undefined || b.length === 0;
  if (emptyA && emptyB) {
    return true;
  }
  if (emptyA || emptyB) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
}

/** Compare persisted-relevant draft fields (`isNew` ignored). */
function editableDomainEqual(a: EditableCommentTemplate, b: EditableCommentTemplate): boolean {
  return (
    a.label === b.label &&
    canonicalCommentTemplateHexColor(a.color) === canonicalCommentTemplateHexColor(b.color) &&
    a.text === b.text &&
    watchersDomainEqual(a.watchers, b.watchers)
  );
}

/** Merge runtime patch into a draft row — same semantics as legacy `updateTemplate` merge. */
function mergeEditablePatchIntoRow(
  row: EditableCommentTemplate,
  patch: EditableCommentTemplatePatch
): EditableCommentTemplate {
  const next: EditableCommentTemplate = {
    ...row,
    ...(patch.label !== undefined ? { label: patch.label } : {}),
    ...(patch.color !== undefined ? { color: canonicalCommentTemplateHexColor(patch.color) } : {}),
    ...(patch.text !== undefined ? { text: patch.text } : {}),
  };
  if (patch.watchers !== undefined) {
    const normalized = normalizeWatchersFromPatch(patch.watchers as unknown);
    if (normalized === undefined) {
      return next;
    }
    if (normalized.length === 0) {
      const cleared: EditableCommentTemplate = { ...next };
      delete cleared.watchers;
      return cleared;
    }
    next.watchers = normalized;
  }
  return next;
}

function toPersistedTemplate(row: EditableCommentTemplate): CommentTemplate {
  const base: CommentTemplate = {
    id: row.id,
    label: row.label,
    color: row.color,
    text: row.text,
  };
  if (row.watchers !== undefined && row.watchers.length > 0) {
    base.watchers = [...row.watchers];
  }
  return base;
}

export class CommentTemplatesSettingsModel implements ICommentTemplatesSettingsModel {
  draftTemplates: EditableCommentTemplate[] = [];

  validationErrors: TemplateValidationError[] = [];

  importError: string | null = null;

  saveError: string | null = null;

  isSaving = false;

  isDirty = false;

  /**
   * Bumped on user-driven draft mutations; reset on {@link initDraft}, {@link discardDraft}, {@link reset}.
   * Used to ignore stale async save completion. Not `#private`: Valtio `proxy()` cannot write true private fields.
   */
  private draftRevision = 0;

  constructor(private readonly storageModel: ITemplatesStorageModel) {}

  private bumpDraftRevision(): void {
    this.draftRevision += 1;
  }

  initDraft(): void {
    this.draftTemplates = cloneTemplatesToEditable(this.storageModel.templates);
    this.validationErrors = [];
    this.importError = null;
    this.saveError = null;
    this.isDirty = false;
    this.isSaving = false;
    this.draftRevision = 0;
  }

  addTemplate(): void {
    this.saveError = null;
    const ids = new Set(this.draftTemplates.map(t => String(t.id)));
    const id = mintDraftTemplateId(ids);
    const row: EditableCommentTemplate = {
      id,
      label: 'Новый шаблон',
      color: canonicalCommentTemplateHexColor(COMMENT_TEMPLATE_HEX_COLOR_FALLBACK),
      text: 'Замените текст шаблона перед сохранением.',
      isNew: true,
    };
    this.draftTemplates = [...this.draftTemplates, row];
    this.bumpDraftRevision();
    this.isDirty = true;
  }

  updateTemplate(templateId: CommentTemplateId, patch: EditableCommentTemplatePatch): void {
    this.saveError = null;
    let changed = false;
    const nextDrafts = this.draftTemplates.map(row => {
      if (row.id !== templateId) {
        return row;
      }
      const merged = mergeEditablePatchIntoRow(row, patch);
      if (!editableDomainEqual(row, merged)) {
        changed = true;
        return merged;
      }
      return row;
    });
    if (!changed) {
      return;
    }
    this.draftTemplates = nextDrafts;
    this.bumpDraftRevision();
    this.isDirty = true;
  }

  deleteTemplate(templateId: CommentTemplateId): void {
    this.saveError = null;
    this.draftTemplates = this.draftTemplates.filter(t => t.id !== templateId);
    this.bumpDraftRevision();
    this.isDirty = true;
  }

  importFromJsonText(jsonText: string): Result<void, Error> {
    const parsed = validateImportedTemplates(jsonText);
    if (parsed.err) {
      this.validationErrors = parsed.val;
      this.importError = summarizeValidationErrors(parsed.val);
      return Err(new Error(this.importError));
    }
    this.draftTemplates = cloneTemplatesToEditable(parsed.val);
    this.validationErrors = [];
    this.importError = null;
    this.saveError = null;
    this.bumpDraftRevision();
    this.isDirty = true;
    return Ok(undefined);
  }

  buildExportJson(): Result<string, Error> {
    const errors = validateDraftTemplates(this.draftTemplates);
    if (errors.length > 0) {
      this.validationErrors = errors;
      return Err(new Error(summarizeValidationErrors(errors)));
    }
    this.validationErrors = [];
    const persisted = this.draftTemplates.map(toPersistedTemplate);
    return Ok(serializeTemplates(persisted));
  }

  resetDraftToDefaults(): void {
    this.draftTemplates = cloneTemplatesToEditable([...DEFAULT_COMMENT_TEMPLATES]);
    this.importError = null;
    this.saveError = null;
    this.validationErrors = [];
    this.bumpDraftRevision();
    this.isDirty = true;
  }

  async saveDraft(): Promise<Result<void, Error>> {
    this.saveError = null;
    const errors = validateDraftTemplates(this.draftTemplates);
    if (errors.length > 0) {
      this.validationErrors = errors;
      return Err(new Error(summarizeValidationErrors(errors)));
    }

    this.validationErrors = [];
    this.importError = null;
    this.isSaving = true;

    const persisted = this.draftTemplates.map(toPersistedTemplate);
    const revisionAtSaveStart = this.draftRevision;
    const result = await this.storageModel.saveTemplates(persisted);

    if (result.err) {
      this.saveError = result.val.message;
      this.isSaving = false;
      return Err(result.val);
    }

    if (this.draftRevision !== revisionAtSaveStart) {
      this.isSaving = false;
      return Ok(undefined);
    }

    this.draftTemplates = cloneTemplatesToEditable(this.storageModel.templates);
    this.isDirty = false;
    this.saveError = null;
    this.isSaving = false;
    return Ok(undefined);
  }

  discardDraft(): void {
    this.draftTemplates = cloneTemplatesToEditable(this.storageModel.templates);
    this.validationErrors = [];
    this.importError = null;
    this.saveError = null;
    this.isDirty = false;
    this.isSaving = false;
    this.draftRevision = 0;
  }

  reset(): void {
    this.draftTemplates = [];
    this.validationErrors = [];
    this.importError = null;
    this.saveError = null;
    this.isSaving = false;
    this.isDirty = false;
    this.draftRevision = 0;
  }
}
