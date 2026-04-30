/**
 * @module jira-comment-templates-module/types
 *
 * Domain shapes for persisted templates (Storage), drafts (Settings) and insertion + watchers (Editor).
 * Does not declare models/implementations. `CommentEditorId` / kinds / insert result are **type-only**
 * aliases of `src/infrastructure/page-objects/CommentsEditor`; minting `CommentEditorId` stays in PageObject impl.
 */

import type { Result } from 'ts-results';

import type {
  CommentEditorId,
  CommentEditorInsertResult,
  CommentEditorKind,
} from '../../infrastructure/page-objects/CommentsEditor';

export type { CommentEditorId, CommentEditorInsertResult, CommentEditorKind };

// ---------------------------------------------------------------------------
// Identity handles (opaque at call sites — not selectors or Jira issue keys)
// ---------------------------------------------------------------------------

/**
 * Stable identifier for a stored comment template.
 *
 * Generated or reassigned by the feature when import data has missing or duplicate ids.
 * Serialized as a string in JSON; treat as opaque outside normalization utilities.
 *
 * Nominal string — use {@link toCommentTemplateId} at parse/import boundaries so template ids are not
 * accidentally mixed with editor ids or arbitrary strings.
 */
export type CommentTemplateId = string & { readonly __commentTemplateId: never };

/**
 * Coerces a validated template id string from storage/JSON into a {@link CommentTemplateId}.
 */
export function toCommentTemplateId(value: string): CommentTemplateId {
  return value as CommentTemplateId;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * Stored template used by toolbar insertion and JSON export/import.
 *
 * Compatible with legacy extension JSON: `{ id, label, color, text, watchers? }[]`.
 */
export type CommentTemplate = {
  id: CommentTemplateId;
  label: string;
  color: string;
  text: string;
  /** Jira login names (trimmed by model); empty entries ignored at aggregation time. */
  watchers?: string[];
};

/**
 * Editable template row in Settings — same shape as persisted template plus UI-only flags.
 */
export type EditableCommentTemplate = CommentTemplate & {
  /** True when the row was created in-session and not yet saved to storage. */
  isNew?: boolean;
};

export type EditableCommentTemplatePatch = Partial<Pick<CommentTemplate, 'label' | 'color' | 'text' | 'watchers'>>;

/** View-ready subset for template buttons in the toolbar. */
export type CommentTemplateSummary = Pick<CommentTemplate, 'id' | 'label' | 'color'>;

/** Preset colors offered in settings row (palette contract for View). */
export type TemplateColor = {
  id: string;
  label: string;
  background: string;
  border: string;
  text: string;
};

// ---------------------------------------------------------------------------
// Storage payload
// ---------------------------------------------------------------------------

export type CommentTemplatesStoragePayloadV1 = {
  version: 1;
  templates: CommentTemplate[];
};

/** Untyped legacy import shape before validation/normalization. */
export type LegacyCommentTemplatesPayload = Array<{
  id: unknown;
  label: unknown;
  color: unknown;
  text: unknown;
  watchers?: unknown;
}>;

// ---------------------------------------------------------------------------
// Settings validation & import
// ---------------------------------------------------------------------------

export type TemplateValidationError = {
  templateId?: CommentTemplateId;
  field?: 'label' | 'color' | 'text' | 'watchers' | 'file';
  message: string;
};

// ---------------------------------------------------------------------------
// Toolbar notification (watcher feedback)
// ---------------------------------------------------------------------------

export type CommentTemplatesNotificationLevel = 'success' | 'warning' | 'error';

/**
 * Transient notification shown after template insert + optional watcher calls.
 *
 * `id` is owned by UI for dismiss / auto-hide bookkeeping; not a template id.
 */
export type CommentTemplatesNotificationState = {
  id: string;
  level: CommentTemplatesNotificationLevel;
  message: string;
  details?: string[];
};

// ---------------------------------------------------------------------------
// Editor command: insert template
// ---------------------------------------------------------------------------

export type InsertTemplateRequest = {
  commentEditorId: CommentEditorId;
  templateId: CommentTemplateId;
};

/**
 * Outcome of `insertTemplate` after text insertion and optional watcher aggregation.
 *
 * `inserted` reflects comment field mutation; `watchersResult` may be partial per login.
 */
export type InsertTemplateResult = {
  templateId: CommentTemplateId;
  inserted: boolean;
  watchersResult?: AddWatchersResult;
};

export type AddWatcherItemResult = {
  username: string;
  status: 'added' | 'failed';
  errorMessage?: string;
};

/**
 * Aggregated REST outcomes for one issue after independent per-login `addWatcher` calls.
 *
 * - `skipped` — no watchers on template (`reason: 'empty-watchers'` when known) or unresolved issue context
 *   (`issueKey: null`, `reason: 'missing-issue-key'`). In the missing-key branch the model MUST NOT send
 *   Jira watcher requests while text insertion may still succeed.
 * - `success` / `partial` / `failed` — see Editor model aggregation rules in target design.
 */
export type AddWatchersResult = {
  issueKey: string | null;
  status: 'success' | 'partial' | 'failed' | 'skipped';
  reason?: 'empty-watchers' | 'missing-issue-key';
  items: AddWatcherItemResult[];
};

// ---------------------------------------------------------------------------
// Model snapshots & contracts (Valtio state + public methods — no Impl here)
// ---------------------------------------------------------------------------

export type TemplatesStorageState = {
  templates: CommentTemplate[];
  loadState: 'initial' | 'loading' | 'loaded' | 'error';
  error: string | null;
};

export interface ITemplatesStorageModel {
  templates: CommentTemplate[];
  loadState: TemplatesStorageState['loadState'];
  error: string | null;
  readonly templateSummaries: CommentTemplateSummary[];
  readonly hasTemplates: boolean;
  load(): Promise<Result<void, Error>>;
  saveTemplates(templates: CommentTemplate[]): Promise<Result<void, Error>>;
  resetToDefaults(): Promise<Result<void, Error>>;
  getTemplate(templateId: CommentTemplateId): CommentTemplate | null;
  reset(): void;
}

export type EditorModelState = {
  pendingTemplateIds: Record<CommentTemplateId, boolean>;
};

export interface ICommentTemplatesEditorModel {
  pendingTemplateIds: Record<CommentTemplateId, boolean>;
  insertTemplate(request: InsertTemplateRequest): Promise<Result<InsertTemplateResult, Error>>;
  reset(): void;
}

export type CommentTemplatesSettingsState = {
  draftTemplates: EditableCommentTemplate[];
  validationErrors: TemplateValidationError[];
  importError: string | null;
  /** Last persisted-storage failure message from {@link ICommentTemplatesSettingsModel.saveDraft}. */
  saveError: string | null;
  isSaving: boolean;
  isDirty: boolean;
};

export interface ICommentTemplatesSettingsModel {
  draftTemplates: EditableCommentTemplate[];
  validationErrors: TemplateValidationError[];
  importError: string | null;
  saveError: string | null;
  isSaving: boolean;
  isDirty: boolean;
  initDraft(): void;
  addTemplate(): void;
  updateTemplate(templateId: CommentTemplateId, patch: EditableCommentTemplatePatch): void;
  deleteTemplate(templateId: CommentTemplateId): void;
  importFromJsonText(jsonText: string): Result<void, Error>;
  buildExportJson(): Result<string, Error>;
  resetDraftToDefaults(): void;
  saveDraft(): Promise<Result<void, Error>>;
  discardDraft(): void;
  reset(): void;
}
