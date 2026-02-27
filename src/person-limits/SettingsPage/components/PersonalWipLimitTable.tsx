import React from 'react';
import { Table, Button, Space } from 'antd';
import type { PersonLimit } from '../state/types';
import { settingsJiraDOM } from '../constants';

export interface PersonalWipLimitTableProps {
  limits: PersonLimit[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const PersonalWipLimitTable: React.FC<PersonalWipLimitTableProps> = ({ limits, onDelete, onEdit }) => {
  const columns = [
    {
      title: 'Person',
      key: 'person',
      render: (_: any, record: PersonLimit) => record.person.displayName || record.person.name,
    },
    {
      title: 'Limit',
      dataIndex: 'limit',
      key: 'limit',
    },
    {
      title: 'Columns',
      dataIndex: 'columns',
      key: 'columns',
      render: (columnList: { name: string }[]) =>
        columnList.length === 0 ? 'All' : columnList.map(c => c.name).join(', '),
    },
    {
      title: 'Swimlanes',
      dataIndex: 'swimlanes',
      key: 'swimlanes',
      render: (swimlanes: { name: string }[]) =>
        swimlanes.length === 0 ? 'All' : swimlanes.map(s => s.name).join(', '),
    },
    {
      title: 'Issue types',
      dataIndex: 'includedIssueTypes',
      key: 'includedIssueTypes',
      render: (includedIssueTypes: string[] | undefined) =>
        !includedIssueTypes || includedIssueTypes.length === 0 ? 'All' : includedIssueTypes.join(', '),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PersonLimit) => (
        <Space split={<span>|</span>}>
          <Button type="link" danger onClick={() => onDelete(Number(record.id))}>
            Delete
          </Button>
          <Button type="link" onClick={() => onEdit(Number(record.id))}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      id={settingsJiraDOM.idTablePersonalWipLimit}
      columns={columns}
      dataSource={limits}
      rowKey="id"
      rowClassName={record => `person-row person-row-${record.id}`}
      pagination={false}
      size="small"
    />
  );
};
