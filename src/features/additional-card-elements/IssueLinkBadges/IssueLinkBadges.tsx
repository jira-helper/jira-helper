import React, { useMemo } from 'react';

import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';
import { useShallow } from 'zustand/react/shallow';
import { JiraIssueMapped, JiraField } from 'src/shared/jira/types';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { getFieldValueForJqlStandalone } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { useGetSettings } from '../hooks/useGetSettings';
import { IssueLinkBadge } from '../IssueLinkBadge/IssueLinkBadge';
import { getLinkColor } from '../utils/colorUtils';
import { IssueSelector } from '../types';

export interface IssueLinkBadgesProps {
  issueKey: string;
}

interface LinkDisplay {
  color: string;
  link: string;
  summary: string;
  multilineSummary: boolean;
}

/**
 * Checks if an issue matches the given selector
 * @param issue - The issue to check (can be full issue or linked issue with fields)
 * @param selector - The selector to match against
 * @param fields - Available Jira fields
 * @param subtasks - Subtasks data (for JQL matching)
 * @returns true if the issue matches the selector, false otherwise
 */
function matchesSelector(
  issue: { key: string; fields?: any },
  selector: IssueSelector,
  fields: JiraField[],
  subtasks: JiraIssueMapped[]
): boolean {
  if (selector.mode === 'jql' && selector.jql) {
    try {
      const matcher = parseJql(selector.jql);
      const issueData: Record<string, any> = {
        key: issue.key,
        summary: issue.fields?.summary || '',
        status: issue.fields?.status?.name || '',
        issuetype: issue.fields?.issuetype?.name || '',
        project: issue.key.split('-')[0], // Extract project from issue key
        priority: issue.fields?.priority?.name || '',
        assignee: issue.fields?.assignee?.displayName || '',
        reporter: issue.fields?.reporter?.displayName || '',
      };

      // Add custom fields from fields array
      if (fields && issue.fields) {
        for (const field of fields) {
          const fieldValue = (issue.fields as any)[field.id];
          if (fieldValue !== undefined) {
            // Handle different field types
            if (typeof fieldValue === 'object' && fieldValue !== null) {
              // For complex fields (like user, status, etc.), try to get name or value
              issueData[field.name] = fieldValue.name || fieldValue.value || fieldValue;
            } else {
              issueData[field.name] = fieldValue;
            }
          }
        }
      }

      // Try to find subtask data for JQL matching
      const subtaskData = subtasks.find(s => s.key === issue.key);
      if (!subtaskData) {
        // If no subtask data, create a minimal issue object for matching
        const minimalIssue: JiraIssueMapped = {
          key: issue.key,
          fields: issue.fields || {},
        } as JiraIssueMapped;
        return matcher(getFieldValueForJqlStandalone(minimalIssue, fields));
      }

      return matcher(getFieldValueForJqlStandalone(subtaskData, fields));
    } catch (error) {
      // If JQL parsing fails, return false
      // eslint-disable-next-line no-console
      console.warn('Failed to parse JQL:', selector.jql, error);
      return false;
    }
  } else if (selector.mode === 'field' && selector.fieldId && selector.value) {
    // Apply field filter
    const fieldValue = (issue.fields as any)?.[selector.fieldId];
    let fieldValueToCompare: string;

    // Handle different field types
    if (typeof fieldValue === 'object' && fieldValue !== null) {
      // For complex fields, try to get name or value
      fieldValueToCompare = fieldValue.name || fieldValue.value || String(fieldValue);
    } else {
      fieldValueToCompare = String(fieldValue || '');
    }

    return fieldValueToCompare === selector.value;
  }

  return true; // If selector is not properly configured, consider it a match
}

