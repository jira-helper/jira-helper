import React from 'react';
import { Tag } from 'antd';
import { getContrastTextColor } from '../utils/colorUtils';

export interface IssueLinkBadgeProps {
  color: string;
  link: string; // issue key
  summary: string;
}

export const IssueLinkBadge: React.FC<IssueLinkBadgeProps> = ({ color, link, summary }) => {
  const textColor = getContrastTextColor(color);
  const issueUrl = `${window.location.origin}/browse/${link}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(issueUrl, '_blank');
  };

  return (
    <Tag
      color={color}
      style={{
        color: textColor,
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginBottom: '4px',
        maxWidth: '100%',
      }}
      title={`${link}: ${summary}`}
      onClick={handleClick}
      data-testid={`issue-link-badge-${link}`}
    >
      {link}: {summary}
    </Tag>
  );
};
