import { IssueLink } from '../types';

/**
 * Связанная задача для отображения
 */
export interface LinkedIssue {
  /** Ключ задачи (например, "PROJ-123") */
  key: string;
  /** Заголовок задачи */
  summary: string;
  /** Статус задачи */
  status?: string;
  /** URL задачи в Jira */
  url?: string;
  /** Тип задачи */
  issueType?: string;
  /** Приоритет задачи */
  priority?: string;
}

/**
 * Группа связанных задач по типу связи
 */
export interface IssueLinkGroup {
  /** Конфигурация связи из настроек */
  linkConfig: IssueLink;
  /** Связанные задачи */
  linkedIssues: LinkedIssue[];
  /** Цвет для отображения */
  color: string;
  /** Количество связанных задач */
  count: number;
}

/**
 * Состояние загрузки связей
 */
export type LinkLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Результат загрузки связей
 */
export interface LinkLoadResult {
  /** Состояние загрузки */
  state: LinkLoadingState;
  /** Группы связей */
  groups: IssueLinkGroup[];
  /** Ошибка загрузки */
  error?: string;
}

/**
 * Пропсы для компонента отображения связей
 */
export interface IssueLinkDisplayProps {
  /** Ключ текущей задачи */
  issueKey: string;
  /** Заголовок текущей задачи */
  issueSummary: string;
  /** Конфигурации связей из настроек */
  linkConfigs: IssueLink[];
  /** Максимальное количество отображаемых задач на группу */
  maxDisplayPerGroup?: number;
  /** Показывать ли детальную информацию при клике */
  showTooltip?: boolean;
}

/**
 * Пропсы для бейджа связи
 */
export interface IssueLinkBadgeProps {
  /** Группа связей */
  group: IssueLinkGroup;
  /** Максимальное количество отображаемых задач */
  maxDisplay: number;
  /** Обработчик клика */
  onClick?: () => void;
  /** Показывать ли количество */
  showCount?: boolean;
}

/**
 * Пропсы для тултипа с детальной информацией
 */
export interface IssueLinkTooltipProps {
  /** Группа связей */
  group: IssueLinkGroup;
  /** Видимость тултипа */
  visible: boolean;
  /** Позиция тултипа */
  position?: { x: number; y: number };
  /** Обработчик закрытия */
  onClose: () => void;
}

/**
 * Кэш для связанных задач
 */
export interface LinkCache {
  /** Ключ задачи */
  issueKey: string;
  /** Результат загрузки */
  result: LinkLoadResult;
  /** Время последнего обновления */
  timestamp: number;
  /** TTL кэша в миллисекундах */
  ttl: number;
}

/**
 * Сервис для работы с кэшем связей
 */
export interface LinkCacheService {
  /** Получить данные из кэша */
  get(issueKey: string): LinkLoadResult | null;
  /** Сохранить данные в кэш */
  set(issueKey: string, result: LinkLoadResult): void;
  /** Очистить кэш */
  clear(): void;
  /** Проверить валидность кэша */
  isValid(issueKey: string): boolean;
}
