import React, { useState, useMemo, useEffect } from 'react';
import { Input, Select, Checkbox, Button, Form } from 'antd';
import type { WipLimitCell } from '../../../types';

export interface RangeFormProps {
  /** Доступные swimlanes */
  swimlanes: Array<{ id: string; name: string }>;
  /** Доступные columns */
  columns: Array<{ id: string; name: string }>;
  /** Callback при добавлении range */
  onAddRange: (name: string) => boolean; // returns false if validation fails
  /** Callback при добавлении cell */
  onAddCell: (rangeName: string, cell: WipLimitCell) => void;
  /** Существующие имена ranges для определения режима "Add range" vs "Add cell" */
  existingRangeNames: string[];
  /** Выбранное имя range для редактирования (заполняет форму) */
  selectedRangeName?: string | null;
  /** Callback при изменении selectedRangeName */
  onRangeNameChange?: (name: string | null) => void;
}

/**
 * RangeForm - View компонент формы для добавления range или cell.
 * Заменяет HTML-шаблоны RangeName() и cellsAdd() из constants.ts.
 *
 * Логика:
 * - Если имя совпадает с существующим range (case-insensitive) → режим "Add cell"
 * - Иначе → режим "Add range"
 * - При submit: валидация swimlane и column != "-"
 * - Если "Add cell" режим: вызывается onAddCell
 * - Если "Add range" режим: вызывается onAddRange, затем onAddCell
 */
export const RangeForm: React.FC<RangeFormProps> = ({
  swimlanes,
  columns,
  onAddRange,
  onAddCell,
  existingRangeNames,
  selectedRangeName,
  onRangeNameChange,
}) => {
  // Local state для формы
  const [name, setName] = useState('');
  const [swimlane, setSwimlane] = useState('-');
  const [column, setColumn] = useState('-');
  const [showBadge, setShowBadge] = useState(false);

  // Обновление формы при изменении selectedRangeName
  useEffect(() => {
    if (selectedRangeName) {
      setName(selectedRangeName);
    }
  }, [selectedRangeName]);

  // Определение режима: "Add range" или "Add cell"
  const isAddCellMode = useMemo(() => {
    if (!name.trim()) return false;
    return existingRangeNames.some(existingName => existingName.toLowerCase() === name.trim().toLowerCase());
  }, [name, existingRangeNames]);

  const buttonText = isAddCellMode ? 'Add cell' : 'Add range';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация: swimlane и column должны быть выбраны
    if (swimlane === '-' || column === '-') {
      // eslint-disable-next-line no-alert
      alert('need choose swimlane and column and try again.');
      return;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    if (isAddCellMode) {
      // Режим "Add cell": добавляем cell к существующему range
      onAddCell(trimmedName, {
        swimlane,
        column,
        showBadge,
      });
    } else {
      // Режим "Add range": сначала создаём range, затем добавляем cell
      const addRangeResult = onAddRange(trimmedName);
      if (addRangeResult) {
        onAddCell(trimmedName, {
          swimlane,
          column,
          showBadge,
        });
      }
    }

    // Сброс формы после успешного добавления
    setName('');
    setSwimlane('-');
    setColumn('-');
    setShowBadge(false);
    // Сбросить selectedRangeName если был установлен
    if (onRangeNameChange) {
      onRangeNameChange(null);
    }
  };

  return (
    <>
      {/* Add range section */}
      <form onSubmit={handleSubmit}>
        <Form.Item label="Add range" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <Input
              id="WIP_inputRange"
              placeholder="name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button id="WIP_buttonRange" type="primary" htmlType="submit">
              {buttonText}
            </Button>
          </div>
        </Form.Item>
      </form>

      {/* Cell selection section */}
      <div style={{ marginTop: '1rem' }}>
        <Form.Item label="swimlane" style={{ marginBottom: '16px' }}>
          <Select
            id="WIPLC_swimlane"
            style={{ width: '100%' }}
            value={swimlane}
            onChange={value => setSwimlane(value)}
            options={[
              { label: '-', value: '-' },
              ...swimlanes.map(element => ({
                label: element.name,
                value: element.id,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item label="Column" style={{ marginBottom: '16px' }}>
          <Select
            id="WIPLC_Column"
            style={{ width: '100%' }}
            value={column}
            onChange={value => setColumn(value)}
            options={[
              { label: '-', value: '-' },
              ...columns.map(element => ({
                label: element.name,
                value: element.id,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: '16px' }}>
          <Checkbox id="WIPLC_showBadge" checked={showBadge} onChange={e => setShowBadge(e.target.checked)}>
            show indicator
          </Checkbox>
        </Form.Item>
      </div>
      <hr />
    </>
  );
};
