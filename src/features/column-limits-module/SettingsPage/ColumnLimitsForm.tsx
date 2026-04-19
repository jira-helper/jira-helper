import React, { useRef, useCallback, useState, useEffect } from 'react';
import { InputNumber, Space, Card } from 'antd';
import { IssueTypeSelector } from '../../../shared/components/IssueTypeSelector';
import { SwimlaneSelector } from 'src/shared/components/SwimlaneSelector';
import { useGetTextsByLocale } from 'src/shared/texts';
import { generateColorByFirstChars } from 'src/features/column-limits-module/shared/utils';
import type { Column, UIGroup, IssueTypeState } from '../types';
import { WITHOUT_GROUP_ID } from '../types';
import { ColorPickerButton } from './components/ColorPickerButton';
import { COLUMN_LIMITS_TEXTS } from './texts';
import styles from './styles.module.css';

// --- Extracted Components ---

interface DraggableColumnProps {
  column: Column;
  groupId: string;
  onDragStart: (e: React.DragEvent, columnId: string, groupId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const DraggableColumn: React.FC<DraggableColumnProps> = ({ column, groupId, onDragStart, onDragEnd }) => (
  <div
    data-column-id={column.id}
    data-group-id={groupId}
    className={`${styles.columnDraggableJH} draggable-jh`}
    draggable
    onDragStart={e => onDragStart(e, column.id, groupId)}
    onDragEnd={onDragEnd}
  >
    {column.name}
  </div>
);

interface ColumnGroupProps {
  group: UIGroup;
  issueTypeSelectorState: IssueTypeState;
  swimlanes: Array<{ id: string; name: string }>;
  texts: { limitForGroup: string; swimlanes: string; allSwimlanes: string; selectColor: string };
  onLimitChange: (groupId: string, limit: number) => void;
  onColorChange: (groupId: string, color: string) => void;
  onSwimlanesChange?: (groupId: string, selectedSwimlanes: Array<{ id: string; name: string }>) => void;
  onIssueTypesChange: (groupId: string, selectedTypes: string[], countAllTypes: boolean) => void;
  onDrop: (e: React.DragEvent, targetGroupId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onColumnDragStart: (e: React.DragEvent, columnId: string, groupId: string) => void;
  onColumnDragEnd: (e: React.DragEvent) => void;
}

const ColumnGroup: React.FC<ColumnGroupProps> = ({
  group,
  issueTypeSelectorState,
  swimlanes,
  texts,
  onLimitChange,
  onColorChange,
  onSwimlanesChange,
  onIssueTypesChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onColumnDragStart,
  onColumnDragEnd,
}) => {
  const [localLimit, setLocalLimit] = useState<number | undefined>(group.max);

  useEffect(() => {
    setLocalLimit(group.max);
  }, [group.max]);

  const handleIssueTypesChange = useCallback(
    (selectedTypes: string[], countAllTypes: boolean) => {
      onIssueTypesChange(group.id, selectedTypes, countAllTypes);
    },
    [group.id, onIssueTypesChange]
  );

  const selectedSwimlaneIds = group.swimlanes?.map(s => s.id) ?? [];
  const handleSwimlanesChange = useCallback(
    (ids: string[]) => {
      if (!onSwimlanesChange) return;
      const selectedSwimlanes = ids.length === 0 ? [] : swimlanes.filter(s => ids.includes(s.id));
      onSwimlanesChange(group.id, selectedSwimlanes);
    },
    [group.id, onSwimlanesChange, swimlanes]
  );

  return (
    <Card className={styles.columnGroupJH} style={{ marginBottom: 10 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
          <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{texts.limitForGroup}</span>
          <InputNumber
            data-group-id={group.id}
            className="group-limits-input-jh"
            value={localLimit}
            min={1}
            onChange={value => {
              if (value !== null && value !== undefined) {
                setLocalLimit(Number(value));
              } else {
                setLocalLimit(undefined);
              }
            }}
            onBlur={e => {
              const inputValue = e.target.value;
              const numValue = inputValue ? Number(inputValue) : localLimit;
              if (numValue !== null && numValue !== undefined && !Number.isNaN(numValue) && numValue >= 1) {
                onLimitChange(group.id, numValue);
              } else if (localLimit !== undefined) {
                setLocalLimit(group.max);
              }
            }}
            style={{ flex: '0 0 auto', minWidth: 60, maxWidth: 100 }}
          />
          <ColorPickerButton
            groupId={group.id}
            currentColor={group.customHexColor}
            selectColorText={texts.selectColor}
            onColorChange={color => onColorChange(group.id, color)}
          />
        </div>
        <div
          className={`${styles.columnListJH} dropzone-jh`}
          data-group-id={group.id}
          style={{
            marginBottom: 0,
            backgroundColor: group.customHexColor || generateColorByFirstChars(group.id),
          }}
          onDrop={e => onDrop(e, group.id)}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          {group.columns.map(column => (
            <DraggableColumn
              key={column.id}
              column={column}
              groupId={group.id}
              onDragStart={onColumnDragStart}
              onDragEnd={onColumnDragEnd}
            />
          ))}
        </div>
        {onSwimlanesChange && swimlanes.length > 0 && (
          <div style={{ marginTop: 0, paddingTop: 8, paddingBottom: 0 }}>
            <SwimlaneSelector
              swimlanes={swimlanes}
              value={selectedSwimlaneIds}
              onChange={handleSwimlanesChange}
              label={texts.swimlanes}
              allLabel={texts.allSwimlanes}
            />
          </div>
        )}
        <div style={{ marginTop: 0, paddingTop: 8, paddingBottom: 0 }}>
          <IssueTypeSelector
            groupId={group.id}
            selectedTypes={issueTypeSelectorState.selectedTypes}
            initialCountAllTypes={issueTypeSelectorState.countAllTypes}
            initialProjectKey={issueTypeSelectorState.projectKey}
            onSelectionChange={handleIssueTypesChange}
          />
        </div>
      </Space>
    </Card>
  );
};

interface CreateGroupDropzoneProps {
  dropzoneId: string;
  dragColumnToCreateGroup: string;
  onDrop: (e: React.DragEvent, targetGroupId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
}

const CreateGroupDropzone: React.FC<CreateGroupDropzoneProps> = ({
  dropzoneId,
  dragColumnToCreateGroup,
  onDrop,
  onDragOver,
  onDragLeave,
}) => (
  <div
    className={`${styles.addGroupDropzoneJH} dropzone-jh`}
    id={dropzoneId}
    onDrop={e => {
      const randomGroupId = Math.random().toString(36).substring(7);
      onDrop(e, randomGroupId);
    }}
    onDragOver={onDragOver}
    onDragLeave={onDragLeave}
  >
    {dragColumnToCreateGroup}
  </div>
);

// --- Main Form Component ---

export interface ColumnLimitsFormProps {
  withoutGroupColumns: Column[];
  groups: UIGroup[];
  issueTypeSelectorStates: Record<string, IssueTypeState>;
  swimlanes?: Array<{ id: string; name: string }>;
  onLimitChange: (groupId: string, limit: number) => void;
  onColorChange: (groupId: string, color: string) => void;
  onSwimlanesChange?: (groupId: string, selectedSwimlanes: Array<{ id: string; name: string }>) => void;
  onIssueTypesChange: (groupId: string, selectedTypes: string[], countAllTypes: boolean) => void;
  onColumnDragStart: (e: React.DragEvent, columnId: string, groupId: string) => void;
  onColumnDragEnd: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetGroupId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  formId: string;
  allGroupsId: string;
  createGroupDropzoneId: string;
  formRefCallback?: (el: HTMLDivElement | null) => void;
}

export const ColumnLimitsForm: React.FC<ColumnLimitsFormProps> = ({
  withoutGroupColumns,
  groups,
  issueTypeSelectorStates,
  swimlanes = [],
  onLimitChange,
  onColorChange,
  onSwimlanesChange,
  onIssueTypesChange,
  onColumnDragStart,
  onColumnDragEnd,
  onDrop,
  onDragOver,
  onDragLeave,
  formId,
  allGroupsId,
  createGroupDropzoneId,
  formRefCallback,
}) => {
  const texts = useGetTextsByLocale(COLUMN_LIMITS_TEXTS);
  const formRef = useRef<HTMLDivElement | null>(null);
  const setFormRef = useCallback(
    (el: HTMLDivElement | null) => {
      formRef.current = el;
      formRefCallback?.(el);
    },
    [formRefCallback]
  );

  const getIssueTypeSelectorState = (groupId: string): IssueTypeState => {
    const group = groups.find(g => g.id === groupId);
    return (
      issueTypeSelectorStates[groupId] ?? {
        countAllTypes: !group?.includedIssueTypes || group.includedIssueTypes.length === 0,
        projectKey: '',
        selectedTypes: group?.includedIssueTypes ?? [],
      }
    );
  };

  return (
    <div id={formId} ref={setFormRef} className={styles.form}>
      <div className={styles.formLeftBlock}>
        <Card title={texts.withoutGroup} className={styles.columnGroupJH} style={{ marginBottom: 10 }}>
          <div
            className={`${styles.columnListJH} dropzone-jh`}
            data-group-id={WITHOUT_GROUP_ID}
            onDrop={e => onDrop(e, WITHOUT_GROUP_ID)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {withoutGroupColumns.map(column => (
              <DraggableColumn
                key={column.id}
                column={column}
                groupId={WITHOUT_GROUP_ID}
                onDragStart={onColumnDragStart}
                onDragEnd={onColumnDragEnd}
              />
            ))}
          </div>
        </Card>
      </div>
      <div className={styles.formRightBlock} id={allGroupsId}>
        {groups.map(group => (
          <ColumnGroup
            key={group.id}
            group={group}
            issueTypeSelectorState={getIssueTypeSelectorState(group.id)}
            swimlanes={swimlanes}
            texts={texts}
            onLimitChange={onLimitChange}
            onColorChange={onColorChange}
            onSwimlanesChange={onSwimlanesChange}
            onIssueTypesChange={onIssueTypesChange}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onColumnDragStart={onColumnDragStart}
            onColumnDragEnd={onColumnDragEnd}
          />
        ))}
        <CreateGroupDropzone
          dropzoneId={createGroupDropzoneId}
          dragColumnToCreateGroup={texts.dragColumnToCreateGroup}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        />
      </div>
    </div>
  );
};
