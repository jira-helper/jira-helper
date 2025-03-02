import React from 'react';
import { Card, Checkbox, Select } from 'antd';
import { useGetSettings } from '../../hooks/useGetSettings';
import { availableColorSchemas, jiraColorScheme, yellowGreenColorScheme } from '../../colorSchemas';
import { SubTasksProgressComponent } from '../../components/SubTasksProgress/SubTasksProgressComponent';
import { subTasksProgress } from '../../components/SubTasksProgress/testData';
import { setSelectedColorScheme } from './actions/setSelectedColorScheme';
import { changeUseCustomColorScheme } from './actions/changeUseCustomColorScheme';
import { toggleFlagsAsBlocked } from './actions/toggleFlagsAsBlocked';
import { toggleBlockedByLinksAsBlocked } from './actions/toggleBlockedByLinksAsBlocked';
import { StatusCategorySettings } from './StatusCategorySettings';
import { SubTasksSettings } from './SubTasksSettings';

export const ColorSchemeChooser = () => {
  const { settings } = useGetSettings();
  const selectedColorScheme = settings?.selectedColorScheme ?? availableColorSchemas[0];

  return (
    <Card title="Color Scheme" style={{ marginBottom: '16px' }} type="inner">
      <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Checkbox
          checked={settings.useCustomColorScheme}
          onChange={() => {
            changeUseCustomColorScheme(!settings.useCustomColorScheme);
          }}
        >
          Use custom color scheme
        </Checkbox>
        <Checkbox
          checked={settings.flagsAsBlocked}
          onChange={() => {
            toggleFlagsAsBlocked();
          }}
        >
          Flags as blocked
        </Checkbox>
        <Checkbox
          checked={settings.blockedByLinksAsBlocked}
          onChange={() => {
            toggleBlockedByLinksAsBlocked();
          }}
        >
          Blocked by links as blocked
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
