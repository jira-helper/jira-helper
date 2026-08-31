// src/cloud/features/assignee-highlighter/tokens.ts
// Токены для DI - Assignee Highlighter

import { Token } from 'dioma';

export const assigneeHighlighterFeatureSettingsToken = new Token<
  import('./AssigneeHighlighterFeatureSettings').AssigneeHighlighterFeatureSettings
>('AssigneeHighlighterFeatureSettings');
