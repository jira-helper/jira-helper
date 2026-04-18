import type { WipLimitRange } from '../types';

/**
 * WipLimitCellsPropertyStoreState - состояние Property Store для WIP limits on cells.
 * Хранит данные, синхронизированные с Jira Board Property.
 *
 * @module WipLimitCellsPropertyStore
 *
 * ## Использование
 *
 * ### Загрузка данных
 * ```ts
 * await loadWipLimitCellsProperty();
 * const ranges = useWipLimitCellsPropertyStore.getState().data;
 * ```
 *
 * ### Сохранение данных
 * ```ts
 * const { setData } = useWipLimitCellsPropertyStore.getState().actions;
 * setData(newRanges);
 * await saveWipLimitCellsProperty();
 * ```
 *
 * ## Интеграция с UI модулем
 * UI модуль использует этот стор через get/set:
 * - При открытии модалки: копирует данные из property store в UI store
 * - При сохранении: копирует данные из UI store в property store и сохраняет
 */
export interface WipLimitCellsPropertyStoreState {
  /** Данные property - массив диапазонов WIP лимитов */
  data: WipLimitRange[];

  /** Состояние загрузки */
  state: 'initial' | 'loading' | 'loaded' | 'error';

  actions: {
    /** Установить данные (обычно после загрузки) */
    setData: (data: WipLimitRange[]) => void;

    /** Установить состояние загрузки */
    setState: (state: WipLimitCellsPropertyStoreState['state']) => void;

    /** Сброс к начальному состоянию */
    reset: () => void;
  };
}
