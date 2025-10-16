import React from 'react';
import { Card, Checkbox, Button } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetSettings } from '../hooks/useGetSettings';
import { setColumns } from './actions/setColumns';

const TEXTS = {
  columnSettingsTitle: {
    en: 'Column Settings',
    ru: 'Настройки колонок',
  },
  updateColumnsButton: {
    en: 'Update columns',
    ru: 'Обновить колонки',
  },
  noColumnsAvailable: {
    en: 'No columns available',
    ru: 'Колонки недоступны',
  },
};

export const ColumnSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { settings } = useGetSettings();

  // TODO: Get columns from board
  const columns = [
    { name: 'To Do', enabled: false },
    { name: 'In Progress', enabled: true },
    { name: 'Review', enabled: true },
    { name: 'Done', enabled: false },
  ];

  const handleColumnChange = (columnName: string, enabled: boolean) => {
    const updatedColumns = columns.map(col => (col.name === columnName ? { ...col, enabled } : col));
    setColumns(updatedColumns);
  };

  const handleUpdateColumns = () => {
    // TODO: Implement column update
    console.log('Update columns');
  };

  if (columns.length === 0) {
    return <div>{texts.noColumnsAvailable}</div>;
  }

  return (
    <Card title={texts.columnSettingsTitle} type="inner">
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        {columns.map(column => (
          <div key={column.name}>
            <Checkbox checked={column.enabled} onChange={e => handleColumnChange(column.name, e.target.checked)}>
              {column.name}
            </Checkbox>
          </div>
        ))}
      </div>

      <Button type="primary" onClick={handleUpdateColumns} style={{ marginTop: '16px' }}>
        {texts.updateColumnsButton}
      </Button>
    </Card>
  );
};
