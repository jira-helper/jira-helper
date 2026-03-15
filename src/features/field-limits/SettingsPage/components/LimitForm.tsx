import React, { useState, useEffect } from 'react';
import { Select, Input, InputNumber, Button, Space } from 'antd';
import type { CardLayoutField, BoardColumn, BoardSwimlane, FieldLimit, LimitFormInput } from '../../types';
import { CalcType } from '../../types';

export interface LimitFormProps {
  fields: CardLayoutField[];
  columns: BoardColumn[];
  swimlanes: BoardSwimlane[];
  editingLimit: FieldLimit | null;
  onAdd: (input: LimitFormInput) => void;
  onEdit: (input: LimitFormInput) => void;
  disabled?: boolean;
}

export const LimitForm: React.FC<LimitFormProps> = ({
  fields,
  columns,
  swimlanes,
  editingLimit,
  onAdd,
  onEdit,
  disabled = false,
}) => {
  const [calcType, setCalcType] = useState<CalcType>(CalcType.EXACT_VALUE);
  const [fieldId, setFieldId] = useState<string>('');
  const [fieldValue, setFieldValue] = useState('');
  const [multipleValues, setMultipleValues] = useState<string[]>([]);
  const [visualValue, setVisualValue] = useState('');
  const [limit, setLimit] = useState<number>(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedSwimlanes, setSelectedSwimlanes] = useState<string[]>([]);

  const resetForm = () => {
    setCalcType(CalcType.EXACT_VALUE);
    setFieldId('');
    setFieldValue('');
    setMultipleValues([]);
    setVisualValue('');
    setLimit(0);
    setSelectedColumns([]);
    setSelectedSwimlanes([]);
  };

  // Предзаполнение при editingLimit
  useEffect(() => {
    if (editingLimit) {
      setCalcType(editingLimit.calcType);
      setFieldId(editingLimit.fieldId);
      if (editingLimit.calcType === CalcType.MULTIPLE_VALUES) {
        setMultipleValues(editingLimit.fieldValue.split(/\s*,\s*/).filter(Boolean));
        setFieldValue('');
      } else {
        setFieldValue(editingLimit.fieldValue);
        setMultipleValues([]);
      }
      setVisualValue(editingLimit.visualValue);
      setLimit(editingLimit.limit);
      setSelectedColumns(editingLimit.columns);
      setSelectedSwimlanes(editingLimit.swimlanes);
    } else {
      resetForm();
    }
  }, [editingLimit]);

  const getFormInput = (): LimitFormInput => {
    let resolvedFieldValue = fieldValue;
    if (calcType === CalcType.MULTIPLE_VALUES) {
      resolvedFieldValue = multipleValues.join(', ');
    } else if (calcType === CalcType.HAS_FIELD || calcType === CalcType.SUM_NUMBERS) {
      resolvedFieldValue = '';
    }
    return {
      calcType,
      fieldId,
      fieldValue: resolvedFieldValue,
      visualValue: visualValue || resolvedFieldValue || fieldId,
      limit,
      columns: selectedColumns,
      swimlanes: selectedSwimlanes,
    };
  };

  const needsFieldValue = calcType === CalcType.EXACT_VALUE;
  const needsMultipleValues = calcType === CalcType.MULTIPLE_VALUES;
  const isValid =
    fieldId &&
    limit > 0 &&
    ((!needsFieldValue && !needsMultipleValues) ||
      (needsFieldValue && !!fieldValue) ||
      (needsMultipleValues && multipleValues.length > 0));

  const handleAdd = () => {
    if (!isValid) return;
    onAdd(getFormInput());
    resetForm();
  };

  const handleEdit = () => {
    if (!isValid || !editingLimit) return;
    onEdit(getFormInput());
    resetForm();
  };

  return (
    <div data-testid="field-limits-form">
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <label htmlFor="field-select">Field</label>
        <Select
          id="field-select"
          placeholder="Select field"
          value={fieldId || undefined}
          onChange={setFieldId}
          options={fields.map(f => ({ value: f.fieldId, label: f.name }))}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="field-select"
        />

        <label htmlFor="calc-type-select">Calculation type</label>
        <Select
          id="calc-type-select"
          placeholder="Calculation type"
          value={calcType}
          onChange={(value: CalcType) => {
            setCalcType(value);
            setFieldValue('');
            setMultipleValues([]);
          }}
          options={[
            { value: CalcType.HAS_FIELD, label: 'Cards with filled field' },
            { value: CalcType.EXACT_VALUE, label: 'Cards with exact value' },
            { value: CalcType.MULTIPLE_VALUES, label: 'Cards with any of values' },
            { value: CalcType.SUM_NUMBERS, label: 'Sum of numeric field' },
          ]}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="calc-type-select"
        />

        {calcType === CalcType.EXACT_VALUE && (
          <>
            <label htmlFor="field-value-input">Field value</label>
            <Input
              id="field-value-input"
              placeholder="Field value"
              value={fieldValue}
              onChange={e => setFieldValue(e.target.value)}
              disabled={disabled}
              data-testid="field-value-input"
            />
          </>
        )}

        {calcType === CalcType.MULTIPLE_VALUES && (
          <>
            <label htmlFor="field-value-tags">Field value</label>
            <Select
              id="field-value-tags"
              mode="tags"
              placeholder="Type values and press Enter"
              value={multipleValues}
              onChange={setMultipleValues}
              style={{ width: '100%' }}
              disabled={disabled}
              data-testid="field-value-tags"
              tokenSeparators={[',']}
            />
          </>
        )}

        <label htmlFor="visual-value-input">Visual name</label>
        <Input
          id="visual-value-input"
          placeholder="Visual name (displayed on badge)"
          value={visualValue}
          onChange={e => setVisualValue(e.target.value)}
          disabled={disabled}
          data-testid="visual-value-input"
        />

        <label htmlFor="limit-input">WIP Limit</label>
        <InputNumber
          id="limit-input"
          placeholder="WIP Limit"
          value={limit}
          onChange={val => setLimit(val ?? 0)}
          min={0}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="limit-input"
        />

        <label htmlFor="columns-select">Columns</label>
        <Select
          id="columns-select"
          mode="multiple"
          allowClear
          placeholder="Columns (all if empty)"
          value={selectedColumns}
          onChange={setSelectedColumns}
          options={columns.map(c => ({ value: c.id, label: c.name }))}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="columns-select"
        />

        <label htmlFor="swimlanes-select">Swimlanes</label>
        <Select
          id="swimlanes-select"
          mode="multiple"
          allowClear
          placeholder="Swimlanes (all if empty)"
          value={selectedSwimlanes}
          onChange={setSelectedSwimlanes}
          options={swimlanes.map(s => ({ value: s.id, label: s.name }))}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="swimlanes-select"
        />

        <Space>
          <Button type="primary" onClick={handleAdd} disabled={disabled || !isValid || !!editingLimit}>
            Add limit
          </Button>
          <Button onClick={handleEdit} disabled={disabled || !isValid || !editingLimit}>
            Edit limit
          </Button>
        </Space>
      </Space>
    </div>
  );
};
