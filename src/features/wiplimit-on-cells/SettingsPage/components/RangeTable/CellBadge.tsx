/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import { Tag, Button, Tooltip } from 'antd';
import { InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';

export interface CellBadgeProps {
  /** Label для badge (например, "Frontend / In Progress") */
  label: string;
  /** Показывать ли иконку info */
  showBadge: boolean;
  /** Callback при удалении ячейки */
  onDelete: () => void;
}

/**
 * CellBadge - View компонент для отображения badge ячейки.
 * Показывает label, иконку info (если showBadge=true) и кнопку удаления.
 * Длинные названия обрезаются с ellipsis и показываются в Tooltip.
 */
export const CellBadge: React.FC<CellBadgeProps> = ({ label, showBadge, onDelete }) => {
  return (
    <Tag
      data-testid={`cell ${label}`}
      style={{
        margin: '2px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        maxWidth: '200px',
        overflow: 'hidden',
      }}
      closable
      onClose={onDelete}
      closeIcon={
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          aria-label="Delete"
          style={{ padding: 0, height: 'auto', width: 'auto', minWidth: 'auto' }}
        />
      }
    >
      <Tooltip title={label}>
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
          }}
        >
          {label}
        </span>
      </Tooltip>
      {showBadge && <InfoCircleOutlined style={{ fontSize: '12px', flexShrink: 0 }} />}
    </Tag>
  );
};
