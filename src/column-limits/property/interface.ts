import type { WipLimitsProperty } from '../types';

/**
 * @module ColumnLimitsPropertyStore
 *
 * Стор для хранения WIP limits property, синхронизированного с Jira.
 *
 * ## Использование
 *
 * ### Загрузка данных
 * ```ts
 * await loadColumnLimitsProperty();
 * const wipLimits = useColumnLimitsPropertyStore.getState().data;
 * ```
 *
 * ### Сохранение данных
 * ```ts
 * const { setData } = useColumnLimitsPropertyStore.getState().actions;
 * setData(newWipLimits);
 * await saveColumnLimitsProperty();
 * ```
 */
export interface ColumnLimitsPropertyStoreState {
  /** Данные property (группы колонок и лимиты) */
  data: WipLimitsProperty;

  /** Состояние загрузки */
  state: 'initial' | 'loading' | 'loaded';

  actions: {
    /** Установить данные (обычно после загрузки) */
    setData: (data: WipLimitsProperty) => void;

    /** Установить состояние загрузки */
    setState: (state: 'initial' | 'loading' | 'loaded') => void;

    /** Сброс к начальному состоянию */
    reset: () => void;
  };
}
