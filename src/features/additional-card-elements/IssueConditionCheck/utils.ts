import { parseJql, JqlMatchFn } from 'src/shared/jql/simpleJqlParser';
import {
  IssueConditionCheck,
  IssueConditionCheckAnimation,
  IssueConditionCheckIcon,
  IssueConditionCheckSubtaskSources,
} from '../types';

/**
 * Info about a matched subtask for tooltip display
 */
export type MatchedSubtaskInfo = {
  key: string;
  summary?: string;
};

/**
 * Result of condition check for a single issue
 */
export type ConditionCheckResult = {
  matched: boolean;
  check: IssueConditionCheck;
  // For withSubtasks mode: info about matched subtasks
  matchedSubtasks?: MatchedSubtaskInfo[];
};

/**
 * Issue data type for JQL matching
 */
export type IssueData = {
  key: string;
  fields: Record<string, unknown>;
  subtasks?: IssueData[];
};

/**
 * Default subtask sources: include direct subtasks and epic children, but not linked issues
 */
export const DEFAULT_SUBTASK_SOURCES: IssueConditionCheckSubtaskSources = {
  includeDirectSubtasks: true,
  includeEpicChildren: true,
  includeLinkedIssues: false,
};

/**
 * Check if an issue is a direct subtask (issuetype.subtask = true)
 */
function isDirectSubtask(issue: IssueData): boolean {
  const issuetype = issue.fields.issuetype as { subtask?: boolean } | undefined;
  return issuetype?.subtask === true;
}

/**
 * Filter subtasks based on configured sources
 * - Direct subtasks: issuetype.subtask = true
 * - Epic children: issuetype.subtask = false (non-subtask tasks linked to epic)
 * - Linked issues: also non-subtask items connected via Jira issue links
 */
export function filterSubtasksBySources(
  subtasks: IssueData[],
  sources: IssueConditionCheckSubtaskSources | undefined
): IssueData[] {
  const config = sources ?? DEFAULT_SUBTASK_SOURCES;

  // If all sources are disabled, return empty
  if (!config.includeDirectSubtasks && !config.includeEpicChildren && !config.includeLinkedIssues) {
    return [];
  }

  // If all main sources are enabled, return all
  if (config.includeDirectSubtasks && (config.includeEpicChildren || config.includeLinkedIssues)) {
    // Need to check if we're including all non-subtask items
    if (config.includeEpicChildren || config.includeLinkedIssues) {
      return subtasks;
    }
  }

  return subtasks.filter(subtask => {
    const isSubtask = isDirectSubtask(subtask);

    // Direct subtasks
    if (isSubtask && config.includeDirectSubtasks) {
      return true;
    }

    // Epic children and linked issues (non-subtask items)
    // Note: We can't distinguish between epic children and linked issues at this level
    // since both are non-subtask items loaded via JQL
    if (!isSubtask && (config.includeEpicChildren || config.includeLinkedIssues)) {
      return true;
    }

    return false;
  });
}

/**
 * Create a field value getter function from issue fields
 */
export function createFieldValueGetter(fields: Record<string, unknown>): (fieldName: string) => unknown {
  return (fieldName: string) => {
    const normalizedName = fieldName.toLowerCase();
    const key = Object.keys(fields).find(k => k.toLowerCase() === normalizedName);
    return key ? fields[key] : undefined;
  };
}

/**
 * Parse JQL string safely, returning null if parsing fails
 */
export function safeParseJql(jql: string): JqlMatchFn | null {
  try {
    return parseJql(jql);
  } catch {
    return null;
  }
}

/**
 * Check if an issue matches a condition check
 */
