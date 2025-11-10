import React from 'react';
import { Tag } from 'antd';
import { getContrastTextColor } from '../utils/colorUtils';

export interface IssueLinkBadgeProps {
  color: string;
  link: string; // issue key
  summary: string;
  multilineSummary?: boolean;
}

export const IssueLinkBadge: React.FC<IssueLinkBadgeProps> = ({ color, link, summary, multilineSummary = false }) => {
  const textColor = getContrastTextColor(color);
  const issueUrl = `${window.location.origin}/browse/${link}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(issueUrl, '_blank');
  };

  const tagStyle: React.CSSProperties = {
    color: textColor,
    cursor: 'pointer',
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

  return (
    <Tag
      color={color}
      style={tagStyle}
      title={multilineSummary ? undefined : `${link}: ${summary}`}
      onClick={handleClick}
      data-testid={`issue-link-badge-${link}`}
    >
      {summary}
    </Tag>
  );
};
