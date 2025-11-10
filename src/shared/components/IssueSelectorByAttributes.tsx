import React, { useState, useEffect, useRef } from 'react';
import { Select, Input, Alert, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { debounce } from 'src/shared/utils';
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
    en: 'Group by',
    ru: 'Группировать по',
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
    en: 'Select a field to filter by',
    ru: 'Выберите поле для фильтрации',
  },
  valueTooltip: {
    en: 'Enter the value to match',
    ru: 'Введите значение для сопоставления',
  },
  jqlTooltip: {
    en: 'Enter JQL query to filter issues',
    ru: 'Введите JQL запрос для фильтрации задач',
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

  // Local state for inputs to avoid excessive re-renders
  const [fieldValue, setFieldValue] = useState(value.value || '');
  const [jqlValue, setJqlValue] = useState(value.jql || '');

  // Track last edit time to prevent external updates while user is typing
  const lastEditTimeFieldValue = useRef<number>(0);
  const lastEditTimeJql = useRef<number>(0);
  const DEBOUNCE_DELAY = 600; // ms

  // Store latest value and onChange in refs to avoid recreating debounced functions
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Update refs when props change
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [value, onChange]);

  // Create debounced functions once and keep them stable using useMemo
  const debouncedUpdateFieldValue = React.useMemo(
    () =>
      debounce((val: string) => {
        onChangeRef.current({ ...valueRef.current, value: val });
      }, DEBOUNCE_DELAY),
    [] // Empty deps - function is stable, uses refs for current values
  );

  const debouncedUpdateJql = React.useMemo(
    () =>
      debounce((val: string) => {
        onChangeRef.current({ ...valueRef.current, jql: val });
      }, DEBOUNCE_DELAY),
    [] // Empty deps - function is stable, uses refs for current values
  );

  // Sync local state when value prop changes, but only if user hasn't edited recently
  useEffect(() => {
    const timeSinceLastEdit = Date.now() - lastEditTimeFieldValue.current;
    if (timeSinceLastEdit >= DEBOUNCE_DELAY && (value.value || '') !== fieldValue) {
      setFieldValue(value.value || '');
    }
  }, [value.value, fieldValue]);

  useEffect(() => {
    const timeSinceLastEdit = Date.now() - lastEditTimeJql.current;
    if (timeSinceLastEdit >= DEBOUNCE_DELAY && (value.jql || '') !== jqlValue) {
      setJqlValue(value.jql || '');
    }
  }, [value.jql, jqlValue]);

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
    lastEditTimeFieldValue.current = Date.now();
    setFieldValue(val);
    debouncedUpdateFieldValue(val);
  };

  const handleJqlChange = (val: string) => {
    lastEditTimeJql.current = Date.now();
    setJqlValue(val);
    debouncedUpdateJql(val);
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
