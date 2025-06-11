import React from 'react';
import { Button, Input, Checkbox, Select, ColorPicker, Alert } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';
import { useGetTextsByLocale } from 'src/shared/texts';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { throttle } from 'src/shared/utils';
import { SubTaskProgressByGroup } from '../../../SubTasksProgress/SubTaskProgressByGroup';
import { CounterComponent } from '../../../SubTasksProgress/CounterComponent';
import styles from './CustomGroupSettings.module.css';
import { CustomGroup } from './types';

const TEXTS = {
  title: {
    en: 'Custom Group',
    ru: 'Пользовательская группа',
  },
  groupName: {
    en: 'Group name',
    ru: 'Название группы',
  },
  description: {
    en: 'Description',
    ru: 'Описание',
  },
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
  showAsCounter: {
    en: 'Show as counter',
    ru: 'Показать как счетчик',
  },
  badgeOptions: {
    en: 'Badge Options',
    ru: 'Настройки бейджа',
  },
  hideIfFull: {
    en: 'Hide completed',
    ru: 'Скрыть выполненные',
  },
  badgePendingColor: {
    en: 'Badge pending color',
    ru: 'Цвет бейджа в процессе',
  },
  badgeDoneColor: {
    en: 'Badge completed color',
    ru: 'Цвет выполненного бейджа',
  },
  examples: {
    en: 'Examples',
    ru: 'Примеры',
  },
  addCustomGroup: {
    en: 'Add custom group',
    ru: 'Добавить пользовательскую группу',
  },
  removeGroup: {
    en: 'Remove group',
    ru: 'Удалить группу',
  },
  jqlInvalid: {
    en: 'Invalid JQL',
    ru: 'Некорректный JQL',
  },
};

export interface CustomGroupSettingsProps {
  groups: CustomGroup[];
  fields: {
    id: string;
    name: string;
  }[];
  onAddGroup: () => void;
  onUpdateGroup: (id: number, key: keyof CustomGroup, val: any) => void;
  onRemoveGroup: (id: number) => void;
}