export function checkIssueCondition(issue: IssueData, check: IssueConditionCheck): ConditionCheckResult {
  if (!check.enabled) {
    return { matched: false, check };
  }

  const getFieldValue = createFieldValueGetter(issue.fields);

  if (check.mode === 'simple') {
    if (!check.jql) {
      return { matched: false, check };
    }

    const matchFn = safeParseJql(check.jql);
    if (!matchFn) {
      return { matched: false, check };
    }

    return {
      matched: matchFn(getFieldValue),
      check,
    };
  }

  // withSubtasks mode
  if (check.mode === 'withSubtasks') {
    if (!check.issueJql || !check.subtaskJql) {
      return { matched: false, check };
    }

    const issueMatchFn = safeParseJql(check.issueJql);
    const subtaskMatchFn = safeParseJql(check.subtaskJql);

    if (!issueMatchFn || !subtaskMatchFn) {
      return { matched: false, check };
    }

    // First, check if the issue itself matches
    if (!issueMatchFn(getFieldValue)) {
      return { matched: false, check };
    }

    // Filter subtasks based on configured sources
    const allSubtasks = issue.subtasks || [];
    const subtasks = filterSubtasksBySources(allSubtasks, check.subtaskSources);

    // Then, check subtasks based on match mode
    const matchedSubtasks: MatchedSubtaskInfo[] = [];
    const matchMode = check.subtaskMatchMode || 'any';

    for (const subtask of subtasks) {
      const subtaskGetFieldValue = createFieldValueGetter(subtask.fields);
      if (subtaskMatchFn(subtaskGetFieldValue)) {
        matchedSubtasks.push({
          key: subtask.key,
          summary: subtask.fields.summary as string | undefined,
        });
      }
    }

    // Determine if condition is matched based on mode
    let matched = false;
    if (matchMode === 'any') {
      // At least one subtask matches
      matched = matchedSubtasks.length > 0;
    } else if (matchMode === 'all') {
      // All subtasks must match (and there must be at least one subtask)
      matched = subtasks.length > 0 && matchedSubtasks.length === subtasks.length;
    }

    return {
      matched,
      check,
      matchedSubtasks: matched ? matchedSubtasks : undefined,
    };
  }

  return { matched: false, check };
}

/**
 * Check all conditions for an issue
 */
export function checkAllConditions(issue: IssueData, checks: IssueConditionCheck[]): ConditionCheckResult[] {
  return checks.filter(check => check.enabled).map(check => checkIssueCondition(issue, check));
}

/**
 * Get matching conditions (only those that matched)
 */
export function getMatchingConditions(issue: IssueData, checks: IssueConditionCheck[]): ConditionCheckResult[] {
  return checkAllConditions(issue, checks).filter(result => result.matched);
}

/**
 * Icon configuration for display
 */
export const ICON_CONFIG: Record<IssueConditionCheckIcon, { emoji: string; label: string }> = {
  // Base icons
  warning: { emoji: '⚠️', label: 'Warning' },
  info: { emoji: 'ℹ️', label: 'Info' },
  check: { emoji: '✅', label: 'Check' },
  close: { emoji: '❌', label: 'Close' },
  question: { emoji: '❓', label: 'Question' },
  exclamation: { emoji: '❗', label: 'Exclamation' },
  flag: { emoji: '🚩', label: 'Flag' },
  star: { emoji: '⭐', label: 'Star' },
  bug: { emoji: '🐛', label: 'Bug' },
  clock: { emoji: '⏰', label: 'Clock' },
  // Priority & Status
  fire: { emoji: '🔥', label: 'Fire' },
  rocket: { emoji: '🚀', label: 'Rocket' },
  lock: { emoji: '🔒', label: 'Lock' },
  eye: { emoji: '👁️', label: 'Eye' },
  bell: { emoji: '🔔', label: 'Bell' },
  lightning: { emoji: '⚡', label: 'Lightning' },
  stop: { emoji: '🛑', label: 'Stop' },
  link: { emoji: '🔗', label: 'Link' },
  pin: { emoji: '📌', label: 'Pin' },
  heart: { emoji: '❤️', label: 'Heart' },
  thumbsUp: { emoji: '👍', label: 'Thumbs Up' },
  thumbsDown: { emoji: '👎', label: 'Thumbs Down' },
  // Roles
  police: { emoji: '👮', label: 'Police' },
  scientist: { emoji: '🧑‍🔬', label: 'Scientist' },
  doctor: { emoji: '👨‍⚕️', label: 'Doctor' },
  // Vehicles
  car: { emoji: '🚗', label: 'Car' },
  policeCar: { emoji: '🚓', label: 'Police Car' },
  fireTruck: { emoji: '🚒', label: 'Fire Truck' },
  ambulance: { emoji: '🚑', label: 'Ambulance' },
  racingCar: { emoji: '🏎️', label: 'Racing Car' },
  bus: { emoji: '🚌', label: 'Bus' },
};

