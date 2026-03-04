import React from 'react';
import { Tag, Button } from 'antd';
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
 */
export const CellBadge: React.FC<CellBadgeProps> = ({ label, showBadge, onDelete }) => {
  return (
    <Tag
      data-testid={`cell ${label}`}
      style={{ margin: '2px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
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
      {label}
      {showBadge && <InfoCircleOutlined style={{ fontSize: '12px' }} />}
    </Tag>
  );
};
