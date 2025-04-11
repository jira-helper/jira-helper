import React from 'react';
import Checkbox from 'antd/es/checkbox';
import { Card, Tooltip } from 'antd';
import { useGetSettings } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/hooks/useGetSettings';
import { InfoCircleFilled } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { changeCount } from './actions/changeCount';

const TEXTS = {
  epic: {
    en: 'Epic',
    ru: 'Эпик',
  },
  countEpicIssues: {
    en: 'Count issues of epic',
    ru: 'Учитывать задачи эпика',
  },
  countEpicLinkedIssues: {
    en: 'Count linked issues of epic',
    ru: 'Учитывать связанные задачи эпика',
  },
  countEpicExternalLinks: {
    en: 'Count external links of epic',
    ru: 'Учитывать внешние ссылки эпика',
  },
  issues: {
    en: 'Issues',
    ru: 'Задачи',
  },
  countIssuesSubtasks: {
    en: 'Count sub-tasks',
    ru: 'Учитывать подзадачи',
  },
  countIssuesLinkedIssues: {
    en: 'Count linked issues',
    ru: 'Учитывать связанные задачи',
  },
  countIssuesExternalLinks: {
    en: 'Count external links',
    ru: 'Учитывать внешние ссылки',
  },
  subTasks: {
    en: 'SubTasks',
    ru: 'Под-задачи',
  },
  countSubtasksLinkedIssues: {
    ru: 'Учитывать связанные задачи',
    en: 'Count linked issues',
  },
  countSubtasksExternalLinks: {
    ru: 'Учитывать внешние ссылки',
    en: 'Count external links',
  },
  countingSettingsTitle: {
    ru: 'Настройки подсчета прогресса',
    en: 'Counting settings',
  },
  countingSettingsTooltip: {
    en: 'For different types of issues (epics, issues, subtasks) you can configure different counting progress. Progress can be counted by issues in epic (only for epics), by linked issues, by issues linked as external links (to another Jira instance). Choose the options you are interested in. External issues create additional load on the Jira instance and the analysis of their progress is very limited',
    ru: 'Для разных типов задач (Эпики, Задачи, Подзадачи) можно настроить разный подсчет прогресса. Прогресс можно считать по задачам в эпике (только для эпиков), по связанным задачам, по задачам связанным как внешние ссылки (на другой инстанс Jira). Выберите интересные вам варианты. Внешние задачи создают дополнительную нагрузку на инстанс jira, а также данные по ним ограничены и не все фичи будут доступны',
  },
  externalIssuesTooltip: {
    ru: 'Внешние задачи создают дополнительную нагрузку на инстанс jira, а также данные по ним ограничены и не все фичи будут доступны',
    en: 'External issues create additional load on the Jira instance and the analysis of their progress is very limited',
  },
};
export const CountSettings = () => {
  const { settings } = useGetSettings();
  const texts = useGetTextsByLocale(TEXTS);
  return (
    <Card
      title=<div>
        {texts.countingSettingsTitle}
        <Tooltip
          overlayStyle={{
            // 250 - is default and its small
            maxWidth: 600,
          }}
          title={<p>{texts.countingSettingsTooltip}</p>}
        >
          <span>
            <InfoCircleFilled style={{ color: '#1677ff' }} />
          </span>
        </Tooltip>
      </div>
      style={{ marginBottom: '16px' }}
      type="inner"
    >
      <div style={{ marginBottom: '16px' }}>
        <div>{texts.epic}</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countEpicIssues}
            onChange={() => {
              changeCount('countEpicIssues', !settings.countEpicIssues);
            }}
          >
            {texts.countEpicIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countEpicLinkedIssues}
            onChange={() => {
              changeCount('countEpicLinkedIssues', !settings.countEpicLinkedIssues);
            }}
          >
            {texts.countEpicLinkedIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countEpicExternalLinks}
            onChange={() => {
              changeCount('countEpicExternalLinks', !settings.countEpicExternalLinks);
            }}
          >
            {texts.countEpicExternalLinks}{' '}
            <Tooltip overlayStyle={{ maxWidth: 600 }} title={<p>{texts.externalIssuesTooltip}</p>}>
              <span>
                <InfoCircleFilled style={{ color: '#1677ff' }} />
              </span>
            </Tooltip>
          </Checkbox>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div> {texts.issues}</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countIssuesSubtasks}
            onChange={() => {
              changeCount('countIssuesSubtasks', !settings.countIssuesSubtasks);
            }}
          >
            {texts.countIssuesSubtasks}
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesLinkedIssues}
            onChange={() => {
              changeCount('countIssuesLinkedIssues', !settings.countIssuesLinkedIssues);
            }}
          >
            {texts.countIssuesLinkedIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesExternalLinks}
            onChange={() => {
              changeCount('countIssuesExternalLinks', !settings.countIssuesExternalLinks);
            }}
          >
            {texts.countIssuesExternalLinks}{' '}
            <Tooltip overlayStyle={{ maxWidth: 600 }} title={<p>{texts.externalIssuesTooltip}</p>}>
              <span>
                <InfoCircleFilled style={{ color: '#1677ff' }} />
              </span>
            </Tooltip>
          </Checkbox>
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <div> {texts.subTasks}</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countSubtasksLinkedIssues}
            onChange={() => {
              changeCount('countSubtasksLinkedIssues', !settings.countSubtasksLinkedIssues);
            }}
          >
            {texts.countSubtasksLinkedIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countSubtasksExternalLinks}
            onChange={() => {
              changeCount('countSubtasksExternalLinks', !settings.countSubtasksExternalLinks);
            }}
          >
            {texts.countSubtasksExternalLinks}{' '}
            <Tooltip overlayStyle={{ maxWidth: 600 }} title={<p>{texts.externalIssuesTooltip}</p>}>
              <span>
                <InfoCircleFilled style={{ color: '#1677ff' }} />
              </span>
            </Tooltip>
          </Checkbox>
        </div>
      </div>
    </Card>
  );
};
