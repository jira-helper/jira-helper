import React from 'react';
import { Input, InputNumber, Checkbox, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { WipLimitRange } from '../../../types';
import { CellBadge } from './CellBadge';

export interface RangeRowProps {
  /** Range данные для строки */
  range: WipLimitRange;
  /** Callback при удалении range */
  onDelete: () => void;
  /** Callback при удалении ячейки */
  onDeleteCell: (swimlane: string, column: string) => void;
  /** Callback при изменении поля range */
  onChangeField: (field: string, value: any) => void;
  /** Callback при выборе range (для редактирования) */
  onSelect: () => void;
  /** Функция для получения label ячейки */
  getNameLabel: (swimlaneId: string, columnId: string) => string;
}

/**
 * RangeRow - View компонент для строки таблицы ranges.
 * Отображает одну строку с inline editing для name, wipLimit, disable и badges ячеек.
 */
export const RangeRow: React.FC<RangeRowProps> = ({
  range,
  onDelete,
  onDeleteCell,
  onChangeField,
  onSelect,
  getNameLabel,
}) => {
  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onChangeField('name', e.target.value);
  };

  const handleWipLimitChange = (value: number | null) => {
    if (value !== null) {
      onChangeField('wipLimit', value);
    }
  };

  const handleDisableChange = (e: { target: { checked: boolean } }) => {
    onChangeField('disable', e.target.checked);
  };

  return (
    <tr id={range.name} data-testid={`range ${range.name}`}>
      {/* Edit icon column (2%) */}
      <td style={{ width: '2%' }}>
        <Button
          id={`WIP_${range.name}_limitChoose`}
          type="text"
          icon={<EditOutlined />}
          onClick={onSelect}
          aria-label={`Select range ${range.name} for editing`}
          style={{ padding: '4px' }}
        />
      </td>

      {/* Range name column (30%) */}
      <td style={{ width: '30%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Input
            id={`Input_${range.name}`}
            defaultValue={range.name}
            onBlur={handleNameBlur}
            style={{ maxWidth: '150px' }}
            aria-label={`Range name for ${range.name}`}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={onDelete}
            aria-label={`Delete range ${range.name}`}
            danger
            style={{ padding: '4px' }}
          />
        </div>
      </td>

      {/* WIP limit column (10%) */}
      <td style={{ width: '10%' }}>
        <InputNumber
          id={`Input_${range.name}_WIPLIMIT`}
          defaultValue={range.wipLimit}
          onChange={handleWipLimitChange}
          style={{ maxWidth: '75px', width: '100%' }}
          aria-label={`WIP limit for ${range.name}`}
          min={0}
        />
      </td>

      {/* Disable column (3%) */}
      <td style={{ width: '3%' }}>
        <Checkbox
          id={`Input_${range.name}_Disable`}
          defaultChecked={range.disable || false}
          onChange={handleDisableChange}
          aria-label={`Disable range ${range.name}`}
        />
      </td>

      {/* Cells column (50%) */}
      <td style={{ width: '50%' }}>
        {Array.isArray(range.cells) &&
          range.cells.map(cell => (
            <CellBadge
              key={`${range.name}-${cell.swimlane}-${cell.column}`}
              label={getNameLabel(cell.swimlane, cell.column)}
              showBadge={cell.showBadge}
              onDelete={() => onDeleteCell(cell.swimlane, cell.column)}
            />
          ))}
      </td>
    </tr>
  );
};
