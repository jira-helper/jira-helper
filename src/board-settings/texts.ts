import type { Texts } from 'src/shared/texts';

export const BOARD_SETTINGS_TEXTS = {
  ok: {
    en: 'OK',
    ru: 'OK',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
} as const satisfies Texts;

export type BoardSettingsTextKeys = keyof typeof BOARD_SETTINGS_TEXTS;
