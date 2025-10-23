import React, { useState, useEffect } from 'react';
import { Select, Input, Alert, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { throttle } from 'src/shared/utils';
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

  // Sync local state when value prop changes
  useEffect(() => {
    setFieldValue(value.value || '');
  }, [value.value]);

  useEffect(() => {
    setJqlValue(value.jql || '');
  }, [value.jql]);

  // Throttled handlers
  const throttledUpdateFieldValue = React.useMemo(
    () =>
      throttle((val: string) => {
        onChange({ ...value, value: val });
      }, 600),
    [value, onChange]
  );

  const throttledUpdateJql = React.useMemo(
    () =>
      throttle((val: string) => {
        onChange({ ...value, jql: val });
      }, 600),
    [value, onChange]
  );

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
    setFieldValue(val);
    throttledUpdateFieldValue(val);
  };

  const handleJqlChange = (val: string) => {
    setJqlValue(val);
    throttledUpdateJql(val);
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
                onChange={e => handleJqlChange(e.target.value)}
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
