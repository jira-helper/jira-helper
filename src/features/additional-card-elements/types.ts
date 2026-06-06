export type IssueLinkTypeSelection = {
  id: string;
  direction: 'inward' | 'outward';
};

export type IssueSelector = {
  mode: 'field' | 'jql';
  fieldId?: string;
  value?: string;
  jql?: string;
};

export type IssueLink = {
  name: string; // Human-readable name
  linkType: IssueLinkTypeSelection;
  trackAllTasks?: boolean; // If true, analyze links for all tasks, otherwise use issueSelector
  issueSelector?: IssueSelector; // Filter for tasks to analyze links for
  trackAllLinkedTasks?: boolean; // If true, show all linked tasks, otherwise use linkedIssueSelector
  linkedIssueSelector?: IssueSelector; // Filter for linked tasks to display
  color?: string;
  multilineSummary?: boolean;
};

export type ColumnThresholds = {
  warningThreshold?: number;
  dangerThreshold?: number;
};

export type PerColumnThresholds = Record<string, ColumnThresholds>;

export type DaysInColumnSettings = {
  enabled: boolean;
  warningThreshold?: number;
  dangerThreshold?: number;
  usePerColumnThresholds?: boolean;
  perColumnThresholds?: PerColumnThresholds;
};

export type DaysToDeadlineDisplayMode = 'always' | 'lessThanOrOverdue' | 'overdueOnly';

export type DaysToDeadlineSettings = {
  enabled: boolean;
  fieldId?: string;
  displayMode?: DaysToDeadlineDisplayMode; // По умолчанию 'always'
  displayThreshold?: number; // Для режима 'lessThanOrOverdue'
  warningThreshold?: number;
};

export type AdditionalCardElementsBoardProperty = {
  enabled?: boolean;
  columnsToTrack?: string[];
  showInBacklog?: boolean;
  clickableEpicLinks?: boolean;
  clickableIssueLinks?: boolean;
  issueLinks?: IssueLink[];
  daysInColumn?: DaysInColumnSettings;
  daysToDeadline?: DaysToDeadlineSettings;
  issueConditionChecks?: IssueConditionCheck[];
};

/**
 * Issue Condition Check - проверка задач на соответствие условиям
 *
 * Режим 1 (simple): Если задача попадает под JQL - показываем иконку с тултипом
 * Режим 2 (withSubtasks): Если задача попадает под issueJql И имеет подзадачи под subtaskJql - показываем иконку
 */
export type IssueConditionCheckMode = 'simple' | 'withSubtasks';

/**
 * Режим проверки подзадач:
 * - 'any': условие соблюдено если ХОТЯ БЫ ОДНА подзадача подходит (по умолчанию)
 * - 'all': условие соблюдено только если ВСЕ подзадачи подходят
 */
export type IssueConditionCheckSubtaskMatchMode = 'any' | 'all';

/**
 * Источники подзадач для проверки:
 * - includeDirectSubtasks: прямые подзадачи (issuetype.subtask = true)
 * - includeEpicChildren: задачи эпика (не subtask, связаны через Epic Link)
 * - includeLinkedIssues: связанные задачи через issue links (Jira links, не external)
 */
export type IssueConditionCheckSubtaskSources = {
  includeDirectSubtasks?: boolean; // По умолчанию true
  includeEpicChildren?: boolean; // По умолчанию true
  includeLinkedIssues?: boolean; // По умолчанию false
};

export type IssueConditionCheck = {
  id: string;
  name: string;
  enabled: boolean;
  mode: IssueConditionCheckMode;
  icon: IssueConditionCheckIcon;
  color?: string; // Background color in hex format (e.g., '#ff0000'), undefined = no background
  tooltipText: string;
  animation?: IssueConditionCheckAnimation; // Анимация для привлечения внимания (по умолчанию 'none')

  // Режим simple: JQL для проверки задачи
  jql?: string;

  // Режим withSubtasks: JQL для задачи и подзадач
  issueJql?: string;
  subtaskJql?: string;
  subtaskMatchMode?: IssueConditionCheckSubtaskMatchMode; // По умолчанию 'any'
  subtaskSources?: IssueConditionCheckSubtaskSources; // По умолчанию { includeDirectSubtasks: true, includeEpicChildren: true }
};

export type IssueConditionCheckIcon =
  | 'warning'
  | 'info'
  | 'check'
  | 'close'
  | 'question'
  | 'exclamation'
  | 'flag'
  | 'star'
  | 'bug'
  | 'clock'
  // Priority & Status
  | 'fire'
  | 'rocket'
  | 'lock'
  | 'eye'
  | 'bell'
  | 'lightning'
  | 'stop'
  | 'link'
  | 'pin'
  | 'heart'
  | 'thumbsUp'
  | 'thumbsDown'
  // Roles
  | 'police'
  | 'scientist'
  | 'doctor'
  // Vehicles
  | 'car'
  | 'policeCar'
  | 'fireTruck'
  | 'ambulance'
  | 'racingCar'
  | 'bus';

export type IssueConditionCheckAnimation = 'none' | 'pulse' | 'breathe' | 'blink' | 'blinkFast' | 'shake';