export const IssueLinkBadges: React.FC<IssueLinkBadgesProps> = ({ issueKey }) => {
  const { settings } = useGetSettings();
  const { fields } = useGetFields();
  const issue = useJiraIssuesStore(
    useShallow(state => {
      return state.issues.find(i => i.data.key === issueKey);
    })
  );

  const subtasks = useJiraSubtasksStore(useShallow(state => state.data[issueKey]))?.subtasks || [];

  const linksToDisplay = useMemo<LinkDisplay[]>(() => {
    // Check if feature is enabled
    if (!settings.enabled) {
      return [];
    }

    // Check if there are configured issue links
    if (!settings.issueLinks || settings.issueLinks.length === 0) {
      return [];
    }

    // Check if issue data is available
    if (!issue?.data) {
      return [];
    }

    const issueLinks = (issue.data.fields.issuelinks as JiraIssueMapped['fields']['issuelinks'][]) || [];
    const result: LinkDisplay[] = [];

    // Process each configured issue link
    for (const configLink of settings.issueLinks) {
      // Step 1: Check if we should analyze links for the current task
      let shouldAnalyzeForCurrentTask = true; // Default: analyze for all tasks (backward compatibility)

      if (configLink.trackAllTasks === true) {
        // Explicitly set to track all tasks
        shouldAnalyzeForCurrentTask = true;
      } else if (configLink.trackAllTasks === false || configLink.issueSelector) {
        // Either explicitly set to false or issueSelector is configured
        // Check if current task matches the selector
        if (configLink.issueSelector) {
          shouldAnalyzeForCurrentTask = matchesSelector(issue.data, configLink.issueSelector, fields, subtasks);
        } else {
          // trackAllTasks is false but no selector - don't analyze
          shouldAnalyzeForCurrentTask = false;
        }
      }

      if (!shouldAnalyzeForCurrentTask) {
        continue; // Skip this IssueLink for the current card
      }

      // Step 2: Get all linked issues by type and direction
      const matchingLinks = issueLinks.filter(link => {
        if (link.type.id !== configLink.linkType.id) {
          return false;
        }

        if (configLink.linkType.direction === 'inward' && !link.inwardIssue) {
          return false;
        }

        if (configLink.linkType.direction === 'outward' && !link.outwardIssue) {
          return false;
        }

        return true;
      });

      // Step 3: Filter linked issues based on linkedIssueSelector
      for (const matchingLink of matchingLinks) {
        const linkedIssue =
          configLink.linkType.direction === 'inward' ? matchingLink.inwardIssue : matchingLink.outwardIssue;

        if (!linkedIssue) {
          continue;
        }

        // Step 3: Check if we should display this linked issue
        let shouldDisplayLinkedIssue = true; // Default: show all linked issues (backward compatibility)

        if (configLink.trackAllLinkedTasks === true) {
          // Explicitly set to track all linked tasks
          shouldDisplayLinkedIssue = true;
        } else if (configLink.trackAllLinkedTasks === false || configLink.linkedIssueSelector) {
          // Either explicitly set to false or linkedIssueSelector is configured
          // Check if linked issue matches the selector
          if (configLink.linkedIssueSelector) {
            shouldDisplayLinkedIssue = matchesSelector(linkedIssue, configLink.linkedIssueSelector, fields, subtasks);
          } else {
            // trackAllLinkedTasks is false but no selector - don't display
            shouldDisplayLinkedIssue = false;
          }
        }

        if (!shouldDisplayLinkedIssue) {
          continue; // Skip this linked issue
        }

        // Step 4: Calculate color and add to result
        const summary = linkedIssue.fields?.summary || '';
        const color = getLinkColor(configLink.color, linkedIssue.key, summary);

        result.push({
          color,
          link: linkedIssue.key,
          summary,
          multilineSummary: configLink.multilineSummary || false,
        });
      }
    }

    return result;
  }, [settings, issue, fields, issueKey, subtasks]);

  // Don't render anything if no links to display
  if (linksToDisplay.length === 0) {
    return null;
  }

  return (
    <span
      style={{
        marginTop: '8px',
        maxWidth: '100%',
        display: 'flex',
        gap: '4px',
        flexDirection: 'column',
      }}
      data-testid={`issue-link-badges-${issueKey}`}
    >
      {linksToDisplay.map(link => (
        <IssueLinkBadge
          key={link.link}
          color={link.color}
          link={link.link}
          summary={link.summary}
          multilineSummary={link.multilineSummary}
        />
      ))}
    </span>
  );
};
