import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useEffect, useState } from 'react';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyService } from 'src/shared/boardPropertyService';

type BoardProperty = {
  columnsToTrack: string[];
};

const ColumnsSettingsPure = (props: {
  columns: { name: string; enabled: boolean }[];
  onUpdate: (columns: { name: string; enabled: boolean }[]) => void;
  loading?: boolean;
}) => {
  return (
    <div>
      <p>Select columns where sub-tasks progress should be tracked:</p>
      {props.loading && <Spin />}
      {props.columns.map(column => (
        <div key={column.name}>
          <Checkbox
            checked={column.enabled}
            onChange={() => {
              const updatedColumns = props.columns.map(c => {
                if (c.name === column.name) {
                  return { ...c, enabled: !c.enabled };
                }
                return c;
              });
              props.onUpdate(updatedColumns);
            }}
          >
            {column.name}
          </Checkbox>
        </div>
      ))}
    </div>
  );
};

const ColumnsSettingsContainer = () => {
  const [columns, setColumns] = useState<{ name: string; enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadColumns = async () => {
      setLoading(true);
      const columnsFromBoard = BoardPagePageObject.getColumns();
      const boardProperty = await BoardPropertyService.getBoardProperty<BoardProperty>('sub-task-progress');
      const columnsToTrack = boardProperty?.columnsToTrack || [];
      const columnsToState = columnsFromBoard.map(column => ({
        name: column,
        enabled: columnsToTrack.includes(column),
      }));
      setColumns(columnsToState);
      setLoading(false);
    };
    loadColumns();
  }, []);

  return <ColumnsSettingsPure columns={columns} onUpdate={setColumns} loading={loading} />;
};

// how to test it ?
// storybook - component with mock
// unit - mock board property and page object and see if component renders correctly

export const BoardSettingsTabContent = () => {
  // eslint-disable-next-line no-console
  console.log('!!!BoardSettingsTabContent mounted');
  return (
    <div>
      Sub-tasks progress
      <ColumnsSettingsContainer />
    </div>
  );
};
