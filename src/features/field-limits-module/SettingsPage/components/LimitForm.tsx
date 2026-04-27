/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useState, useEffect } from 'react';
import { Select, Input, InputNumber, Button, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { CardLayoutField, BoardColumn, BoardSwimlane, FieldLimit, LimitFormInput } from '../../types';
import { CalcType } from '../../types';
import type { FieldLimitsTextKeys } from '../../texts';

export interface LimitFormProps {
  fields: CardLayoutField[];
  columns: BoardColumn[];
  swimlanes: BoardSwimlane[];
  editingLimit: FieldLimit | null;
  onAdd: (input: LimitFormInput) => void;
  onEdit: (input: LimitFormInput) => void;
  disabled?: boolean;
  texts: Record<FieldLimitsTextKeys, string>;
}

export const LimitForm: React.FC<LimitFormProps> = ({
  fields,
  columns,
  swimlanes,
  editingLimit,
  onAdd,
  onEdit,
  disabled = false,
  texts,
}) => {
  const [calcType, setCalcType] = useState<CalcType>(CalcType.EXACT_VALUE);
  const [fieldId, setFieldId] = useState<string>('');
  const [fieldValue, setFieldValue] = useState('');
  const [multipleValues, setMultipleValues] = useState<string[]>([]);
  const [visualValue, setVisualValue] = useState('');
  const [limit, setLimit] = useState<number>(0);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedSwimlanes, setSelectedSwimlanes] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const resetForm = () => {
    setCalcType(CalcType.EXACT_VALUE);
    setFieldId('');
    setFieldValue('');
    setMultipleValues([]);
    setTagInput('');
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
        <label htmlFor="field-select">{texts.field}</label>
        <Select
          id="field-select"
          placeholder={texts.selectField}
          value={fieldId || undefined}
          onChange={setFieldId}
          options={fields.map(f => ({ value: f.fieldId, label: f.name }))}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="field-select"
        />

        <label htmlFor="calc-type-select">{texts.calculationType}</label>
        <Select
          id="calc-type-select"
          placeholder={texts.calculationType}
          value={calcType}
          onChange={(value: CalcType) => {
            setCalcType(value);
            setFieldValue('');
            setMultipleValues([]);
          }}
          options={[
            { value: CalcType.HAS_FIELD, label: texts.calcHasField },
            { value: CalcType.EXACT_VALUE, label: texts.calcExactValue },
            { value: CalcType.MULTIPLE_VALUES, label: texts.calcMultipleValues },
            { value: CalcType.SUM_NUMBERS, label: texts.calcSumNumbers },
          ]}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="calc-type-select"
        />

        {calcType === CalcType.EXACT_VALUE && (
          <>
            <label htmlFor="field-value-input">{texts.fieldValue}</label>
            <Input
              id="field-value-input"
              placeholder={texts.fieldValue}
              value={fieldValue}
              onChange={e => setFieldValue(e.target.value)}
              disabled={disabled}
              data-testid="field-value-input"
            />
          </>
        )}

        {calcType === CalcType.MULTIPLE_VALUES && (
          <>
            <label htmlFor="field-value-tags">{texts.fieldValues}</label>
            {multipleValues.length > 0 && (
              <div style={{ marginBottom: 4 }} data-testid="field-value-tags">
                {multipleValues.map(val => (
                  <Tag
                    key={val}
                    closable={!disabled}
                    onClose={() => setMultipleValues(prev => prev.filter(v => v !== val))}
                    style={{ marginBottom: 4 }}
                  >
                    {val}
                  </Tag>
                ))}
              </div>
            )}
            <Space.Compact style={{ width: '100%' }}>
              <Input
                id="field-value-tags"
                placeholder={texts.typeValuePlaceholder}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                disabled={disabled}
                onPressEnter={() => {
                  const val = tagInput.trim();
                  if (val && !multipleValues.includes(val)) {
                    setMultipleValues(prev => [...prev, val]);
                  }
                  setTagInput('');
                }}
                data-testid="field-value-tag-input"
              />
              <Button
                icon={<PlusOutlined />}
                disabled={disabled || !tagInput.trim()}
                onClick={() => {
                  const val = tagInput.trim();
                  if (val && !multipleValues.includes(val)) {
                    setMultipleValues(prev => [...prev, val]);
                  }
                  setTagInput('');
                }}
                data-testid="field-value-tag-add"
              />
            </Space.Compact>
          </>
        )}

        <label htmlFor="visual-value-input">{texts.visualName}</label>
        <Input
          id="visual-value-input"
          placeholder={texts.visualNamePlaceholder}
          value={visualValue}
          onChange={e => setVisualValue(e.target.value)}
          disabled={disabled}
          data-testid="visual-value-input"
        />

        <label htmlFor="limit-input">{texts.wipLimit}</label>
        <InputNumber
          id="limit-input"
          placeholder={texts.wipLimit}
          value={limit}
          onChange={val => setLimit(val ?? 0)}
          min={0}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="limit-input"
        />

        <label htmlFor="columns-select">{texts.columns}</label>
        <Select
          id="columns-select"
          mode="multiple"
          allowClear
          showSearch={false}
          placeholder={texts.columnsPlaceholder}
          value={selectedColumns}
          onChange={setSelectedColumns}
          options={columns.map(c => ({ value: c.id, label: c.name }))}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="columns-select"
        />

        <label htmlFor="swimlanes-select">{texts.swimlanes}</label>
        <Select
          id="swimlanes-select"
          mode="multiple"
          allowClear
          showSearch={false}
          placeholder={texts.swimlanesPlaceholder}
          value={selectedSwimlanes}
          onChange={setSelectedSwimlanes}
          options={swimlanes.map(s => ({ value: s.id, label: s.name }))}
          style={{ width: '100%' }}
          disabled={disabled}
          data-testid="swimlanes-select"
        />

        <Space>
          <Button type="primary" onClick={handleAdd} disabled={disabled || !isValid || !!editingLimit}>
            {texts.addLimit}
          </Button>
          <Button onClick={handleEdit} disabled={disabled || !isValid || !editingLimit}>
            {texts.editLimit}
          </Button>
        </Space>
      </Space>
    </div>
  );
};
