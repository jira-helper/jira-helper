/**
 * Built-in templates when storage is empty or after user reset (no CNT branding).
 */

import type { CommentTemplate } from '../../types';
import { toCommentTemplateId } from '../../types';

/** Neutral light blue — distinct from secondary default. */
const DEFAULT_COLOR_IN_PROGRESS = '#deebff';

/** Neutral light green — generic UI accent. */
const DEFAULT_COLOR_CLARIFICATION = '#e3fcef';

/**
 * Two generic defaults from product requirements (labels/text); stable ids for tests and migrations.
 */
export const DEFAULT_COMMENT_TEMPLATES: readonly CommentTemplate[] = [
  {
    id: toCommentTemplateId('default-in-progress'),
    label: 'Взял в работу',
    color: DEFAULT_COLOR_IN_PROGRESS,
    text: 'Здравствуйте! Задача взята в работу. Вернусь с обновлением, когда появится результат.',
  },
  {
    id: toCommentTemplateId('default-need-clarification'),
    label: 'Нужно уточнение',
    color: DEFAULT_COLOR_CLARIFICATION,
    text: 'Здравствуйте! Нужно уточнить:',
  },
];
