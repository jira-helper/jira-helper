import type { Texts } from 'src/shared/texts';

export const WIPLIMIT_CELLS_TEXTS = {
  modalTitle: {
    en: 'Edit WipLimit on cells',
    ru: 'Редактирование WIP-лимитов на ячейки',
  },
  addRange: {
    en: 'Add range',
    ru: 'Добавить диапазон',
  },
  namePlaceholder: {
    en: 'name',
    ru: 'название',
  },
  addCell: {
    en: 'Add cell',
    ru: 'Добавить ячейку',
  },
  swimlane: {
    en: 'Swimlane',
    ru: 'Свимлейн',
  },
  column: {
    en: 'Column',
    ru: 'Колонка',
  },
  showIndicator: {
    en: 'show indicator',
    ru: 'показывать индикатор',
  },
  selectSwimlane: {
    en: 'Select swimlane',
    ru: 'Выберите свимлейн',
  },
  selectColumn: {
    en: 'Select Column',
    ru: 'Выберите колонку',
  },
  enterRangeName: {
    en: 'Enter range name',
    ru: 'Введите название диапазона',
  },
  rangeName: {
    en: 'Range name',
    ru: 'Название диапазона',
  },
  wipLimit: {
    en: 'WIP limit',
    ru: 'WIP-лимит',
  },
  disable: {
    en: 'Disable',
    ru: 'Отключить',
  },
  cellsHeader: {
    en: 'Cells (swimlane/column)',
    ru: 'Ячейки (свимлейн/колонка)',
  },
  save: {
    en: 'Save',
    ru: 'Сохранить',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
  editColumn: {
    en: 'Edit',
    ru: 'Редактировать',
  },
} as const satisfies Texts;

export type WiplimitCellsTextKeys = keyof typeof WIPLIMIT_CELLS_TEXTS;
