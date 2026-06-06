import React from 'react';
import { Collapse } from 'antd';
import type { Container } from 'dioma';
import { GanttChartContainer } from './GanttChartContainer';

export interface CollapsibleGanttSectionProps {
  issueKey: string;
  container: Container;
}

export const CollapsibleGanttSection: React.FC<CollapsibleGanttSectionProps> = ({ issueKey, container }) => (
  <Collapse
    bordered={false}
    defaultActiveKey={[]}
    ghost
    items={[
      {
        key: 'gantt',
        label: 'Gantt Chart',
        forceRender: true,
        children: <GanttChartContainer issueKey={issueKey} container={container} />,
      },
    ]}
  />
);
