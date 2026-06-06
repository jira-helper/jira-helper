import React from 'react';
import { Table, Button, ColorPicker, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FieldLimit, BoardColumn, BoardSwimlane, CardLayoutField } from '../../types';
import type { FieldLimitsTextKeys } from '../../texts';

export interface LimitsTableProps {
  limits: Record<string, FieldLimit>;
  columns: BoardColumn[];
  swimlanes: BoardSwimlane[];
  fields: CardLayoutField[];
  onEdit: (limitKey: string) => void;
  onDelete: (limitKey: string) => void;
  onColorChange: (limitKey: string, color: string) => void;
  texts: Record<FieldLimitsTextKeys, string>;
}

type TableRow = { key: string } & FieldLimit;

export const LimitsTable: React.FC<LimitsTableProps> = ({
  limits,
  columns,
  swimlanes,
  fields,
  onEdit,
  onDelete,
  onColorChange,
  texts,
}) => {
  const dataSource: TableRow[] = Object.entries(limits).map(([key, limit]) => ({
    key,
    ...limit,
  }));

  const getFieldName = (fieldId: string) => fields.find(f => f.fieldId === fieldId)?.name ?? fieldId;

  const getColumnNames = (colIds: string[]) =>
    colIds.length === 0 ? texts.all : colIds.map(id => columns.find(c => c.id === id)?.name ?? id).join(', ');

  const getSwimlaneNames = (swimIds: string[]) =>
    swimIds.length === 0 ? texts.all : swimIds.map(id => swimlanes.find(s => s.id === id)?.name ?? id).join(', ');

  const tableColumns = [
    {
      title: texts.field,
      dataIndex: 'fieldId',
      key: 'field',
      render: (fieldId: string) => getFieldName(fieldId),
    },
    {
      title: texts.value,
      dataIndex: 'fieldValue',
      key: 'fieldValue',
    },
    {
      title: texts.name,
      key: 'visualValue',
      render: (_: unknown, record: TableRow) => (
        <Space>
          <ColorPicker
            value={record.bkgColor ?? '#ffffff'}
            size="small"
            onChange={value => onColorChange(record.key, value.toHexString())}
          />
          <Tag color={record.bkgColor}>{record.visualValue}</Tag>
        </Space>
      ),
    },
    {
      title: texts.limit,
      dataIndex: 'limit',
      key: 'limit',
      width: 70,
    },
    {
      title: texts.columns,
      dataIndex: 'columns',
      key: 'columns',
      render: (colIds: string[]) => getColumnNames(colIds),
    },
    {
      title: texts.swimlanes,
      dataIndex: 'swimlanes',
      key: 'swimlanes',
      render: (swimIds: string[]) => getSwimlaneNames(swimIds),
    },
    {
      title: texts.actions,
      key: 'actions',
      width: 100,
      render: (_: unknown, record: TableRow) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => onEdit(record.key)} />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => onDelete(record.key)} />
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={tableColumns}
      pagination={false}
      size="small"
      data-testid="field-limits-table"
    />
  );
};
