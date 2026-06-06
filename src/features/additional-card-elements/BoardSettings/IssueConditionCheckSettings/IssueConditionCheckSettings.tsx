/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import { Card, Button, Space, Divider, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';
import { IssueConditionCheckItem } from './IssueConditionCheckItem';
import { createDefaultCheck } from '../../IssueConditionCheck/utils';

export const TEXTS = {
  title: {
    en: 'Issue Condition Checks',
    ru: 'Проверка условий задач',
  },
  description: {
    en: 'Configure conditions to show visual indicators on issue cards. When a task matches the JQL condition, an icon with tooltip will be displayed.',
    ru: 'Настройте условия для отображения визуальных индикаторов на карточках задач. Когда задача соответствует JQL условию, будет показана иконка с подсказкой.',
  },
  addCheck: {
    en: 'Add Condition Check',
    ru: 'Добавить проверку',
  },
  clearAll: {
    en: 'Clear All',
    ru: 'Очистить все',
  },
  noChecks: {
    en: 'No condition checks configured yet. Click "Add Condition Check" to get started.',
    ru: 'Проверки условий ещё не настроены. Нажмите "Добавить проверку" чтобы начать.',
  },
} as const;

export const IssueConditionCheckSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { data, actions } = useAdditionalCardElementsBoardPropertyStore();
  const checks = data.issueConditionChecks || [];

  const handleAddCheck = () => {
    const checkNumber = checks.length + 1;
    const newCheck = createDefaultCheck({
      name: `Check ${checkNumber}`,
    });
    actions.addIssueConditionCheck(newCheck);
  };

  const handleUpdateCheck = (id: string, updates: Partial<(typeof checks)[0]>) => {
    actions.updateIssueConditionCheck(id, updates);
  };

  const handleRemoveCheck = (id: string) => {
    actions.removeIssueConditionCheck(id);
  };

  const handleClearAll = () => {
    actions.setIssueConditionChecks([]);
  };

  return (
    <Card
      title={texts.title}
      style={{ marginBottom: '16px' }}
      type="inner"
      data-testid="issue-condition-check-settings"
    >
      <p style={{ marginBottom: '16px', color: '#666' }}>{texts.description}</p>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {checks.length === 0 ? (
          <Empty description={texts.noChecks} />
        ) : (
          checks.map(check => (
            <IssueConditionCheckItem
              key={check.id}
              check={check}
              onUpdate={handleUpdateCheck}
              onRemove={handleRemoveCheck}
            />
          ))
        )}

        <Divider style={{ margin: '12px 0' }} />

        <Space>
          <Button
            type="dashed"
            onClick={handleAddCheck}
            icon={<PlusOutlined />}
            data-testid="add-condition-check-button"
          >
            {texts.addCheck}
          </Button>

          {checks.length > 0 && (
            <Button type="default" onClick={handleClearAll} danger data-testid="clear-all-condition-checks-button">
              {texts.clearAll}
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};
