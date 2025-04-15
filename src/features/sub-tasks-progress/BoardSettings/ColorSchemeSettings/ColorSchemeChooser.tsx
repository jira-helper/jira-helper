import React from 'react';
import { Card, Checkbox, Select } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetSettings } from '../../SubTaskProgressSettings/hooks/useGetSettings';
import { availableColorSchemas, jiraColorScheme, yellowGreenColorScheme } from '../../colorSchemas';
import { SubTasksProgressComponent } from '../../SubTasksProgress/SubTasksProgressComponent';
import { subTasksProgress } from '../../SubTasksProgress/testData';
import { setSelectedColorScheme } from './actions/setSelectedColorScheme';
import { setUseCustomColorScheme } from './actions/setUseCustomColorScheme';
import { toggleFlagsAsBlocked } from './actions/toggleFlagsAsBlocked';
import { toggleBlockedByLinksAsBlocked } from './actions/toggleBlockedByLinksAsBlocked';
import { StatusCategorySettings } from './StatusCategorySettings';
import { SubTasksSettings } from './SubTasksSettings';

const TEXTS = {
  colorSchemeTitle: {
    en: 'Color Scheme',
    ru: 'Цветовая схема',
  },
  useCustomColorScheme: {
    en: 'Use custom color scheme',
    ru: 'Использовать пользовательскую цветовую схему',
  },
  flagsAsBlocked: {
    en: 'Flags as blocked',
    ru: 'Считать флаг на задаче как блокировку',
  },
  blockedByLinksAsBlocked: {
    en: 'Blocked by links as blocked',
    ru: 'Считать связь Blocked By как блокировку',
  },
};
export const ColorSchemeChooser = () => {
  const { settings } = useGetSettings();
  const selectedColorScheme = settings?.selectedColorScheme ?? availableColorSchemas[0];
  const texts = useGetTextsByLocale(TEXTS);
  return (
    <Card title={texts.colorSchemeTitle} style={{ marginBottom: '16px' }} type="inner">
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Checkbox
          checked={settings.useCustomColorScheme}
          disabled={!settings.enabled}
          onChange={() => {
            setUseCustomColorScheme(!settings.useCustomColorScheme);
          }}
        >
          {texts.useCustomColorScheme}
        </Checkbox>
        <Checkbox
          checked={settings.flagsAsBlocked}
          disabled={!settings.enabled}
          onChange={() => {
            toggleFlagsAsBlocked();
          }}
        >
          {texts.flagsAsBlocked}
        </Checkbox>
        <Checkbox
          checked={settings.blockedByLinksAsBlocked}
          disabled={!settings.enabled}
          onChange={() => {
            toggleBlockedByLinksAsBlocked();
          }}
        >
          {texts.blockedByLinksAsBlocked}
        </Checkbox>
      </div>
      <StatusCategorySettings />
      {settings.useCustomColorScheme ? (
        <>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ marginBottom: '8px' }}>Select color scheme:</p>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
              <Select
                data-testid="color-scheme-chooser"
                disabled={!settings.enabled}
                value={selectedColorScheme}
                onChange={setSelectedColorScheme}
                style={{ minWidth: 140 }} // Set min width to accommodate "yellowGreen"
                options={availableColorSchemas.map(schema => ({
                  value: schema,
                  label: <span data-testid="color-scheme-chooser-option">{schema}</span>,
                }))}
              />
              <span style={{ minWidth: 200 }}>
                Example:
                <SubTasksProgressComponent
                  progress={subTasksProgress.smallMixed}
                  colorScheme={selectedColorScheme === 'jira' ? jiraColorScheme : yellowGreenColorScheme}
                />
              </span>
            </div>
          </div>

          <SubTasksSettings />
        </>
      ) : null}
    </Card>
  );
};
