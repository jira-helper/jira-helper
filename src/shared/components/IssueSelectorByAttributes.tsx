import React, { useState, useEffect, useRef } from 'react';
import { Select, Input, Alert, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { JqlParserInfoTooltip } from 'src/shared/jql/JqlParserInfoTooltip';
import { IssueSelectorByAttributesProps, IssueSelector } from './IssueSelectorByAttributes.types';

const TEXTS = {
  selectField: {
    en: 'Select field',
    ru: 'Выберите поле',
  },
  fieldValue: {
    en: 'Field value',
    ru: 'Значение поля',
  },
  jql: {
    en: 'JQL',
    ru: 'JQL',
  },
  mode: {
    en: 'Match by',
    ru: 'Сопоставить по',
  },
  modeField: {
    en: 'Field value',
    ru: 'Значению поля',
  },
  modeJql: {
    en: 'JQL',
    ru: 'JQL',
  },
  jqlInvalid: {
    en: 'Invalid JQL',
    ru: 'Некорректный JQL',
  },
  fieldValuePlaceholder: {
    en: 'Enter field value',
    ru: 'Введите значение поля',
  },
  jqlPlaceholder: {
    en: 'Enter JQL query (e.g., status = "Open")',
    ru: 'Введите JQL запрос (например, status = "Open")',
  },
  fieldTooltip: {
    en: 'Select a field to match by',
    ru: 'Выберите поле для сопоставления',
  },
  valueTooltip: {
    en: 'Enter the value to match',
    ru: 'Введите значение для сопоставления',
  },
  jqlTooltip: {
    en: 'Enter JQL query to match issues',
    ru: 'Введите JQL запрос для сопоставления задач',
  },
} as const;

export const IssueSelectorByAttributes: React.FC<IssueSelectorByAttributesProps> = ({
  value,
  onChange,
  fields,
  mode,
  disabled = false,
  testIdPrefix = 'issue-selector',
}) => {
  const texts = useGetTextsByLocale(TEXTS);

  // Local state for inputs - updates immediately on user input
  const [fieldValue, setFieldValue] = useState(value.value || '');
  const [jqlValue, setJqlValue] = useState(value.jql || '');

  // Track if fields are focused to prevent external updates while user is editing
  const isFieldValueFocused = useRef(false);
  const isJqlFocused = useRef(false);

  // Store latest values and onChange in refs for cleanup on unmount
  const fieldValueRef = useRef(fieldValue);
  const jqlValueRef = useRef(jqlValue);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Update refs when values change
  useEffect(() => {
    fieldValueRef.current = fieldValue;
  }, [fieldValue]);

  useEffect(() => {
    jqlValueRef.current = jqlValue;
  }, [jqlValue]);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  // Sync local state when value prop changes, but only if field is not focused
  useEffect(() => {
    if (!isFieldValueFocused.current && (value.value || '') !== fieldValue) {
      setFieldValue(value.value || '');
    }
  }, [value.value, fieldValue]);

  useEffect(() => {
    if (!isJqlFocused.current && (value.jql || '') !== jqlValue) {
      setJqlValue(value.jql || '');
    }
  }, [value.jql, jqlValue]);

  // Save changes on unmount
  useEffect(() => {
    return () => {
      // On unmount, save current local state if it differs from prop
      if (fieldValueRef.current !== (valueRef.current.value || '')) {
        onChangeRef.current({ ...valueRef.current, value: fieldValueRef.current });
      }
      if (jqlValueRef.current !== (valueRef.current.jql || '')) {
        onChangeRef.current({ ...valueRef.current, jql: jqlValueRef.current });
      }
    };
  }, []);

  // JQL validation
  let jqlError = '';
  if (value.mode === 'jql' && jqlValue) {
    try {
      parseJql(jqlValue);
    } catch (e: any) {
      jqlError = `${texts.jqlInvalid}: ${e.message}`;
    }
  }

  const handleModeChange = (newMode: 'field' | 'jql') => {
    const newSelector: IssueSelector = {
      mode: newMode,
      fieldId: newMode === 'field' ? value.fieldId : undefined,
      value: newMode === 'field' ? value.value : undefined,
      jql: newMode === 'jql' ? value.jql : undefined,
    };
    onChange(newSelector);
  };

  const handleFieldChange = (fieldId: string) => {
    onChange({ ...value, fieldId });
  };

  const handleFieldValueChange = (val: string) => {
    // Update local state immediately
    setFieldValue(val);
  };

  const handleFieldValueBlur = () => {
    isFieldValueFocused.current = false;
    // Update external state only if local value differs from prop
    if (fieldValue !== (value.value || '')) {
      onChange({ ...value, value: fieldValue });
    }
  };

  const handleFieldValueFocus = () => {
    isFieldValueFocused.current = true;
  };

  const handleJqlChange = (val: string) => {
    // Update local state immediately
    setJqlValue(val);
  };

  const handleJqlBlur = () => {
    isJqlFocused.current = false;
    // Update external state only if local value differs from prop
    if (jqlValue !== (value.jql || '')) {
      onChange({ ...value, jql: jqlValue });
    }
  };

  const handleJqlFocus = () => {
    isJqlFocused.current = true;
  };

  const currentMode = mode || value.mode;

  return (
    <div>
      <Row gutter={[16, 16]} align="middle">
        {/* Mode Selection */}
        <Col xs={24} sm={6}>
          <div>
            <label htmlFor={`${testIdPrefix}-mode`} style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              {texts.mode}
            </label>
            <Select
              id={`${testIdPrefix}-mode`}
              value={currentMode}
              onChange={handleModeChange}
              options={[
                { value: 'field', label: texts.modeField },
                { value: 'jql', label: texts.modeJql },
              ]}
              style={{ width: '100%' }}
              disabled={disabled}
              data-testid={`${testIdPrefix}-mode`}
            />
          </div>
        </Col>

        {currentMode === 'field' ? (
          <>
            {/* Field Selection */}
            <Col xs={24} sm={9}>
              <div>
                <label
                  htmlFor={`${testIdPrefix}-field-select`}
                  style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
                >
                  {texts.selectField}
                  <Tooltip title={texts.fieldTooltip}>
                    <InfoCircleOutlined style={{ marginLeft: '4px' }} />
                  </Tooltip>
                </label>
                <Select
                  id={`${testIdPrefix}-field-select`}
                  value={value.fieldId || undefined}
                  onChange={handleFieldChange}
                  style={{ width: '100%' }}
                  placeholder={texts.selectField}
                  disabled={disabled}
                  filterOption={(input, option) => {
                    const label = option?.label;
                    return label ? label.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false;
                  }}
                  showSearch
                  data-testid={`${testIdPrefix}-field-select`}
                  options={fields.map(field => ({ value: field.id, label: field.name }))}
                />
              </div>
            </Col>

            {/* Field Value */}
            <Col xs={24} sm={9}>
              <div>
                <label
                  htmlFor={`${testIdPrefix}-field-value`}
                  style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
                >
                  {texts.fieldValue}
                  <Tooltip title={texts.valueTooltip}>
                    <InfoCircleOutlined style={{ marginLeft: '4px' }} />
                  </Tooltip>
                </label>
                <Input
                  id={`${testIdPrefix}-field-value`}
                  value={fieldValue}
                  onChange={e => handleFieldValueChange(e.target.value)}
                  onFocus={handleFieldValueFocus}
                  onBlur={handleFieldValueBlur}
                  placeholder={texts.fieldValuePlaceholder}
                  disabled={disabled}
                  data-testid={`${testIdPrefix}-field-value`}
                />
              </div>
            </Col>
          </>
        ) : (
          /* JQL Mode */
          <Col xs={24} sm={18}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <label htmlFor={`${testIdPrefix}-jql-input`} style={{ fontSize: '12px', fontWeight: 500 }}>
                  {texts.jql}
                </label>
                <JqlParserInfoTooltip />
              </div>
              <Input
                id={`${testIdPrefix}-jql-input`}
                value={jqlValue}
                onChange={e => {
                  handleJqlChange(e.target.value);
                }}
                onFocus={handleJqlFocus}
                onBlur={handleJqlBlur}
                placeholder={texts.jqlPlaceholder}
                disabled={disabled}
                style={{
                  width: '100%',
                  borderColor: jqlError ? '#ff4d4f' : undefined,
                  minWidth: 400,
                }}
                data-testid={`${testIdPrefix}-jql-input`}
              />
              {jqlError && (
                <ExclamationCircleOutlined style={{ color: '#ff4d4f', position: 'absolute', right: 8, top: 8 }} />
              )}
              {jqlError && (
                <Alert
                  type="error"
                  message={jqlError}
                  showIcon
                  style={{ marginTop: 6, marginBottom: 0 }}
                  data-testid={`${testIdPrefix}-jql-error`}
                />
              )}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};
