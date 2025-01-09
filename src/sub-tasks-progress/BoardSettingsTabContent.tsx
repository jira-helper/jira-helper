import Checkbox from 'antd/es/checkbox';
import Spin from 'antd/es/spin';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BoardPagePageObject, boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { useShallow } from 'zustand/react/shallow';
import Select from 'antd/es/select';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Tag, Tooltip } from 'antd';

import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks';
import { useJiraBoardPropertiesStore } from 'src/shared/jira/stores/jiraBoardProperties/jiraBoardProperties';
import { loadBoardProperty } from 'src/shared/jira/actions/loadBoardProperty';
import { updateBoardProperty } from 'src/shared/jira/actions/updateBoardProperty';

import { useDi } from 'src/shared/diContext';
import {
  AvailableColorSchemas,
  availableColorSchemas,
  availableStatuses,
  jiraColorScheme,
  yellowGreenColorScheme,
} from './colorSchemas';
import { SubTasksProgressComponent } from './SubTasksProgressComponent';
import { subTasksProgress } from './testData';
import { Status } from './types';
import { setSelectedColorScheme } from './actions/setSelectedColorScheme';

type GroupFields = 'project' | 'assignee' | 'reporter' | 'priority' | 'creator' | 'issueType';
export type BoardProperty = {
  columnsToTrack?: string[];
  groupingField?: GroupFields;
  statusMapping?: Record<string, Status>;
  selectedColorScheme?: AvailableColorSchemas;
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
const useGetAllSubtasks = () => {
  const { data, loading } = useJiraSubtasksStore(
    useShallow(state => {
      return { data: state.data, loading: state.loading };
    })
  );
  return { issues: data.flatMap(i => i.data.subtasks), loading };
};

const ColumnsSettingsContainer = () => {
  const boardPagePageObject = useDi().inject(boardPagePageObjectToken) as typeof BoardPagePageObject;
  const [columnsFromBoard] = useState<string[]>(boardPagePageObject.getColumns());

  const propertyData = useJiraBoardPropertiesStore(state => state.properties['sub-task-progress']);
  useOnMount(() => {
    loadBoardProperty('sub-task-progress');
  });

  const columns = useMemo(() => {
    const columnsToTrack = propertyData?.value?.columnsToTrack || [];
    const columnsToState = columnsFromBoard.map(column => ({
      name: column,
      enabled: columnsToTrack.includes(column),
    }));
    return columnsToState;
  }, [propertyData, columnsFromBoard]);

  const setColumns = useCallback((newColumnsState: { name: string; enabled: boolean }[]) => {
    const currentPropertyValue = propertyData?.value;
    currentPropertyValue.columnsToTrack = newColumnsState.filter(c => c.enabled).map(c => c.name);
    updateBoardProperty('sub-task-progress', currentPropertyValue);
  }, []);

  return <ColumnsSettingsPure columns={columns} onUpdate={setColumns} loading={propertyData?.loading ?? true} />;
};

// how to test it ?
// storybook - component with mock
// unit - mock board property and page object and see if component renders correctly

const SubTaskStatusMapping = (props: { status: string; progressStatus: Status }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'status',
    item: {
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
            <div>status: {props.status}</div>
          </div>
        }
      >
        <Tag
          style={{ width: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'normal' }}
          color={jiraColorScheme[props.progressStatus]}
        >
          {props.status}
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
  statuses: string[];
  progressStatus: Status;
  onDrop: (status: string) => void;
}) => {
  const [, drop] = useDrop({
    accept: 'status',
    drop: (status: string) => {
      onDrop(status);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
  });

  const { settings } = useGetSettings();
  const selectedColorScheme = settings?.selectedColorScheme ?? availableColorSchemas[0];
  const colorScheme = selectedColorScheme === 'jira' ? jiraColorScheme : yellowGreenColorScheme;

  const borderTopColor = title === 'unmapped' ? '#ccc' : `${colorScheme[title as Status]}`;

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
        return <SubTaskStatusMapping key={status} status={status} progressStatus={progressStatus} />;
      })}
    </div>
  );
};

const DragDropContext = (props: {
  statusMapping: Record<string, Status>;
  onUpdateStatusMapping: (statusMapping: Record<string, Status>) => void;
}) => {
  const { statusMapping } = props;
  const handleDrop = (targetColumn: Status, status: string) => {
    const newStatusMapping = { ...statusMapping };
    newStatusMapping[status] = targetColumn;
    props.onUpdateStatusMapping(newStatusMapping);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', overflowX: 'auto', padding: '16px' }}>
        {availableStatuses.map(status => {
          const statuses = Object.keys(statusMapping).filter(key => statusMapping[key] === status);
          return (
            <StatusColumn
              key={status}
              title={status}
              statuses={statuses}
              progressStatus={status}
              onDrop={issueStatus => handleDrop(status, issueStatus)}
            />
          );
        })}
      </div>
    </DndProvider>
  );
};

const groupingFields: GroupFields[] = ['project', 'assignee', 'reporter', 'priority', 'creator', 'issueType'];

const useGetSettings = () => {
  const propertyData = useJiraBoardPropertiesStore(state => state.properties['sub-task-progress']);
  useOnMount(() => {
    loadBoardProperty('sub-task-progress');
  });
  return { settings: propertyData?.value as BoardProperty | undefined, loading: propertyData?.loading ?? true };
};

const SubTasksSettings = () => {
  const { issues } = useGetAllSubtasks();
  const { settings } = useGetSettings();

  const statuses = issues.map(issue => issue.fields.status.name);
  const statusMapping = settings?.statusMapping ?? {};
  const actualStatusMapping: Record<string, Status> = {
    ...statusMapping,
  };

  statuses.forEach(status => {
    actualStatusMapping[status] = statusMapping[status] ?? 'unmapped';
  });

  // if (loading) {
  //   return <Spin />;
  // }

  return (
    <div>
      <DragDropContext
        statusMapping={actualStatusMapping}
        onUpdateStatusMapping={newStatusMapping => {
          const currentPropertyValue = { ...settings };
          currentPropertyValue.statusMapping = newStatusMapping;
          updateBoardProperty('sub-task-progress', currentPropertyValue);
        }}
      />
    </div>
  );
};

const ColorSchemeChooser = () => {
  const { settings } = useGetSettings();
  const selectedColorScheme = settings?.selectedColorScheme ?? availableColorSchemas[0];
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
