import React, { useMemo } from 'react';
import { Card, Checkbox, ColorPicker, Select, Tag, Tooltip } from 'antd';
import { useShallow } from 'zustand/react/shallow';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { useGetSettings } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/hooks/useGetSettings';
import { useGetTextsByLocale } from 'src/shared/texts';
import { InfoCircleFilled } from '@ant-design/icons';
import { GroupFields } from '../../types';
import { setGroupingField } from './actions/setGroupingField';
import { removeIgnoredGroup } from './actions/removeIgnoredGroup';
import { addIgnoredGroup } from './actions/addIgnoredGroup';
import { CustomGroupSettingsContainer } from './CustomGroups/CustomGroupSettingsContainer';
import { enableGroupingByField } from './actions/enableGroupingByField';
import { showGroupsByFieldAsBadges } from './actions/showGroupsByFieldAsBadges';
import { setGroupByFieldHideIfCompleted } from './actions/setGroupByFieldHideIfCompleted';
import styles from './GroupingSettings.module.css';
import { setGroupByFieldPendingColor } from './actions/setGroupByFieldPendingColor';
import { setGroupByFieldDoneColor } from './actions/setGroupByFieldDoneColor';

const groupingFields: GroupFields[] = ['project', 'assignee', 'reporter', 'priority', 'creator', 'issueType'];

const useGetAllSubtasks = () => {
  const { data } = useJiraSubtasksStore(
    useShallow(state => {
      return { data: state.data };
    })
  );
  const loading = Object.values(data).some(item => item?.state === 'loading');
  const issues = Object.values(data).flatMap(item => [...(item?.subtasks || []), ...(item?.externalLinks || [])]);
  return { issues, loading };
};

const useGetAvailableGroups = (groupingField: GroupFields) => {
  const { issues } = useGetAllSubtasks();

  const availableGroups = useMemo(() => {
    const uniqueGroups = new Set<string>();
    issues.forEach(issue => {
      const value = issue[groupingField];
      uniqueGroups.add(value);
    });
    return Array.from(uniqueGroups);
  }, [issues, groupingField]);
  return availableGroups;
};

const TEXTS = {
  groupingField: {
    en: 'Group by',
    ru: 'Группировать по',
  },
  ignoredGroups: {
    en: 'Ignored groups',
    ru: 'Игнорируемые группы',
  },
  selectGroupingField: {
    en: 'Select grouping field',
    ru: 'Выберите поле группировки',
  },
  addGroupToIgnore: {
    en: 'Add group to ignore',
    ru: 'Добавить группу для игнорирования',
  },
  selectGroupingFieldTooltip: {
    ru: 'Выберите поле, по которому будет производиться прогресса под-задач для карточки на доске. Не применяется для внешних ссылок',
    en: 'Select the field by which the progress of sub-tasks for the card on the board will be calculated. Not applied to external links',
  },
  groupingSettingsTitle: {
    en: 'Grouping Settings',
    ru: 'Настройки группировки',
  },
  groupingByFieldTitle: {
    en: 'Grouping by field',
    ru: 'Группировка по полю',
  },
  chooseGroupToIgnore: {
    en: 'Choose group to ignore',
    ru: 'Выберите группу для игнорирования',
  },
  enabled: {
    en: 'Enabled',
    ru: 'Включено',
  },
  showGroupsByFieldAsCounters: {
    en: 'Show groups by field as counters',
    ru: 'Показывать группы по полю в виде счетчиков',
  },
  groupByFieldHideIfCompleted: {
    en: 'Hide group if all tasks are completed',
    ru: 'Скрывать группу если все задачи в ней выполнены',
  },
  badgePendingColor: {
    en: 'Badge pending color',
    ru: 'Цвет бейджа в процессе',
  },
  badgeDoneColor: {
    en: 'Badge completed color',
    ru: 'Цвет выполненного бейджа',
  },
};

