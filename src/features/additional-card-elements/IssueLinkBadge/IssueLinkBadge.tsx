/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import { Tag } from 'antd';
import { getContrastTextColor } from '../utils/colorUtils';
import styles from './IssueLinkBadge.module.css';

export interface IssueLinkBadgeProps {
  color: string;
  link: string; // issue key
  summary: string;
  multilineSummary?: boolean;
  clickable?: boolean;
}

export const IssueLinkBadge: React.FC<IssueLinkBadgeProps> = ({
  color,
  link,
  summary,
  multilineSummary = false,
  clickable = true,
}) => {
  const textColor = getContrastTextColor(color);
  const issueUrl = `${window.location.origin}/browse/${link}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
  };

  const tagStyle: React.CSSProperties = {
    color: textColor,
    cursor: clickable ? 'pointer' : 'default',
    marginBottom: '4px',
    maxWidth: '100%',
  };

  if (multilineSummary) {
    // Многострочный режим: перенос слов
    tagStyle.whiteSpace = 'normal';
    tagStyle.wordWrap = 'break-word';
    tagStyle.overflow = 'visible';
  } else {
    // Однострочный режим: обрезка с троеточием
    tagStyle.overflow = 'hidden';
    tagStyle.textOverflow = 'ellipsis';
    tagStyle.whiteSpace = 'nowrap';
  }

  const tag = (
    <Tag
      color={color}
      style={tagStyle}
      title={!clickable && !multilineSummary ? `${link}: ${summary}` : undefined}
      data-testid={`issue-link-badge-${link}`}
    >
      {summary}
    </Tag>
  );

  if (!clickable) {
    return tag;
  }

  return (
    <a
      href={issueUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
      onClick={handleClick}
      title={multilineSummary ? undefined : `${link}: ${summary}`}
    >
      {tag}
    </a>
  );
};