/**
 * Color presets for the color picker
 */
export const COLOR_PRESETS = [
  {
    label: 'Recommended',
    colors: ['#ffebee', '#fff8e1', '#e3f2fd', '#e8f5e9', '#fff3e0', '#f5f5f5'],
  },
  {
    label: 'Bright',
    colors: ['#ff4d4f', '#faad14', '#1890ff', '#52c41a', '#fa8c16', '#722ed1'],
  },
];

/**
 * Animation configuration for display
 */
export const ANIMATION_CONFIG: Record<IssueConditionCheckAnimation, { label: string; cssClass: string }> = {
  none: { label: 'None', cssClass: '' },
  pulse: { label: 'Pulse', cssClass: 'animationPulse' },
  breathe: { label: 'Breathe', cssClass: 'animationBreathe' },
  blink: { label: 'Blink', cssClass: 'animationBlink' },
  blinkFast: { label: 'Blink Fast', cssClass: 'animationBlinkFast' },
  shake: { label: 'Shake', cssClass: 'animationShake' },
};

/**
 * Get icon emoji for a check
 */
export function getIconEmoji(icon: IssueConditionCheckIcon): string {
  return ICON_CONFIG[icon]?.emoji || '❓';
}

/**
 * Get animation CSS class for a check
 */
export function getAnimationClass(animation: IssueConditionCheckAnimation | undefined): string {
  if (!animation || animation === 'none') {
    return '';
  }
  return ANIMATION_CONFIG[animation]?.cssClass || '';
}

/**
 * Generate unique ID for a new check
 */
export function generateCheckId(): string {
  return `check_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a default check configuration
 */
export function createDefaultCheck(overrides?: Partial<IssueConditionCheck>): IssueConditionCheck {
  return {
    id: generateCheckId(),
    name: '',
    enabled: true,
    mode: 'simple',
    icon: 'warning',
    color: undefined, // No background by default
    tooltipText: '',
    animation: 'none',
    jql: '',
    ...overrides,
  };
}

/**
 * Validate JQL syntax
 */
export function validateJql(jql: string): { valid: boolean; error?: string } {
  if (!jql.trim()) {
    return { valid: false, error: 'JQL is empty' };
  }

  try {
    parseJql(jql);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'Invalid JQL' };
  }
}

/**
 * Validate check configuration
 */
export function validateCheck(check: IssueConditionCheck): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!check.name.trim()) {
    errors.push('Name is required');
  }

  if (!check.tooltipText.trim()) {
    errors.push('Tooltip text is required');
  }

  if (check.mode === 'simple') {
    const jqlValidation = validateJql(check.jql || '');
    if (!jqlValidation.valid) {
      errors.push(`Issue JQL: ${jqlValidation.error}`);
    }
  } else if (check.mode === 'withSubtasks') {
    const issueJqlValidation = validateJql(check.issueJql || '');
    if (!issueJqlValidation.valid) {
      errors.push(`Issue JQL: ${issueJqlValidation.error}`);
    }

    const subtaskJqlValidation = validateJql(check.subtaskJql || '');
    if (!subtaskJqlValidation.valid) {
      errors.push(`Subtask JQL: ${subtaskJqlValidation.error}`);
    }
  }

  return { valid: errors.length === 0, errors };
}