export const GroupingSettings = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { settings } = useGetSettings();
  const availableGroups = useGetAvailableGroups(settings.groupingField);
  const ignoredGroups = settings.ignoredGroups || [];
  const groupsAvailableToIgnore = availableGroups.filter(group => !ignoredGroups.includes(group));

  return (
    <Card title={texts.groupingSettingsTitle} style={{ marginBottom: '16px' }} type="inner">
      <div style={{ marginBottom: '24px' }}>
        <h2 className={styles.title}>{texts.groupingByFieldTitle}</h2>
        <Checkbox
          checked={settings.enableGroupByField}
          onChange={() => enableGroupingByField(!settings.enableGroupByField)}
        >
          {texts.enabled}
        </Checkbox>
        <Checkbox
          checked={settings.groupByFieldHideIfCompleted}
          onChange={() => setGroupByFieldHideIfCompleted(!settings.groupByFieldHideIfCompleted)}
        >
          {texts.groupByFieldHideIfCompleted}
        </Checkbox>
        <Checkbox
          checked={settings.showGroupsByFieldAsCounters}
          onChange={() => showGroupsByFieldAsBadges(!settings.showGroupsByFieldAsCounters)}
        >
          {texts.showGroupsByFieldAsCounters}
        </Checkbox>

        {settings.showGroupsByFieldAsCounters ? (
          <>
            <div className={styles.colorPicker}>
              <span className={styles.colorPickerLabel}>{texts.badgePendingColor}</span>
              <ColorPicker
                value={settings.groupByFieldPendingColor}
                onChange={color => setGroupByFieldPendingColor(color.toRgbString())}
                showText
                presets={[
                  {
                    label: 'Recommended',
                    colors: [
                      '#3b82f6', // blue
                      '#ef4444', // red
                      '#f59e0b', // amber
                      '#10b981', // emerald
                      '#6366f1', // indigo
                    ],
                  },
                ]}
              />
            </div>

            <div className={styles.colorPicker}>
              <span className={styles.colorPickerLabel}>{texts.badgeDoneColor}</span>
              <ColorPicker
                value={settings.groupByFieldDoneColor}
                onChange={color => setGroupByFieldDoneColor(color.toRgbString())}
                showText
                presets={[
                  {
                    label: 'Recommended',
                    colors: [
                      '#22c55e', // green
                      '#10b981', // emerald
                      '#059669', // green-600
                      '#047857', // green-700
                      '#065f46', // green-800
                    ],
                  },
                ]}
              />
            </div>
          </>
        ) : null}

        <p style={{ marginBottom: '16px' }}>
          {texts.selectGroupingField}{' '}
          <Tooltip overlayStyle={{ maxWidth: 600 }} title={<p>{texts.selectGroupingFieldTooltip}</p>}>
            <span>
              <InfoCircleFilled style={{ color: '#1677ff' }} />
            </span>
          </Tooltip>
        </p>
        <Select
          style={{ minWidth: 140 }}
          value={settings?.groupingField || 'project'}
          onChange={setGroupingField}
          disabled={!settings.enabled}
          options={groupingFields.map(field => ({
            value: field,
            label: <span data-testid="grouping-field-option">{field}</span>,
          }))}
        />
      </div>
      {ignoredGroups.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ marginBottom: '16px' }}>{texts.ignoredGroups}</p>
          {ignoredGroups.map(group => (
            <Tag key={group} color="blue" closable closeIcon onClose={() => removeIgnoredGroup(group)}>
              {group}
            </Tag>
          ))}
        </div>
      ) : null}
      {groupsAvailableToIgnore.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ marginBottom: '16px' }}>{texts.addGroupToIgnore}</p>
          <Select
            style={{ minWidth: 140 }}
            placeholder={texts.chooseGroupToIgnore}
            onChange={addIgnoredGroup}
            disabled={!settings.enabled}
            options={groupsAvailableToIgnore.map(group => ({
              value: group,
              label: <span data-testid="ignored-group-option">{group}</span>,
            }))}
          />
        </div>
      ) : null}
      <CustomGroupSettingsContainer />
    </Card>
  );
};
