import React from 'react';
import Checkbox from 'antd/es/checkbox';
import { Card } from 'antd';
import { useGetSettings } from '../../hooks/useGetSettings';
import { changeCount } from './actions/changeCount';

export const CountSettings = () => {
  const { settings } = useGetSettings();
  return (
    <Card title="Count Settings" style={{ marginBottom: '16px' }} type="inner">
      <div style={{ marginBottom: '16px' }}>
        <div> Epic</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countEpicIssues}
            onChange={() => {
              changeCount('countEpicIssues', !settings.countEpicIssues);
            }}
          >
            Count issues of epic
          </Checkbox>
          <Checkbox
            checked={settings.countEpicLinkedIssues}
            onChange={() => {
              changeCount('countEpicLinkedIssues', !settings.countEpicLinkedIssues);
            }}
          >
            Count linked issues of epic
          </Checkbox>
          <Checkbox
            checked={settings.countEpicExternalLinks}
            onChange={() => {
              changeCount('countEpicExternalLinks', !settings.countEpicExternalLinks);
            }}
          >
            Count external links of epic
          </Checkbox>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div> Issues</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countIssuesSubtasks}
            onChange={() => {
              changeCount('countIssuesSubtasks', !settings.countIssuesSubtasks);
            }}
          >
            Count sub-tasks
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesLinkedIssues}
            onChange={() => {
              changeCount('countIssuesLinkedIssues', !settings.countIssuesLinkedIssues);
            }}
          >
            Count linked issues
          </Checkbox>
          <Checkbox
            checked={settings.countIssuesExternalLinks}
            onChange={() => {
              changeCount('countIssuesExternalLinks', !settings.countIssuesExternalLinks);
            }}
          >
            Count external links
          </Checkbox>
        </div>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <div> SubTasks</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
          <Checkbox
            checked={settings.countSubtasksLinkedIssues}
            onChange={() => {
              changeCount('countSubtasksLinkedIssues', !settings.countSubtasksLinkedIssues);
            }}
          >
            Count linked issues
          </Checkbox>
          <Checkbox
            checked={settings.countSubtasksExternalLinks}
            onChange={() => {
              changeCount('countSubtasksExternalLinks', !settings.countSubtasksExternalLinks);
            }}
          >
            Count external links
          </Checkbox>
        </div>
      </div>
    </Card>
  );
};
