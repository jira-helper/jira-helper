import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useEffect, useState } from 'react';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyService } from 'src/shared/boardPropertyService';
import Select from 'antd/es/select';
import Tabs from 'antd/es/tabs';
import { availableColorSchemas, jiraColorScheme, yellowGreenColorScheme } from './colorSchemas';
import { SubTasksProgressComponent } from './SubTasksProgressComponent';
import { subTasksProgress } from './testData';
import { Status } from './types';

export type BoardProperty = {
  columnsToTrack: string[];
};

export const ColumnsSettingsPure = (props: {
  columns: { name: string; enabled: boolean }[];
  onUpdate: (columns: { name: string; enabled: boolean }[]) => void;
  loading?: boolean;
}) => {
  return (
    <div>
      <p>Select columns where sub-tasks progress should be tracked:</p>
      {props.loading && <Spin />}
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
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

const SubTasksSettings = () => {
  /**
   * Component show tab for each project
   * In project tab - for every status shows little square with color, status name and selecto to choise subtaskprogresstatus
   */
  const [selectedProject, setSelectedProject] = useState('');
  // const [projects, setProjects] = useState<string[]>([]);

  const data: {
    [key: string]: { status: string; progressStatus: Status }[];
  } = {
    THF: [
      { status: 'To Do', progressStatus: 'todo' },
      { status: 'In Progress', progressStatus: 'inProgress' },
      { status: 'Done', progressStatus: 'done' },
    ],
    'Project 2': [
      { status: 'To Do', progressStatus: 'todo' },
      { status: 'In Progress', progressStatus: 'inProgress' },
      { status: 'Done', progressStatus: 'done' },
    ],
  };
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const loadProjects = async () => {
  //     setLoading(true);
  //     // TODO: Load projects from API
  //     setProjects(['Project 1', 'Project 2']);
  //     setLoading(false);
  //   };
  //   loadProjects();
  // }, []);

  // if (loading) {
  //   return <Spin />;
  // }
  const projects = Object.keys(data);

  return (
    <div>
      <Tabs
        type="card"
        activeKey={selectedProject}
        onChange={setSelectedProject}
        items={projects.map(project => ({
          label: project,
          key: project,
          children: (
            <div>
              {data[project].map(status => (
                /**
                 * span for color
                 */
                <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr 100px', gap: 10 }}>
                  <span style={{ backgroundColor: 'red', width: 10, height: 10, display: 'inline-block' }} />
                  {status.status}
                  <Select
                    value={status.progressStatus}
                    onChange={() => {}}
                    options={availableColorSchemas.map(schema => ({ value: schema, label: <span>{schema}</span> }))}
                  />
                </div>
              ))}
            </div>
          ),
        }))}
      />
    </div>
  );
};

const ColorSchemeChooser = () => {
  const [selectedColorScheme, setSelectedColorScheme] = useState(availableColorSchemas[0]);
  /**
   * use Select from antd
   */
  return (
    <div>
      <p>Select color scheme:</p>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
        <Select
          value={selectedColorScheme}
          onChange={setSelectedColorScheme}
          style={{ minWidth: 140 }} // Set min width to accommodate "yellowGreen"
          options={availableColorSchemas.map(schema => ({ value: schema, label: <span>{schema}</span> }))}
        />
        <span>
          Example:
          <SubTasksProgressComponent
            progress={subTasksProgress.smallMixed}
            colorScheme={selectedColorScheme === 'jira' ? jiraColorScheme : yellowGreenColorScheme}
          />
        </span>
      </div>
    </div>
  );
};

export const BoardSettingsTabContent = () => {
  // eslint-disable-next-line no-console
  console.log('!!!BoardSettingsTabContent mounted');
  return (
    <div>
      Sub-tasks progress
      <ColorSchemeChooser />
      <ColumnsSettingsContainer />
      <SubTasksSettings />
    </div>
  );
};
