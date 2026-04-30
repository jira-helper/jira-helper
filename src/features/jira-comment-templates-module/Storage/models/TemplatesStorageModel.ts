import { Err, Ok, Result } from 'ts-results';
import type { ILocalStorageService } from 'src/infrastructure/storage/LocalStorageService';
import { COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION } from '../../constants';
import type {
  CommentTemplate,
  CommentTemplateId,
  CommentTemplateSummary,
  ITemplatesStorageModel,
  TemplatesStorageState,
} from '../../types';
import { DEFAULT_COMMENT_TEMPLATES } from '../utils/defaultTemplates';
import { normalizeTemplates, type NormalizableCommentTemplateInput } from '../utils/normalizeTemplates';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function cloneDefaultTemplates(): CommentTemplate[] {
  return normalizeTemplates([...DEFAULT_COMMENT_TEMPLATES] as NormalizableCommentTemplateInput[]);
}

function parseStoredPayload(raw: string): Result<CommentTemplate[], Error> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return Err(toError(e));
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return Err(new Error('Invalid templates payload: expected object'));
  }

  const record = parsed as Record<string, unknown>;
  const { version } = record;

  if (version !== COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION) {
    return Err(new Error(`Unsupported templates storage version: ${String(version)}`));
  }

  const templatesRaw = record.templates;
  if (!Array.isArray(templatesRaw)) {
    return Err(new Error('Invalid templates payload: templates must be an array'));
  }

  for (const row of templatesRaw) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      return Err(new Error('Invalid templates payload: each template must be a non-null object'));
    }
  }

  return Ok(normalizeTemplates(templatesRaw as NormalizableCommentTemplateInput[]));
}

/**
 * @module TemplatesStorageModel
 *
 * Persists comment templates under {@link COMMENT_TEMPLATES_LOCAL_STORAGE_KEY} as JSON
 * `{ version: 1, templates }`. Uses {@link ILocalStorageService} only — no direct `localStorage`.
 *
 * Wrap with `proxy()` from Valtio when registering in DI. Commands mutate `this`; consumers read via snapshot.
 */
export class TemplatesStorageModel implements ITemplatesStorageModel {
  templates: CommentTemplate[] = [];

  loadState: TemplatesStorageState['loadState'] = 'initial';

  error: string | null = null;

  constructor(private readonly storage: ILocalStorageService) {}

  get templateSummaries(): CommentTemplateSummary[] {
    return this.templates.map(t => ({
      id: t.id,
      label: t.label,
      color: t.color,
    }));
  }

  get hasTemplates(): boolean {
    return this.templates.length > 0;
  }

  async load(): Promise<Result<void, Error>> {
    this.loadState = 'loading';
    this.error = null;

    const got = this.storage.getItem(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY);
    if (got.err) {
      const err = got.val;
      this.templates = cloneDefaultTemplates();
      this.loadState = 'error';
      this.error = err.message;
      return Err(err);
    }

    const raw = got.val;
    if (raw === null || raw === '') {
      this.templates = cloneDefaultTemplates();
      this.loadState = 'loaded';
      this.error = null;
      return Ok(undefined);
    }

    const parsed = parseStoredPayload(raw);
    if (parsed.err) {
      const err = parsed.val;
      this.templates = cloneDefaultTemplates();
      this.loadState = 'error';
      this.error = err.message;
      return Err(err);
    }

    this.templates = parsed.val;
    this.loadState = 'loaded';
    this.error = null;
    return Ok(undefined);
  }

  async saveTemplates(templates: CommentTemplate[]): Promise<Result<void, Error>> {
    const normalized = normalizeTemplates(templates as NormalizableCommentTemplateInput[]);
    const payload = JSON.stringify({
      version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
      templates: normalized,
    } satisfies { version: typeof COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION; templates: CommentTemplate[] });

    const set = this.storage.setItem(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, payload);
    if (set.err) {
      const err = set.val;
      this.error = err.message;
      return Err(err);
    }

    this.templates = normalized;
    this.error = null;
    this.loadState = 'loaded';
    return Ok(undefined);
  }

  async resetToDefaults(): Promise<Result<void, Error>> {
    const defaults = cloneDefaultTemplates();
    const payload = JSON.stringify({
      version: COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION,
      templates: defaults,
    } satisfies { version: typeof COMMENT_TEMPLATES_STORAGE_PAYLOAD_VERSION; templates: CommentTemplate[] });

    const set = this.storage.setItem(COMMENT_TEMPLATES_LOCAL_STORAGE_KEY, payload);
    if (set.err) {
      const err = set.val;
      this.error = err.message;
      return Err(err);
    }

    this.templates = defaults;
    this.error = null;
    this.loadState = 'loaded';
    return Ok(undefined);
  }

  getTemplate(templateId: CommentTemplateId): CommentTemplate | null {
    return this.templates.find(t => t.id === templateId) ?? null;
  }

  reset(): void {
    this.templates = [];
    this.loadState = 'initial';
    this.error = null;
  }
}