export const CustomGroupSettings: React.FC<CustomGroupSettingsProps> = ({
  groups,
  fields,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
}) => {
  const texts = useGetTextsByLocale(TEXTS);

  const handleColorChange = (id: number, key: 'badgeDoneColor' | 'badgePendingColor', color: Color) => {
    onUpdateGroup(id, key, color.toHexString());
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{texts.title}</h2>
      {groups.map(group => {
        let jqlError = '';
        if (group.mode === 'jql' && group.jql) {
          try {
            parseJql(group.jql);
          } catch (e: any) {
            jqlError = `${texts.jqlInvalid}: ${e.message}`;
          }
        }

        // Local state for inputs
        const [nameValue, setNameValue] = React.useState(group.name);
        const [descriptionValue, setDescriptionValue] = React.useState(group.description);
        const [fieldValue, setFieldValue] = React.useState(group.value);
        const [jqlValue, setJqlValue] = React.useState(group.jql || '');

        // Sync local state to store value when group changes (only on group.id)
        React.useEffect(() => {
          setNameValue(group.name);
        }, [group.id]);
        React.useEffect(() => {
          setDescriptionValue(group.description);
        }, [group.id]);
        React.useEffect(() => {
          setFieldValue(group.value);
        }, [group.id]);
        React.useEffect(() => {
          setJqlValue(group.jql || '');
        }, [group.id]);

        // Throttled handlers per group/field
        const throttledUpdateName = React.useMemo(
          () => throttle((val: string) => onUpdateGroup(group.id, 'name', val), 600),
          [group.id, onUpdateGroup]
        );
        const throttledUpdateDescription = React.useMemo(
          () => throttle((val: string) => onUpdateGroup(group.id, 'description', val), 600),
          [group.id, onUpdateGroup]
        );
        const throttledUpdateValue = React.useMemo(
          () => throttle((val: string) => onUpdateGroup(group.id, 'value', val), 600),
          [group.id, onUpdateGroup]
        );
        const throttledUpdateJql = React.useMemo(
          () => throttle((val: string) => onUpdateGroup(group.id, 'jql', val), 600),
          [group.id, onUpdateGroup]
        );

        return (
          <div key={group.id} className={styles.group}>
            <div className={styles.groupHeader}>
              <Input
                placeholder={texts.groupName}
                value={nameValue}
                onChange={event => {
                  const val = event.target.value.slice(0, 15);
                  setNameValue(val);
                  throttledUpdateName(val);
                }}
                onBlur={event => onUpdateGroup(group.id, 'name', event.target.value.slice(0, 15))}
                className={styles.groupHeaderInput}
                maxLength={15}
                showCount
              />
              <Button onClick={() => onRemoveGroup(group.id)} icon={<DeleteOutlined />} danger>
                {texts.removeGroup}
              </Button>
            </div>

            <Input
              placeholder={texts.description}
              value={descriptionValue}
              onChange={event => {
                setDescriptionValue(event.target.value);
                throttledUpdateDescription(event.target.value);
              }}
              onBlur={event => onUpdateGroup(group.id, 'description', event.target.value)}
            />

            <div className={styles.groupOptions}>
              <Select
                value={group.mode}
                onChange={val => onUpdateGroup(group.id, 'mode', val)}
                options={[
                  { value: 'field', label: texts.modeField },
                  { value: 'jql', label: texts.modeJql },
                ]}
                style={{ width: '100%' }}
              />

              {group.mode === 'field' ? (
                <>
                  <Select
                    value={group.fieldId || undefined}
                    onChange={val => onUpdateGroup(group.id, 'fieldId', val)}
                    style={{ minWidth: 150 }}
                    placeholder={texts.selectField}
                    filterOption={(input, option) => {
                      const label = option?.label;
                      return label ? label.toLowerCase().indexOf(input.toLowerCase()) >= 0 : false;
                    }}
                    showSearch
                    options={fields.map(field => ({ value: field.id, label: field.name }))}
                  />
                  <Input
                    placeholder={texts.fieldValue}
                    value={fieldValue}
                    onChange={event => {
                      setFieldValue(event.target.value);
                      throttledUpdateValue(event.target.value);
                    }}
                    onBlur={event => onUpdateGroup(group.id, 'value', event.target.value)}
                    style={{ width: 150 }}
                  />
                </>
              ) : (
                <div style={{ display: 'flex', gap: 12, width: '100%', flexDirection: 'column' }}>
                  <Input
                    placeholder={texts.jql}
                    value={jqlValue}
                    onChange={event => {
                      setJqlValue(event.target.value);
                      throttledUpdateJql(event.target.value);
                    }}
                    style={{ width: '100%', borderColor: jqlError ? '#ff4d4f' : undefined, minWidth: 400 }}
                    suffix={
                      <ExclamationCircleOutlined style={{ color: '#ff4d4f', display: jqlError ? 'block' : 'none' }} />
                    }
                  />
                  {jqlError && (
                    <Alert type="error" message={jqlError} showIcon style={{ marginTop: 6, marginBottom: 0 }} />
                  )}
                </div>
              )}
            </div>
            <div className={styles.groupOptions}>
              <Checkbox
                checked={group.hideCompleted}
                onChange={e => onUpdateGroup(group.id, 'hideCompleted', e.target.checked)}
              >
                {texts.hideIfFull}
              </Checkbox>
              <Checkbox
                checked={group.showAsCounter}
                onChange={e => onUpdateGroup(group.id, 'showAsCounter', e.target.checked)}
              >
                {texts.showAsCounter}
              </Checkbox>
            </div>

            {group.showAsCounter && (
              <div className={styles.badgeOptions}>
                <div className={styles.badgeOptionsTitle}>{texts.badgeOptions}</div>
                <div className={styles.badgeOptionsContent}>
                  <div className={styles.colorPicker}>
                    <span className={styles.colorPickerLabel}>{texts.badgePendingColor}</span>
                    <ColorPicker
                      value={group.badgePendingColor}
                      onChange={color => handleColorChange(group.id, 'badgePendingColor', color)}
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
                      value={group.badgeDoneColor}
                      onChange={color => handleColorChange(group.id, 'badgeDoneColor', color)}
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
                </div>
              </div>
            )}

            <div className={styles.examples}>
              <h4 className={styles.examplesTitle}>{texts.examples}</h4>
              <div className={styles.examplesContent}>
                {group.showAsCounter ? (
                  <>
                    <CounterComponent
                      groupName={group.name || 'Group'}
                      progress={{ todo: 5, inProgress: 3, done: 15, blocked: 0 }}
                      comments={[]}
                      pendingColor={group.badgePendingColor}
                      doneColor={group.badgeDoneColor}
                    />
                    <CounterComponent
                      groupName={group.name || 'Group'}
                      progress={{ todo: 2, inProgress: 1, done: 8, blocked: 0 }}
                      comments={[]}
                      pendingColor={group.badgePendingColor}
                      doneColor={group.badgeDoneColor}
                    />
                    {!group.hideCompleted ? (
                      <CounterComponent
                        groupName={group.name || 'Group'}
                        progress={{ todo: 0, inProgress: 0, done: 5, blocked: 0 }}
                        comments={[]}
                        pendingColor={group.badgePendingColor}
                        doneColor={group.badgeDoneColor}
                      />
                    ) : null}
                  </>
                ) : (
                  <>
                    <div>
                      <SubTaskProgressByGroup
                        groupName={group.name || 'Group'}
                        progress={{ todo: 5, inProgress: 3, done: 15, blocked: 0 }}
                      />
                    </div>
                    <div>
                      <SubTaskProgressByGroup
                        groupName={group.name || 'Group'}
                        progress={{ todo: 2, inProgress: 1, done: 8, blocked: 0 }}
                      />
                    </div>
                    {!group.hideCompleted ? (
                      <div>
                        <SubTaskProgressByGroup
                          groupName={group.name || 'Group'}
                          progress={{ todo: 0, inProgress: 0, done: 5, blocked: 0 }}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <Button onClick={onAddGroup}>{texts.addCustomGroup}</Button>
    </div>
  );
};
