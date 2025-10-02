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
import { setGroupByFieldShowOnlyIncomplete } from './actions/setGroupByFieldShowOnlyIncomplete';

import styles from './GroupingSettings.module.css';
import { setGroupByFieldPendingColor } from './actions/setGroupByFieldPendingColor';
import { setGroupByFieldDoneColor } from './actions/setGroupByFieldDoneColor';
import { setEnableAllTasksTracking } from './actions/setEnableAllTasksTracking';
import { SubTaskProgressByGroup } from '../../SubTasksProgress/SubTaskProgressByGroup';
import { CounterComponent } from '../../SubTasksProgress/CounterComponent';

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
  enableAllTasksTracking: {
    en: 'Track all tasks',
    ru: 'Отслеживать все задачи',
  },
  enableGroupByField: {
    en: 'Enable grouping by field',
    ru: 'Включить группировку по полю',
  },
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
  examples: {
    en: 'Examples',
    ru: 'Примеры',
  },
  enabled: {
    en: 'Enabled',
    ru: 'Включено',
  },
  showGroupsByFieldAsCounters: {
    en: 'Show progress as counters',
    ru: 'Показывать прогресс в виде счетчиков',
  },
  groupByFieldHideIfCompleted: {
    en: 'Hide progress if all tasks are completed',
    ru: 'Скрывать прогресс если все задачи в выполнены',
  },
  groupByFieldShowOnlyIncomplete: {
    en: 'Show only incomplete tasks',
    ru: 'Показывать только незавершенные задачи',
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
    <div>
      {/* Панель 1: Трекинг прогресса всех задач */}
      <Card title="Task Progress Tracking" style={{ marginBottom: '16px' }} type="inner">
        <div style={{ marginBottom: '24px' }}>
          <h2 className={styles.title}>All Tasks Progress</h2>
          <Checkbox
            checked={settings.enableAllTasksTracking}
            onChange={() => setEnableAllTasksTracking(!settings.enableAllTasksTracking)}
          >
            {texts.enableAllTasksTracking}
          </Checkbox>

          {settings.enableAllTasksTracking && (
            <>
              {/* Настройки отображения */}
              <div style={{ marginTop: '16px' }}>
                <Checkbox
                  checked={settings.groupByFieldHideIfCompleted}
                  onChange={() => setGroupByFieldHideIfCompleted(!settings.groupByFieldHideIfCompleted)}
                  style={{ marginTop: '12px' }}
                >
                  {texts.groupByFieldHideIfCompleted}
                </Checkbox>
                <Checkbox
                  checked={settings.showGroupsByFieldAsCounters}
                  onChange={() => showGroupsByFieldAsBadges(!settings.showGroupsByFieldAsCounters)}
                  style={{ marginTop: '12px' }}
                >
                  {texts.showGroupsByFieldAsCounters}
                </Checkbox>

                {settings.showGroupsByFieldAsCounters && (
                  <Checkbox
                    checked={settings.groupByFieldShowOnlyIncomplete}
                    onChange={() => setGroupByFieldShowOnlyIncomplete(!settings.groupByFieldShowOnlyIncomplete)}
                    style={{ marginTop: '12px' }}
                  >
                    {texts.groupByFieldShowOnlyIncomplete}
                  </Checkbox>
                )}

                {settings.showGroupsByFieldAsCounters ? (
                  <>
                    <div className={styles.colorPicker} style={{ marginTop: '16px' }}>
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
              </div>

              {/* Демо */}
              <div className={styles.examples}>
                <h4 className={styles.examplesTitle}>{texts.examples}</h4>
                <div className={styles.examplesContent}>
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {settings.showGroupsByFieldAsCounters ? (
                    settings.enableGroupByField ? (
                      <>
                        <CounterComponent
                          groupName="Group 1"
                          progress={{ todo: 5, inProgress: 3, done: 15, blocked: 0 }}
                          comments={[]}
                          pendingColor={settings.groupByFieldPendingColor}
                          doneColor={settings.groupByFieldDoneColor}
                          showOnlyIncomplete={settings.groupByFieldShowOnlyIncomplete}
                        />
                        <CounterComponent
                          groupName="Group 2"
                          progress={{ todo: 2, inProgress: 1, done: 8, blocked: 0 }}
                          comments={[]}
                          pendingColor={settings.groupByFieldPendingColor}
                          doneColor={settings.groupByFieldDoneColor}
                          showOnlyIncomplete={settings.groupByFieldShowOnlyIncomplete}
                        />
                        {!settings.groupByFieldHideIfCompleted ? (
                          <CounterComponent
                            groupName="Group 3"
                            progress={{ todo: 0, inProgress: 0, done: 5, blocked: 0 }}
                            comments={[]}
                            pendingColor={settings.groupByFieldPendingColor}
                            doneColor={settings.groupByFieldDoneColor}
                            showOnlyIncomplete={settings.groupByFieldShowOnlyIncomplete}
                          />
                        ) : null}
                      </>
                    ) : (
                      <CounterComponent
                        groupName="Tasks"
                        progress={{ todo: 7, inProgress: 4, done: 23, blocked: 0 }}
                        comments={[]}
                        pendingColor={settings.groupByFieldPendingColor}
                        doneColor={settings.groupByFieldDoneColor}
                        showOnlyIncomplete={settings.groupByFieldShowOnlyIncomplete}
                      />
                    )
                  ) : settings.enableGroupByField ? (
                    <>
                      <div>
                        <SubTaskProgressByGroup
                          groupName="Group 1"
                          progress={{ todo: 5, inProgress: 3, done: 15, blocked: 0 }}
                        />
                      </div>
                      <div>
                        <SubTaskProgressByGroup
                          groupName="Group 2"
                          progress={{ todo: 2, inProgress: 1, done: 8, blocked: 0 }}
                        />
                      </div>
                      {!settings.groupByFieldHideIfCompleted ? (
                        <div>
                          <SubTaskProgressByGroup
                            groupName="Group 3"
                            progress={{ todo: 0, inProgress: 0, done: 5, blocked: 0 }}
                          />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div>
                      <SubTaskProgressByGroup
                        groupName="Tasks"
                        progress={{ todo: 7, inProgress: 4, done: 23, blocked: 0 }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Настройки группировки */}
              <div
                style={{
                  marginLeft: '24px',
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                }}
              >
                <h3 style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}>Grouping Settings</h3>

                <Checkbox
                  checked={settings.enableGroupByField}
                  onChange={() => enableGroupingByField(!settings.enableGroupByField)}
                >
                  {texts.enableGroupByField}
                </Checkbox>

                {settings.enableGroupByField && (
                  <>
                    <p style={{ marginBottom: '16px', marginTop: '16px' }}>
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

                    {ignoredGroups.length > 0 ? (
                      <div style={{ marginTop: '16px' }}>
                        <p style={{ marginBottom: '16px' }}>{texts.ignoredGroups}</p>
                        {ignoredGroups.map(group => (
                          <Tag key={group} color="blue" closable closeIcon onClose={() => removeIgnoredGroup(group)}>
                            {group}
                          </Tag>
                        ))}
                      </div>
                    ) : null}
                    {groupsAvailableToIgnore.length > 0 ? (
                      <div style={{ marginTop: '16px' }}>
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
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Панель 2: Трекинг кастомных групп */}
      <Card title="Custom Groups Tracking" style={{ marginBottom: '16px' }} type="inner">
        <CustomGroupSettingsContainer />
      </Card>
    </div>
  );
};
