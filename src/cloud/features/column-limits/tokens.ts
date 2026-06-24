// src/cloud/features/column-limits/tokens.ts
// Токены для DI - Column Limits

import { Token } from 'dioma';

export const columnLimitsFeatureSettingsToken = new Token<
  import('./ColumnLimitsFeatureSettings').ColumnLimitsFeatureSettings
>('ColumnLimitsFeatureSettings');
