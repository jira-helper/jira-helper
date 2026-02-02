import React from 'react';
import { Table, Checkbox, Button, Space } from 'antd';
import type { PersonLimit } from '../state/types';
import { settingsJiraDOM } from '../htmlTemplates';

export interface PersonalWipLimitTableProps {
  limits: PersonLimit[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onCheckboxChange: (id: number, checked: boolean) => void;
  checkedIds: number[];
}

export const PersonalWipLimitTable: React.FC<PersonalWipLimitTableProps> = ({
  limits,
  onDelete,
  onEdit,
  onCheckboxChange,
  checkedIds,
}) => {
  const columns = [
    {
      title: '',
      key: 'checkbox',
      width: 50,
      render: (_: any, record: PersonLimit) => (
        <Checkbox
          checked={checkedIds.includes(Number(record.id))}
          onChange={e => onCheckboxChange(Number(record.id), e.target.checked)}
        />
      ),
    },
    {
      title: 'Person',
      dataIndex: ['person', 'displayName'],
      key: 'person',
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
      render: (columns: { name: string }[]) => (columns.length === 0 ? 'All' : columns.map(c => c.name).join(', ')),
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
