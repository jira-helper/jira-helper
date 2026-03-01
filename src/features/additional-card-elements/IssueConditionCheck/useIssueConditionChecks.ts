import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { getFieldValueForJqlStandalone } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { getEpicLinkFieldId } from 'src/shared/jira/fields/loadJiraFields';
import { JiraIssueMapped, JiraField } from 'src/shared/jira/types';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';
import { IssueConditionCheck, IssueConditionCheckSubtaskSources } from '../types';
import { ConditionCheckResult, MatchedSubtaskInfo, safeParseJql, DEFAULT_SUBTASK_SOURCES } from './utils';

/**
 * Get direct subtasks - issues listed in parent's subtasks field
 */
function getDirectSubtasks(parentIssue: JiraIssueMapped, subtasks: JiraIssueMapped[]): JiraIssueMapped[] {
  const issueSubtasks = parentIssue?.fields.subtasks || [];
  return subtasks.filter(subtask => issueSubtasks.some(s => s.key === subtask.key));
}

/**
 * Get epic children - issues with Epic Link pointing to this epic
 */
function getEpicChildren(
  parentIssue: JiraIssueMapped,
  subtasks: JiraIssueMapped[],
  epicLinkFieldId: string | null
): JiraIssueMapped[] {
  if (!epicLinkFieldId) return [];
  return subtasks.filter(subtask => subtask.fields[epicLinkFieldId] === parentIssue.key);
}

/**
 * Get linked issues - issues connected via issuelinks
 */
function getLinkedIssues(parentIssue: JiraIssueMapped, subtasks: JiraIssueMapped[]): JiraIssueMapped[] {
  const issueLinks = parentIssue?.fields.issuelinks || [];
  return subtasks.filter(subtask =>
    issueLinks.some(link => link.outwardIssue?.key === subtask.key || link.inwardIssue?.key === subtask.key)
  );
}

/**
 * Create a field value getter for JQL matching from issue data
 */
function createJqlFieldValueGetter(issue: JiraIssueMapped, fields: JiraField[]) {
  return getFieldValueForJqlStandalone(issue, fields);
}

/**
 * Deduplicate issues by key
 */
function deduplicateIssues(issues: JiraIssueMapped[]): JiraIssueMapped[] {
  const seen = new Set<string>();
  return issues.filter(issue => {
    if (seen.has(issue.key)) return false;
    seen.add(issue.key);
    return true;
  });
}

/**
 * Filter subtasks based on configured sources for JiraIssueMapped
 * Uses the same logic as subtask progress feature
 */
function filterSubtasksBySourcesMapped(
  parentIssue: JiraIssueMapped,
  subtasks: JiraIssueMapped[],
  sources: IssueConditionCheckSubtaskSources | undefined,
  epicLinkFieldId: string | null
): JiraIssueMapped[] {
  const config = sources ?? DEFAULT_SUBTASK_SOURCES;

  // If all sources are disabled, return empty
  if (!config.includeDirectSubtasks && !config.includeEpicChildren && !config.includeLinkedIssues) {
    return [];
  }

  const result: JiraIssueMapped[] = [];

  // Get direct subtasks
  if (config.includeDirectSubtasks) {
    const directSubtasks = getDirectSubtasks(parentIssue, subtasks);
    result.push(...directSubtasks);
  }

  // Get epic children
  if (config.includeEpicChildren) {
    const epicChildren = getEpicChildren(parentIssue, subtasks, epicLinkFieldId);
    result.push(...epicChildren);
  }

  // Get linked issues
  if (config.includeLinkedIssues) {
    const linkedIssues = getLinkedIssues(parentIssue, subtasks);
    result.push(...linkedIssues);
  }

  const deduplicated = deduplicateIssues(result);

  return deduplicated;
}

/**
 * Check a single condition against an issue
 */
function checkCondition(
  check: IssueConditionCheck,
  issue: JiraIssueMapped,
  subtasks: JiraIssueMapped[],
  fields: JiraField[],
  epicLinkFieldId: string | null
): ConditionCheckResult {
  if (!check.enabled) {
    return { matched: false, check };
  }

  const getFieldValue = createJqlFieldValueGetter(issue, fields);

  if (check.mode === 'simple') {
    if (!check.jql) {
      return { matched: false, check };
    }

    const matchFn = safeParseJql(check.jql);
    if (!matchFn) {
      return { matched: false, check };
    }

    try {
      return {
        matched: matchFn(getFieldValue),
        check,
      };
    } catch {
      return { matched: false, check };
    }
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

    try {
      // First, check if the issue itself matches
      if (!issueMatchFn(getFieldValue)) {
        return { matched: false, check };
      }

      // Filter subtasks based on configured sources
      const filteredSubtasks = filterSubtasksBySourcesMapped(issue, subtasks, check.subtaskSources, epicLinkFieldId);

      // Then, check subtasks based on match mode
      const matchedSubtasks: MatchedSubtaskInfo[] = [];
      const matchMode = check.subtaskMatchMode || 'any';

      for (const subtask of filteredSubtasks) {
        const subtaskGetFieldValue = createJqlFieldValueGetter(subtask, fields);
        try {
          const matches = subtaskMatchFn(subtaskGetFieldValue);
          if (matches) {
            matchedSubtasks.push({
              key: subtask.key,
              summary: subtask.fields.summary as string | undefined,
            });
          }
        } catch {
          // Skip this subtask on error
        }
      }

      // Determine if condition is matched based on mode
      let matched = false;
      if (matchMode === 'any') {
        // At least one subtask matches
        matched = matchedSubtasks.length > 0;
      } else if (matchMode === 'all') {
        // All subtasks must match (and there must be at least one subtask)
        matched = filteredSubtasks.length > 0 && matchedSubtasks.length === filteredSubtasks.length;
      }

      return {
        matched,
        check,
        matchedSubtasks: matched ? matchedSubtasks : undefined,
      };
    } catch {
      return { matched: false, check };
    }
  }

  return { matched: false, check };
}

/**
 * Hook to get matching condition checks for an issue
 */
export function useIssueConditionChecks(issueKey: string): ConditionCheckResult[] {
  const checks = useAdditionalCardElementsBoardPropertyStore(
    useShallow(state => state.data.issueConditionChecks || [])
  );

  const { fields } = useGetFields();
  const epicLinkFieldId = getEpicLinkFieldId(fields);

  const issue = useJiraIssuesStore(useShallow(state => state.issues.find(i => i.data.key === issueKey)?.data));

  const subtasksData = useJiraSubtasksStore(useShallow(state => state.data[issueKey]));
  const subtasks = subtasksData?.subtasks || [];

  return useMemo(() => {
    // If no checks configured or no issue data, return empty array
    if (checks.length === 0 || !issue) {
      return [];
    }

    // Check all conditions and return only matching ones
    return checks
      .filter(check => check.enabled)
      .map(check => checkCondition(check, issue, subtasks, fields, epicLinkFieldId))
      .filter(result => result.matched);
  }, [checks, issue, subtasks, fields, epicLinkFieldId]);
}

/**
 * Hook to check if any condition checks are enabled
 */
export function useHasEnabledConditionChecks(): boolean {
  return useAdditionalCardElementsBoardPropertyStore(
    useShallow(state => (state.data.issueConditionChecks || []).some(check => check.enabled))
  );
}
