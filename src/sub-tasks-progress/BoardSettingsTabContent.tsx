import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useEffect, useState } from 'react';
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { BoardPropertyService } from 'src/shared/boardPropertyService';
import Select from 'antd/es/select';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Tag, Tooltip } from 'antd';
import { JiraIssue } from 'src/shared/jira/types';
import { JiraService } from 'src/shared/jira/jiraService';
import { availableColorSchemas, availableStatuses, jiraColorScheme, yellowGreenColorScheme } from './colorSchemas';
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

const useOnMount = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, []);
};

const useGetJiraIssuesFromBoard = () => {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(false);

  useOnMount(() => {
    JiraService.getInstance().subtasksEventEmitter.addListener(subtasks => {
      const allSubTasks = subtasks.flatMap(subtask =>
        [subtask.subtasks, subtask.tasksInEpic, subtask.linkedIssues, subtask.externalLinks].flat()
      );
      setIssues(allSubTasks);
    });
  });

  useEffect(() => JiraService.watchIssuesLoading(loading => setLoading(loading)));
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

const SubTaskStatusMapping = (props: { group: string; status: string; progressStatus: Status; title: string }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'status',
    item: {
      group: props.group,
      status: props.status,
      progressStatus: props.progressStatus,
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.4 : 1;

  return (
    <div
      ref={drag}
      style={{
        opacity,
        padding: '8px',
        margin: '4px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: 'white',
        cursor: 'move',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <Tooltip
        title={
          <div>
            <div>group: {props.group}</div>
            <div>status: {props.status}</div>
          </div>
        }
      >
        <Tag
          style={{ width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'normal' }}
          color={jiraColorScheme[props.progressStatus]}
        >
          {props.title}
        </Tag>
      </Tooltip>
    </div>
  );
};

const StatusColumn = ({
  title,
  statuses,
  onDrop,
  progressStatus,
}: {
  title: string;
  statuses: { group: string; status: string; title: string }[];
  progressStatus: Status;
  onDrop: (item: { group: string; status: string; title: string }) => void;
}) => {
  const [{ isOver }, drop] = useDrop({
    accept: 'status',
    drop: (item: { group: string; status: string; title: string }) => {
      onDrop(item);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  const borderTopColor = title === 'unmapped' ? '#ccc' : `${jiraColorScheme[title as Status]}`;

  return (
    <div
      ref={drop}
      style={{
        padding: '8px',
        backgroundColor: 'white',
        border: `1px solid ${borderTopColor}`,
        borderTop: `4px solid ${borderTopColor}`,
        borderRadius: '4px',
        minHeight: '200px',
        minWidth: '100px',
        width: '100px',
        margin: '0 8px',
        overflow: 'hidden',
      }}
    >
      <h4>{title}</h4>
      {statuses.map(status => {
        return (
          <SubTaskStatusMapping
            key={`${status.group}-${status.status}`}
            group={status.group}
            status={status.status}
            title={status.title}
            progressStatus={progressStatus}
          />
        );
      })}
    </div>
  );
};

const DragDropContext = () => {
  const [statusMappings, setStatusMappings] = useState<{
    [key: string]: { group: string; status: string; progressStatus: Status }[];
  }>({
    unmapped: [
      { group: 'THF', status: 'To Do', progressStatus: 'todo' },
      { group: 'THF', status: 'Ready To Technical Specification', progressStatus: 'inProgress' },
      { group: 'THF', status: 'Done', progressStatus: 'done' },
      { group: 'Project 2', status: 'To Do', progressStatus: 'todo' },
      { group: 'Project 2', status: 'In Progress', progressStatus: 'inProgress' },
      { group: 'Project 2', status: 'Done', progressStatus: 'done' },
    ],
    blocked: [],
    backlog: [],
    todo: [],
    inProgress: [],
    almostDone: [],
    done: [],
  });

  const prepareItemTitle = (item: { group: string; status: string; progressStatus: Status }) => {
    const isUniqueStatus =
      Object.values(statusMappings)
        .flat()
        .filter(s => s.status === item.status).length === 1;
    return isUniqueStatus ? item.status : `${item.group}: ${item.status}`;
  };

  const handleDrop = (
    targetColumn: Status | 'unmapped',
    item: { group: string; status: string; progressStatus: Status; title: string }
  ) => {
    setStatusMappings(prev => {
      const newMappings = { ...prev };

      // Remove from old column
      Object.keys(newMappings).forEach(key => {
        newMappings[key] = newMappings[key].filter(
          status => !(status.group === item.group && status.status === item.status)
        );
      });

      // Add to new column
      newMappings[targetColumn] = [
        ...newMappings[targetColumn],
        {
          ...item,
          progressStatus: targetColumn as Status,
        },
      ];

      return newMappings;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', overflowX: 'auto', padding: '16px' }}>
        {availableStatuses.map(status => (
          <StatusColumn
            key={status}
            title={status}
            statuses={statusMappings[status].map(item => ({
              ...item,
              title: prepareItemTitle(item),
            }))}
            progressStatus={status}
            onDrop={item => handleDrop(status, { ...item, progressStatus: status })}
          />
        ))}
      </div>
    </DndProvider>
  );
};
type GroupFields = 'project' | 'assignee' | 'reporter' | 'priority' | 'creator' | 'issueType';
const groupingFields: GroupFields[] = ['project', 'assignee', 'reporter', 'priority', 'creator', 'issueType'];

const useGetData = () => {
  return {
    loading: false,
    groupedStatuses: {
      THF: [
        { status: 'To Do', progressStatus: 'todo' },
        { status: 'In Progress', progressStatus: 'inProgress' },
        { status: 'Done', progressStatus: 'done' },
      ],
    },
  };
};

const SubTasksSettings = () => {
  const { groupedStatuses, loading } = useGetData();
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

  return (
    <div>
      <DragDropContext />
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

const GroupingSettings = (props: { currentGrouping: GroupFields; onUpdate: (grouping: GroupFields) => void }) => {
  const [currentGrouping, setCurrentGrouping] = useState(props.currentGrouping);

  const handleUpdate = (grouping: GroupFields) => {
    setCurrentGrouping(grouping);
    props.onUpdate(grouping);
  };

  return (
    <div>
      <p>Select grouping field:</p>
      <Select
        style={{ minWidth: 140 }}
        value={currentGrouping}
        onChange={handleUpdate}
        options={groupingFields.map(field => ({ value: field, label: field }))}
      />
    </div>
  );
};

export const BoardSettingsTabContent = () => {
  return (
    <div>
      Sub-tasks progress
      <ColorSchemeChooser />
      <ColumnsSettingsContainer />
      <GroupingSettings currentGrouping="project" onUpdate={() => {}} />
      <SubTasksSettings />
    </div>
  );
};
