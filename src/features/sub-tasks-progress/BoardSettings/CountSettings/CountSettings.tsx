import React from 'react';
import Checkbox from 'antd/es/checkbox';
import { Card, Tooltip } from 'antd';
import { useGetSettings } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/hooks/useGetSettings';
import { InfoCircleFilled } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetIssueLinkTypes } from 'src/shared/jira/stores/useGetIssueLinkTypes';
import { useSubTaskProgressBoardPropertyStore } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/stores/subTaskProgressBoardProperty';
import { changeCount, setIssueLinkTypesToCount, clearIssueLinkTypesToCount } from './actions/changeCount';

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
    en: 'Count epic linked issues',
    ru: 'Учитывать связанные с эпиками задачи',
  },
  countEpicExternalLinks: {
    en: 'Count epic external links',
    ru: 'Учитывать внешние ссылки эпиков',
  },
  issues: {
    en: 'Issues',
    ru: 'Задачи',
  },
  countIssuesSubtasks: {
    en: 'Count issues subtasks',
    ru: 'Учитывать подзадачи',
  },
  countIssuesLinkedIssues: {
    en: 'Count issues linked issues',
    ru: 'Учитывать связанные задачи',
  },
  countIssuesExternalLinks: {
    en: 'Count issues external links',
    ru: 'Учитывать внешние ссылки задач',
  },
  subTasks: {
    en: 'SubTasks',
    ru: 'Под-задачи',
  },
  countSubtasksLinkedIssues: {
    en: 'Count subtasks linked issues',
    ru: 'Учитывать связанные с подзадачами задачи',
  },
  countSubtasksExternalLinks: {
    en: 'Count subtasks external links',
    ru: 'Учитывать внешние ссылки подзадач',
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
  issueLinkTypesToCountTitle: {
    en: 'Issue link types to count',
    ru: 'Типы ссылок задач для подсчета',
  },
  countAllIssueLinks: {
    en: 'Count all issue links',
    ru: 'Учитывать все ссылки задач',
  },
  loadingLinkTypes: {
    en: 'Loading link types...',
    ru: 'Загрузка типов ссылок...',
  },
  failedToLoadLinkTypes: {
    en: 'Failed to load link types',
    ru: 'Не удалось загрузить типы ссылок',
  },
};
export const CountSettings = () => {
  const { settings } = useGetSettings();
  const texts = useGetTextsByLocale(TEXTS);
  const { linkTypes, isLoading: isLoadingLinkTypes, error: linkTypesError } = useGetIssueLinkTypes();
  const { data } = useSubTaskProgressBoardPropertyStore();

  const showLinkTypeSection = settings.countEpicLinkedIssues || settings.countIssuesLinkedIssues;

  // Local state only for toggling between 'count all' and granular selection UI
  const [showGranular, setShowGranular] = React.useState(false);

  // Use store state for selected link types
  const selectedLinkTypes = data.issueLinkTypesToCount || [];
  const countAllIssueLinks = selectedLinkTypes.length === 0 && !showGranular;

  const handleLinkTypeChange = (id: string, direction: 'inward' | 'outward', checked: boolean) => {
    let newSelections = [...selectedLinkTypes];
    if (checked) {
      newSelections.push({ id, direction });
    } else {
      newSelections = newSelections.filter(sel => !(sel.id === id && sel.direction === direction));
    }
    setIssueLinkTypesToCount(newSelections);
  };

  const handleCountAllChange = (checked: boolean) => {
    if (checked) {
      setShowGranular(false);
      clearIssueLinkTypesToCount();
    } else {
      setShowGranular(true);
    }
  };

  return (
    <Card
      title={
        <div>
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
      }
      style={{ marginBottom: '16px' }}
      type="inner"
      data-testid="count-settings-card"
    >
      <div style={{ marginBottom: '16px' }}>
        <div>{texts.epic}</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countEpicIssues}
            disabled={!settings.enabled}
            onChange={() => {
              changeCount('countEpicIssues', !settings.countEpicIssues);
            }}
          >
            {texts.countEpicIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countEpicLinkedIssues}
            disabled={!settings.enabled}
            onChange={() => {
              changeCount('countEpicLinkedIssues', !settings.countEpicLinkedIssues);
            }}
          >
            {texts.countEpicLinkedIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countEpicExternalLinks}
            disabled={!settings.enabled}
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
            disabled={!settings.enabled}
            onChange={() => {
              changeCount('countIssuesSubtasks', !settings.countIssuesSubtasks);
            }}
          >
            {texts.countIssuesSubtasks}
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesLinkedIssues}
            disabled={!settings.enabled}
            onChange={() => {
              changeCount('countIssuesLinkedIssues', !settings.countIssuesLinkedIssues);
            }}
          >
            {texts.countIssuesLinkedIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesExternalLinks}
            disabled={!settings.enabled}
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
            disabled={!settings.enabled}
            onChange={() => {
              changeCount('countSubtasksLinkedIssues', !settings.countSubtasksLinkedIssues);
            }}
          >
            {texts.countSubtasksLinkedIssues}
          </Checkbox>
          <Checkbox
            checked={settings.countSubtasksExternalLinks}
            disabled={!settings.enabled}
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
      {showLinkTypeSection && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{texts.issueLinkTypesToCountTitle}</div>
          <div
            style={{
              background: '#fafbfc',
              border: '1px solid #e4e7ed',
              borderRadius: 8,
              padding: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              marginBottom: 8,
            }}
          >
            <Checkbox
              checked={countAllIssueLinks}
              onChange={e => handleCountAllChange(e.target.checked)}
              style={{ fontWeight: 500, marginBottom: 12 }}
            >
              {texts.countAllIssueLinks}
            </Checkbox>
            {(selectedLinkTypes.length > 0 || showGranular) && !isLoadingLinkTypes && linkTypes.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 16,
                  marginTop: 8,
                }}
              >
                {linkTypes.map(linkType => (
                  <div
                    key={linkType.id}
                    style={{
                      border: '1px solid #e4e7ed',
                      borderRadius: 6,
                      padding: 12,
                      background: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{linkType.name}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Checkbox
                        checked={selectedLinkTypes.some(sel => sel.id === linkType.id && sel.direction === 'inward')}
                        onChange={e => handleLinkTypeChange(linkType.id, 'inward', e.target.checked)}
                        style={{ marginLeft: 2 }}
                      >
                        {linkType.inward}
                      </Checkbox>
                      <Checkbox
                        checked={selectedLinkTypes.some(sel => sel.id === linkType.id && sel.direction === 'outward')}
                        onChange={e => handleLinkTypeChange(linkType.id, 'outward', e.target.checked)}
                        style={{ marginLeft: 2 }}
                      >
                        {linkType.outward}
                      </Checkbox>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {(selectedLinkTypes.length > 0 || showGranular) && isLoadingLinkTypes && (
              <div style={{ marginTop: 8 }}>{texts.loadingLinkTypes}</div>
            )}
            {(selectedLinkTypes.length > 0 || showGranular) && linkTypesError && (
              <div style={{ marginTop: 8, color: 'red' }}>{texts.failedToLoadLinkTypes}</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
