import React, { useMemo } from 'react';
import { Space } from 'antd';
import { useJiraIssuesStore } from 'src/shared/jira/jiraIssues/jiraIssuesStore';
import { useShallow } from 'zustand/react/shallow';
import { JiraIssueMapped } from 'src/shared/jira/types';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { getFieldValueForJqlStandalone } from 'src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress';
import { useGetSettings } from '../hooks/useGetSettings';
import { IssueLinkBadge } from '../IssueLinkBadge/IssueLinkBadge';
import { getLinkColor } from '../utils/colorUtils';

export interface IssueLinkBadgesProps {
  issueKey: string;
}

interface LinkDisplay {
  color: string;
  link: string;
  summary: string;
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
      // Filter issue links by type and direction
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

      // Process each matching link
      for (const matchingLink of matchingLinks) {
        const linkedIssue =
          configLink.linkType.direction === 'inward' ? matchingLink.inwardIssue : matchingLink.outwardIssue;

        if (!linkedIssue) {
          continue;
        }

        // Apply issue selector filter
        if (configLink.issueSelector) {
          const selector = configLink.issueSelector;

          if (selector.mode === 'jql' && selector.jql) {
            // Parse and apply JQL filter
            try {
              const matcher = parseJql(selector.jql);
              const issueData: Record<string, any> = {
                key: linkedIssue.key,
                summary: linkedIssue.fields?.summary || '',
                status: linkedIssue.fields?.status?.name || '',
                issuetype: linkedIssue.fields?.issuetype?.name || '',
                project: linkedIssue.key.split('-')[0], // Extract project from issue key
                priority: linkedIssue.fields?.priority?.name || '',
                assignee: linkedIssue.fields?.assignee?.displayName || '',
                reporter: linkedIssue.fields?.reporter?.displayName || '',
                // Add more standard fields as needed
              };

              // Add custom fields from fields array
              if (fields && linkedIssue.fields) {
                for (const field of fields) {
                  const fieldValue = (linkedIssue.fields as any)[field.id];
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

              const subtaskData = subtasks.find(s => s.key === linkedIssue.key);
              if (!subtaskData) {
                continue; // Skip this link if subtask data not found
              }
              if (!matcher(getFieldValueForJqlStandalone(subtaskData, fields))) {
                continue; // Skip this link if it doesn't match JQL
              }
            } catch (error) {
              // If JQL parsing fails, skip this link
              // eslint-disable-next-line no-console
              console.warn('Failed to parse JQL:', selector.jql, error);
              continue;
            }
          } else if (selector.mode === 'field' && selector.fieldId && selector.value) {
            // Apply field filter
            const fieldValue = (linkedIssue.fields as any)?.[selector.fieldId];
            let fieldValueToCompare: string;

            // Handle different field types
            if (typeof fieldValue === 'object' && fieldValue !== null) {
              // For complex fields, try to get name or value
              fieldValueToCompare = fieldValue.name || fieldValue.value || String(fieldValue);
            } else {
              fieldValueToCompare = String(fieldValue || '');
            }

            if (fieldValueToCompare !== selector.value) {
              continue; // Skip if field value doesn't match
            }
          }
        }

        // Calculate color
        const summary = linkedIssue.fields?.summary || '';
        const color = getLinkColor(configLink.color, linkedIssue.key, summary);

        result.push({
          color,
          link: linkedIssue.key,
          summary,
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
    <Space size={[4, 4]} wrap style={{ marginTop: '8px' }} data-testid={`issue-link-badges-${issueKey}`}>
      {linksToDisplay.map(link => (
        <IssueLinkBadge key={link.link} color={link.color} link={link.link} summary={link.summary} />
      ))}
    </Space>
  );
};
