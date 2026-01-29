import type { PersonLimit, PersonWipLimitsProperty } from './types';

/**
 * @module PersonWipLimitsPropertyStore
 *
 * Стор для хранения PersonWipLimits property, синхронизированного с Jira.
 *
 * ## Использование
 *
 * ### Загрузка данных
 * ```ts
 * await loadPersonWipLimitsProperty();
 * const limits = usePersonWipLimitsPropertyStore.getState().data.limits;
 * ```
 *
 * ### Сохранение данных
 * ```ts
 * const { setLimits } = usePersonWipLimitsPropertyStore.getState().actions;
 * setLimits(newLimits);
 * await savePersonWipLimitsProperty();
 * ```
 *
 * ## Интеграция с UI модулем
 * UI модуль использует этот стор через get/set:
 * - При открытии модалки: копирует данные из property store в UI store
 * - При сохранении: копирует данные из UI store в property store и сохраняет
 */
export interface PersonWipLimitsPropertyStoreState {
  /** Данные property */
  data: PersonWipLimitsProperty;

  /** Состояние загрузки */
  state: 'initial' | 'loading' | 'loaded';

  actions: {
    /** Установить данные (обычно после загрузки) */
    setData: (data: PersonWipLimitsProperty) => void;

    /** Установить состояние загрузки */
    setState: (state: 'initial' | 'loading' | 'loaded') => void;

    /** Установить лимиты (для сохранения) */
    setLimits: (limits: PersonLimit[]) => void;

    /** Сброс к начальному состоянию */
    reset: () => void;
  };
}
