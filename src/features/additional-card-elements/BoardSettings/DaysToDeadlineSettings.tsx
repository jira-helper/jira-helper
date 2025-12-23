import React from 'react';
import { Checkbox, InputNumber, Radio, Select, Space, Typography, Spin } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { JiraField } from 'src/shared/jira/types';
import { DaysToDeadlineDisplayMode } from '../types';
import { useAdditionalCardElementsBoardPropertyStore } from '../stores/additionalCardElementsBoardProperty';

const { Text } = Typography;

const TEXTS = {
  title: {
    en: 'Days to Deadline Badge',
    ru: 'Бейдж "Дней до дедлайна"',
  },
  enable: {
    en: 'Show days to deadline badge',
    ru: 'Показывать бейдж с днями до дедлайна',
  },
  selectField: {
    en: 'Deadline field:',
    ru: 'Поле дедлайна:',
  },
  selectFieldPlaceholder: {
    en: 'Select field',
    ru: 'Выберите поле',
  },
  displayMode: {
    en: 'Display mode:',
    ru: 'Режим отображения:',
  },
  displayModeAlways: {
    en: 'Always',
    ru: 'Всегда',
  },
  displayModeLessThanOrOverdue: {
    en: 'Less than X days or overdue',
    ru: 'Менее Х дней или просрочено',
  },
  displayModeOverdueOnly: {
    en: 'Overdue only',
    ru: 'Только просрочено',
  },
  displayThreshold: {
    en: 'Show when days left ≤',
    ru: 'Показывать когда дней осталось ≤',
  },
  warningThreshold: {
    en: 'Warning (yellow) when days left ≤',
    ru: 'Предупреждение (жёлтый) когда дней осталось ≤',
  },
  thresholdHint: {
    en: 'Leave empty for no yellow highlighting (only red when overdue)',
    ru: 'Оставьте пустым, чтобы не подсвечивать жёлтым (только красный при просрочке)',
  },
  noFieldSelected: {
    en: 'Please select a deadline field to enable this feature',
    ru: 'Пожалуйста, выберите поле дедлайна для включения этой фичи',
  },
  loadingFields: {
    en: 'Loading fields...',
    ru: 'Загрузка полей...',
  },
} as const;

const DEADLINE_FIELD_TYPES = ['date', 'datetime', 'string'];

const filterDeadlineFields = (fields: JiraField[]): JiraField[] => {
  return fields.filter(field => field.schema?.type && DEADLINE_FIELD_TYPES.includes(field.schema.type));
};

export const DaysToDeadlineSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { data, actions } = useAdditionalCardElementsBoardPropertyStore();
  const { daysToDeadline } = data;
  const { fields, isLoading } = useGetFields();

  const deadlineFields = React.useMemo(() => filterDeadlineFields(fields || []), [fields]);

  const handleEnabledChange = (checked: boolean) => {
    actions.setDaysToDeadline({ enabled: checked });
  };

  const handleFieldChange = (fieldId: string) => {
    actions.setDaysToDeadline({ fieldId });
  };

  const handleDisplayModeChange = (e: any) => {
    const mode = e.target.value as DaysToDeadlineDisplayMode;
    actions.setDaysToDeadline({ displayMode: mode });
  };

  const handleDisplayThresholdChange = (value: number | null) => {
    actions.setDaysToDeadline({ displayThreshold: value ?? undefined });
  };

  const handleWarningThresholdChange = (value: number | null) => {
    actions.setDaysToDeadline({ warningThreshold: value ?? undefined });
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ marginBottom: '12px' }}>{texts.title}</h3>

      <Checkbox
        checked={daysToDeadline.enabled}
        onChange={e => handleEnabledChange(e.target.checked)}
        data-testid="days-to-deadline-enabled-checkbox"
        style={{ marginBottom: '12px' }}
      >
        {texts.enable}
      </Checkbox>

      {daysToDeadline.enabled && (
        <div style={{ marginLeft: '24px' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text>{texts.selectField}</Text>
              {isLoading ? (
                <Spin size="small" style={{ marginLeft: '8px' }} />
              ) : (
                <Select
                  value={daysToDeadline.fieldId}
                  onChange={handleFieldChange}
                  placeholder={texts.selectFieldPlaceholder}
                  data-testid="days-to-deadline-field-select"
                  style={{ marginLeft: '8px', width: '250px' }}
                  showSearch
                  optionFilterProp="label"
                  options={deadlineFields.map(field => ({
                    value: field.id,
                    label: field.name,
                  }))}
                />
              )}
            </div>

            {!daysToDeadline.fieldId && <Text type="warning">{texts.noFieldSelected}</Text>}

            {daysToDeadline.fieldId && (
              <>
                <div>
                  <Text>{texts.displayMode}</Text>
                  <Radio.Group
                    value={daysToDeadline.displayMode || 'always'}
                    onChange={handleDisplayModeChange}
                    data-testid="days-to-deadline-display-mode"
                    style={{ marginLeft: '8px' }}
                  >
                    <Radio value="always">{texts.displayModeAlways}</Radio>
                    <Radio value="lessThanOrOverdue">{texts.displayModeLessThanOrOverdue}</Radio>
                    <Radio value="overdueOnly">{texts.displayModeOverdueOnly}</Radio>
                  </Radio.Group>
                </div>

                {daysToDeadline.displayMode === 'lessThanOrOverdue' && (
                  <div>
                    <Text>{texts.displayThreshold}</Text>
                    <InputNumber
                      min={0}
                      value={daysToDeadline.displayThreshold}
                      onChange={handleDisplayThresholdChange}
                      placeholder=""
                      data-testid="days-to-deadline-display-threshold"
                      style={{ marginLeft: '8px', width: '80px' }}
                    />
                  </div>
                )}

                {daysToDeadline.displayMode !== 'overdueOnly' && (
                  <div>
                    <Text>{texts.warningThreshold}</Text>
                    <InputNumber
                      min={0}
                      value={daysToDeadline.warningThreshold}
                      onChange={handleWarningThresholdChange}
                      placeholder=""
                      data-testid="days-to-deadline-warning-threshold"
                      style={{ marginLeft: '8px', width: '80px' }}
                    />
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {texts.thresholdHint}
                    </Text>
                  </div>
                )}
              </>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};
