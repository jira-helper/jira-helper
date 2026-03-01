import React from 'react';
import { Card, Input, Select, Switch, Button, Space, Typography, ColorPicker, Radio, Tooltip } from 'antd';
import { DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import {
  IssueConditionCheck,
  IssueConditionCheckIcon,
  IssueConditionCheckMode,
  IssueConditionCheckAnimation,
  IssueConditionCheckSubtaskMatchMode,
  IssueConditionCheckSubtaskSources,
} from '../../types';
import {
  DEFAULT_SUBTASK_SOURCES,
  validateJql,
  ICON_CONFIG,
  COLOR_PRESETS,
  ANIMATION_CONFIG,
  getIconEmoji,
} from '../../IssueConditionCheck/utils';
import { IssueConditionCheckBadgePreview } from '../../IssueConditionCheck/IssueConditionCheckBadge';

const { Text } = Typography;
const { TextArea } = Input;

export const TEXTS = {
  enabled: {
    en: 'Enabled',
    ru: 'Включено',
  },
  name: {
    en: 'Name',
    ru: 'Название',
  },
  namePlaceholder: {
    en: 'e.g., Missing Acceptance Criteria',
    ru: 'например, Отсутствуют критерии приёмки',
  },
  mode: {
    en: 'Check Mode',
    ru: 'Режим проверки',
  },
  modeSimple: {
    en: 'Simple JQL',
    ru: 'Простой JQL',
  },
  modeSimpleHint: {
    en: 'Show icon when issue matches JQL',
    ru: 'Показывать иконку когда задача соответствует JQL',
  },
  modeWithSubtasks: {
    en: 'With Subtasks',
    ru: 'С подзадачами',
  },
  modeWithSubtasksHint: {
    en: 'Show icon when issue matches JQL AND has subtasks matching another JQL',
    ru: 'Показывать иконку когда задача соответствует JQL И имеет подзадачи соответствующие другому JQL',
  },
  jql: {
    en: 'JQL Condition',
    ru: 'JQL условие',
  },
  jqlPlaceholder: {
    en: 'e.g., "Acceptance Criteria" = EMPTY',
    ru: 'например, "Acceptance Criteria" = EMPTY',
  },
  issueJql: {
    en: 'Issue JQL',
    ru: 'JQL задачи',
  },
  issueJqlPlaceholder: {
    en: 'e.g., status = "In Progress"',
    ru: 'например, status = "In Progress"',
  },
  subtaskJql: {
    en: 'Subtask JQL',
    ru: 'JQL подзадач',
  },
  subtaskJqlPlaceholder: {
    en: 'e.g., status = "To Do"',
    ru: 'например, status = "To Do"',
  },
  icon: {
    en: 'Icon',
    ru: 'Иконка',
  },
  color: {
    en: 'Color',
    ru: 'Цвет',
  },
  tooltipText: {
    en: 'Tooltip Text',
    ru: 'Текст подсказки',
  },
  tooltipPlaceholder: {
    en: 'What should the user do when they see this icon?',
    ru: 'Что пользователь должен сделать, увидев эту иконку?',
  },
  preview: {
    en: 'Preview',
    ru: 'Предпросмотр',
  },
  remove: {
    en: 'Remove',
    ru: 'Удалить',
  },
  jqlValid: {
    en: 'JQL is valid',
    ru: 'JQL корректен',
  },
  jqlInvalid: {
    en: 'JQL is invalid',
    ru: 'JQL некорректен',
  },
  advancedSettings: {
    en: 'Advanced Settings',
    ru: 'Расширенные настройки',
  },
  animation: {
    en: 'Animation',
    ru: 'Анимация',
  },
  animationHint: {
    en: 'Use animations to highlight critical conditions',
    ru: 'Используйте анимации для выделения критичных условий',
  },
  subtaskMatchMode: {
    en: 'Subtask Match Mode',
    ru: 'Режим проверки подзадач',
  },
  subtaskMatchModeAny: {
    en: 'Any subtask matches',
    ru: 'Любая подзадача подходит',
  },
  subtaskMatchModeAnyHint: {
    en: 'Condition met if at least one subtask matches the JQL',
    ru: 'Условие выполнено если хотя бы одна подзадача соответствует JQL',
  },
  subtaskMatchModeAll: {
    en: 'All subtasks match',
    ru: 'Все подзадачи подходят',
  },
  subtaskMatchModeAllHint: {
    en: 'Condition met only if ALL subtasks match the JQL',
    ru: 'Условие выполнено только если ВСЕ подзадачи соответствуют JQL',
  },
  subtaskSources: {
    en: 'Subtask Sources',
    ru: 'Источники подзадач',
  },
  subtaskSourcesHint: {
    en: 'Select which types of related issues to check',
    ru: 'Выберите какие типы связанных задач проверять',
  },
  includeDirectSubtasks: {
    en: 'Direct subtasks',
    ru: 'Прямые подзадачи',
  },
  includeDirectSubtasksHint: {
    en: 'Issues with issuetype.subtask = true',
    ru: 'Задачи с issuetype.subtask = true',
  },
  includeEpicChildren: {
    en: 'Epic children',
    ru: 'Дети эпика',
  },
  includeEpicChildrenHint: {
    en: 'Stories/Tasks linked to Epic',
    ru: 'Истории/Задачи связанные с эпиком',
  },
  includeLinkedIssues: {
    en: 'Linked issues',
    ru: 'Связанные задачи',
  },
  includeLinkedIssuesHint: {
    en: 'Issues connected via Jira issue links',
    ru: 'Задачи связанные через Jira ссылки',
  },
} as const;

// All available icons from ICON_CONFIG
const ICON_OPTIONS = Object.keys(ICON_CONFIG) as IssueConditionCheckIcon[];

const ANIMATION_OPTIONS = Object.keys(ANIMATION_CONFIG) as IssueConditionCheckAnimation[];

export interface IssueConditionCheckItemProps {
  check: IssueConditionCheck;
  onUpdate: (id: string, updates: Partial<IssueConditionCheck>) => void;
  onRemove: (id: string) => void;
}

export const IssueConditionCheckItem: React.FC<IssueConditionCheckItemProps> = ({ check, onUpdate, onRemove }) => {
  const texts = useGetTextsByLocale(TEXTS);

  // Validate JQL fields
  const jqlValidation = check.mode === 'simple' ? validateJql(check.jql || '') : { valid: true, error: undefined };

  const issueJqlValidation =
    check.mode === 'withSubtasks' ? validateJql(check.issueJql || '') : { valid: true, error: undefined };

  const subtaskJqlValidation =
    check.mode === 'withSubtasks' ? validateJql(check.subtaskJql || '') : { valid: true, error: undefined };

  const handleChange = (field: keyof IssueConditionCheck, value: unknown) => {
    onUpdate(check.id, { [field]: value });
  };

  const handleModeChange = (mode: IssueConditionCheckMode) => {
    onUpdate(check.id, {
      mode,
      // Clear irrelevant fields when switching modes
      ...(mode === 'simple' ? { issueJql: undefined, subtaskJql: undefined } : { jql: undefined }),
    });
  };

  const cardTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Switch
        size="small"
        checked={check.enabled}
        onChange={enabled => handleChange('enabled', enabled)}
        data-testid={`condition-check-enabled-${check.id}`}
      />
      <IssueConditionCheckBadgePreview
        icon={check.icon}
        color={check.color}
        tooltipText={check.tooltipText || 'Preview'}
        animation={check.animation}
      />
      <Text strong style={{ flex: 1 }}>
        {check.name || 'Unnamed Check'}
      </Text>
    </div>
  );

  return (
    <Card
      size="small"
      title={cardTitle}
      extra={
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(check.id)}
          data-testid={`condition-check-remove-${check.id}`}
        >
          {texts.remove}
        </Button>
      }
      style={{
        opacity: check.enabled ? 1 : 0.7,
        backgroundColor: check.enabled ? '#fff' : '#fafafa',
      }}
      data-testid={`condition-check-item-${check.id}`}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Name */}
        <div>
          <Text strong>{texts.name}</Text>
          <Input
            value={check.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder={texts.namePlaceholder}
            style={{ marginTop: '4px' }}
            data-testid={`condition-check-name-${check.id}`}
          />
        </div>

        {/* Mode Selection */}
        <div>
          <Text strong>{texts.mode}</Text>
          <Radio.Group
            value={check.mode}
            onChange={e => handleModeChange(e.target.value)}
            style={{ marginTop: '8px', display: 'block' }}
            data-testid={`condition-check-mode-${check.id}`}
          >
            <Space direction="vertical">
              <Radio value="simple">
                <span>{texts.modeSimple}</span>
                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                  {texts.modeSimpleHint}
                </Text>
              </Radio>
              <Radio value="withSubtasks">
                <span>{texts.modeWithSubtasks}</span>
                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                  {texts.modeWithSubtasksHint}
                </Text>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* JQL Fields based on mode */}
        {check.mode === 'simple' ? (
          <div>
            <Text strong>{texts.jql}</Text>
            <TextArea
              value={check.jql}
              onChange={e => handleChange('jql', e.target.value)}
              placeholder={texts.jqlPlaceholder}
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ marginTop: '4px' }}
              status={check.jql && !jqlValidation.valid ? 'error' : undefined}
              data-testid={`condition-check-jql-${check.id}`}
            />
            {check.jql && (
              <div style={{ marginTop: '4px' }}>
                {jqlValidation.valid ? (
                  <Text type="success">
                    <CheckOutlined /> {texts.jqlValid}
                  </Text>
                ) : (
                  <Text type="danger">
                    <CloseOutlined /> {texts.jqlInvalid}: {jqlValidation.error}
                  </Text>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div>
              <Text strong>{texts.issueJql}</Text>
              <TextArea
                value={check.issueJql}
                onChange={e => handleChange('issueJql', e.target.value)}
                placeholder={texts.issueJqlPlaceholder}
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginTop: '4px' }}
                status={check.issueJql && !issueJqlValidation.valid ? 'error' : undefined}
                data-testid={`condition-check-issue-jql-${check.id}`}
              />
              {check.issueJql && (
                <div style={{ marginTop: '4px' }}>
                  {issueJqlValidation.valid ? (
                    <Text type="success">
                      <CheckOutlined /> {texts.jqlValid}
                    </Text>
                  ) : (
                    <Text type="danger">
                      <CloseOutlined /> {texts.jqlInvalid}: {issueJqlValidation.error}
                    </Text>
                  )}
                </div>
              )}
            </div>

            <div>
              <Text strong>{texts.subtaskJql}</Text>
              <TextArea
                value={check.subtaskJql}
                onChange={e => handleChange('subtaskJql', e.target.value)}
                placeholder={texts.subtaskJqlPlaceholder}
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ marginTop: '4px' }}
                status={check.subtaskJql && !subtaskJqlValidation.valid ? 'error' : undefined}
                data-testid={`condition-check-subtask-jql-${check.id}`}
              />
              {check.subtaskJql && (
                <div style={{ marginTop: '4px' }}>
                  {subtaskJqlValidation.valid ? (
                    <Text type="success">
                      <CheckOutlined /> {texts.jqlValid}
                    </Text>
                  ) : (
                    <Text type="danger">
                      <CloseOutlined /> {texts.jqlInvalid}: {subtaskJqlValidation.error}
                    </Text>
                  )}
                </div>
              )}
            </div>

            {/* Subtask Sources */}
            <div>
              <Text strong>{texts.subtaskSources}</Text>
              <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                {texts.subtaskSourcesHint}
              </Text>
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Tooltip title={texts.includeDirectSubtasksHint}>
                  <div>
                    <Switch
                      size="small"
                      checked={
                        check.subtaskSources?.includeDirectSubtasks ?? DEFAULT_SUBTASK_SOURCES.includeDirectSubtasks
                      }
                      onChange={checked => {
                        const newSources: IssueConditionCheckSubtaskSources = {
                          ...DEFAULT_SUBTASK_SOURCES,
                          ...check.subtaskSources,
                          includeDirectSubtasks: checked,
                        };
                        handleChange('subtaskSources', newSources);
                      }}
                      data-testid={`condition-check-include-direct-subtasks-${check.id}`}
                    />
                    <span style={{ marginLeft: '8px' }}>{texts.includeDirectSubtasks}</span>
                  </div>
                </Tooltip>
                <Tooltip title={texts.includeEpicChildrenHint}>
                  <div>
                    <Switch
                      size="small"
                      checked={check.subtaskSources?.includeEpicChildren ?? DEFAULT_SUBTASK_SOURCES.includeEpicChildren}
                      onChange={checked => {
                        const newSources: IssueConditionCheckSubtaskSources = {
                          ...DEFAULT_SUBTASK_SOURCES,
                          ...check.subtaskSources,
                          includeEpicChildren: checked,
                        };
                        handleChange('subtaskSources', newSources);
                      }}
                      data-testid={`condition-check-include-epic-children-${check.id}`}
                    />
                    <span style={{ marginLeft: '8px' }}>{texts.includeEpicChildren}</span>
                  </div>
                </Tooltip>
                <Tooltip title={texts.includeLinkedIssuesHint}>
                  <div>
                    <Switch
                      size="small"
                      checked={check.subtaskSources?.includeLinkedIssues ?? DEFAULT_SUBTASK_SOURCES.includeLinkedIssues}
                      onChange={checked => {
                        const newSources: IssueConditionCheckSubtaskSources = {
                          ...DEFAULT_SUBTASK_SOURCES,
                          ...check.subtaskSources,
                          includeLinkedIssues: checked,
                        };
                        handleChange('subtaskSources', newSources);
                      }}
                      data-testid={`condition-check-include-linked-issues-${check.id}`}
                    />
                    <span style={{ marginLeft: '8px' }}>{texts.includeLinkedIssues}</span>
                  </div>
                </Tooltip>
              </div>
            </div>

            {/* Subtask Match Mode */}
            <div>
              <Text strong>{texts.subtaskMatchMode}</Text>
              <Radio.Group
                value={check.subtaskMatchMode || 'any'}
                onChange={e => handleChange('subtaskMatchMode', e.target.value as IssueConditionCheckSubtaskMatchMode)}
                style={{ marginTop: '8px', display: 'block' }}
                data-testid={`condition-check-subtask-match-mode-${check.id}`}
              >
                <Space direction="vertical">
                  <Radio value="any">
                    <span>{texts.subtaskMatchModeAny}</span>
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {texts.subtaskMatchModeAnyHint}
                    </Text>
                  </Radio>
                  <Radio value="all">
                    <span>{texts.subtaskMatchModeAll}</span>
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {texts.subtaskMatchModeAllHint}
                    </Text>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>
          </>
        )}

        {/* Icon, Color, and Animation selection */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Text strong>{texts.icon}</Text>
            <Select
              value={check.icon}
              onChange={value => handleChange('icon', value)}
              style={{ width: '100%', marginTop: '4px' }}
              showSearch
              optionFilterProp="label"
              data-testid={`condition-check-icon-${check.id}`}
            >
              {ICON_OPTIONS.map(icon => (
                <Select.Option key={icon} value={icon} label={ICON_CONFIG[icon].label}>
                  <span style={{ marginRight: '8px' }}>{getIconEmoji(icon)}</span>
                  {ICON_CONFIG[icon].label}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <Text strong>{texts.color}</Text>
            <div style={{ marginTop: '4px' }}>
              <ColorPicker
                value={check.color || undefined}
                onChange={(color, hex) => handleChange('color', hex)}
                allowClear
                presets={COLOR_PRESETS}
                showText
                data-testid={`condition-check-color-${check.id}`}
              />
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <Text strong>{texts.animation}</Text>
            <Text type="secondary" style={{ marginLeft: '8px', fontSize: '11px' }}>
              {texts.animationHint}
            </Text>
            <Select
              value={check.animation || 'none'}
              onChange={value => handleChange('animation', value)}
              style={{ width: '100%', marginTop: '4px' }}
              data-testid={`condition-check-animation-${check.id}`}
            >
              {ANIMATION_OPTIONS.map(animation => (
                <Select.Option key={animation} value={animation}>
                  {ANIMATION_CONFIG[animation].label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Tooltip Text */}
        <div>
          <Text strong>{texts.tooltipText}</Text>
          <TextArea
            value={check.tooltipText}
            onChange={e => handleChange('tooltipText', e.target.value)}
            placeholder={texts.tooltipPlaceholder}
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ marginTop: '4px' }}
            data-testid={`condition-check-tooltip-${check.id}`}
          />
        </div>

        {/* Preview */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Text strong>{texts.preview}:</Text>
          <IssueConditionCheckBadgePreview
            icon={check.icon}
            color={check.color}
            tooltipText={check.tooltipText || 'Hover to see tooltip'}
            animation={check.animation}
          />
          {check.name && (
            <IssueConditionCheckBadgePreview
              icon={check.icon}
              color={check.color}
              tooltipText={check.tooltipText || 'Hover to see tooltip'}
              name={check.name}
              animation={check.animation}
            />
          )}
        </div>
      </Space>
    </Card>
  );
};
