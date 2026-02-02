import React from 'react';
import { Tooltip } from 'antd';
import { IssueConditionCheckAnimation, IssueConditionCheckIcon } from '../types';
import { getIconEmoji, getAnimationClass, ConditionCheckResult, MatchedSubtaskInfo } from './utils';
import styles from './IssueConditionCheckBadge.module.css';

/**
 * Build tooltip content with subtask links
 */
function buildTooltipContent(
  tooltipText: string,
  matchedSubtasks?: MatchedSubtaskInfo[],
  baseUrl?: string
): React.ReactNode {
  if (!matchedSubtasks || matchedSubtasks.length === 0) {
    return tooltipText;
  }

  // Get base URL from current location
  const jiraBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>{tooltipText}</div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '8px' }}>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>Subtasks ({matchedSubtasks.length}):</div>
        {matchedSubtasks.map(subtask => (
          <div key={subtask.key} style={{ marginBottom: '2px' }}>
            <a
              href={`${jiraBaseUrl}/browse/${subtask.key}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#69b1ff', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >
              {subtask.key}
              {subtask.summary && `: ${subtask.summary}`}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface IssueConditionCheckBadgeProps {
  result: ConditionCheckResult;
  baseUrl?: string;
}

/**
 * Single badge for one condition check result
 */
export const IssueConditionCheckBadge: React.FC<IssueConditionCheckBadgeProps> = ({ result, baseUrl }) => {
  const { check, matchedSubtasks } = result;
  const icon = getIconEmoji(check.icon);
  const animationClass = getAnimationClass(check.animation);
  const hasColor = !!check.color;

  const tooltipContent = buildTooltipContent(check.tooltipText, matchedSubtasks, baseUrl);

  const badgeClasses = [
    styles.badge,
    hasColor ? styles.badgeWithColor : '',
    animationClass ? styles[animationClass] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badgeStyle: React.CSSProperties = hasColor ? { backgroundColor: check.color } : {};

  return (
    <Tooltip title={tooltipContent}>
      <span className={badgeClasses} style={badgeStyle} data-testid={`condition-check-badge-${check.id}`}>
        {icon}
      </span>
    </Tooltip>
  );
};

export interface IssueConditionCheckBadgesProps {
  results: ConditionCheckResult[];
}

/**
 * Container for multiple condition check badges
 */
export const IssueConditionCheckBadges: React.FC<IssueConditionCheckBadgesProps> = ({ results }) => {
  const matchedResults = results.filter(r => r.matched);

  if (matchedResults.length === 0) {
    return null;
  }

  return (
    <div className={styles.badgesContainer}>
      {matchedResults.map(result => (
        <IssueConditionCheckBadge key={result.check.id} result={result} />
      ))}
    </div>
  );
};

/**
 * Preview component for storybook and settings - shows how a badge would look with given settings
 */
export interface IssueConditionCheckBadgePreviewProps {
  icon: IssueConditionCheckIcon;
  color?: string; // Hex color or undefined for no background
  tooltipText: string;
  name?: string;
  animation?: IssueConditionCheckAnimation;
}

export const IssueConditionCheckBadgePreview: React.FC<IssueConditionCheckBadgePreviewProps> = ({
  icon,
  color,
  tooltipText,
  name,
  animation,
}) => {
  const iconEmoji = getIconEmoji(icon);
  const animationClass = getAnimationClass(animation);
  const hasColor = !!color;
  const badgeClasses = [
    styles.badge,
    hasColor ? styles.badgeWithColor : '',
    animationClass ? styles[animationClass] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badgeStyle: React.CSSProperties = hasColor ? { backgroundColor: color } : {};

  return (
    <Tooltip title={tooltipText}>
      <span className={badgeClasses} style={badgeStyle}>
        {iconEmoji}
        {name && <span className={styles.badgeName}>{name}</span>}
      </span>
    </Tooltip>
  );
};
