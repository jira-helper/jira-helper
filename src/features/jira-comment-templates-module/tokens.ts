import { Token } from 'dioma';
import { createModelToken } from 'src/infrastructure/di/Module';
import type { PageModification } from 'src/infrastructure/page-modification/PageModification';
import type { TemplatesStorageModel } from './Storage/models/TemplatesStorageModel';
import type { ICommentTemplatesEditorModel, ICommentTemplatesSettingsModel } from './types';

/**
 * Valtio-backed model for persisted comment templates (JSON under feature storage key via `localStorageServiceToken`).
 *
 * Lifecycle: application scope — one lazy singleton per DI container after first resolve.
 * Consumers: future CommentTemplatesSettingsModel / CommentTemplatesEditorModel; React containers use `entry.useModel` and `entry.model`.
 */
export const templatesStorageModelToken = createModelToken<TemplatesStorageModel>(
  'jira-comment-templates/templatesStorageModel'
);

/**
 * Settings-tab model: draft lifecycle, import/export, validation, save via storage model.
 *
 * Lifecycle: application-scope singleton per container after first resolve.
 * Consumers: CommentTemplatesSettingsContainer, board/issue settings tabs opened from PageModification.
 */
export const commentTemplatesSettingsModelToken = createModelToken<ICommentTemplatesSettingsModel>(
  'jira-comment-templates/settingsModel'
);

/**
 * Future toolbar model: template insertion orchestration and watcher side effects for a live comment editor.
 *
 * Lifecycle: planned application-scope singleton per container; **not registered** until editor model task.
 * Consumers: CommentTemplatesToolbarContainer (planned); delegates DOM to shared CommentsEditorPageObject.
 */
export const commentTemplatesEditorModelToken = createModelToken<ICommentTemplatesEditorModel>(
  'jira-comment-templates/editorModel'
);

/**
 * DI handle for the feature's BOARD/ISSUE PageModification (settings registration + `attachTools` wiring).
 *
 * The concrete `CommentTemplatesPageModification` class is registered in TASK-90; this token is already typed to the
 * shared `PageModification` contract so bootstrap code cannot register an incompatible value without a type error.
 *
 * Lifecycle: value registration from `content.ts` when the feature joins the global PageModification registry — not wired in TASK-76.
 * Consumers: content bootstrap / PageModification lifecycle only.
 */
// Intentional `PageModification<any, any>` — same as registry/`ModificationsMap` until TASK-90 introduces a concrete subclass.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const jiraCommentTemplatesPageModificationToken = new Token<PageModification<any, any>>(
  'jira-comment-templates/pageModification'
);
