import React, { useRef, useCallback } from 'react';
import { InputNumber, Button, Space, Card } from 'antd';
import { IssueTypeSelector } from '../../shared/components/IssueTypeSelector';
import { generateColorByFirstChars } from '../shared/utils';
import type { Column, UIGroup, IssueTypeState } from '../types';
import { WITHOUT_GROUP_ID } from '../types';
import styles from './styles.module.css';

export interface ColumnLimitsFormProps {
  withoutGroupColumns: Column[];
  groups: UIGroup[];
  issueTypeSelectorStates: Record<string, IssueTypeState>;
  onLimitChange: (groupId: string, limit: number) => void;
  onColorChange: (groupId: string) => void;
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
  onLimitChange,
  onColorChange,
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
  const formRef = useRef<HTMLDivElement | null>(null);
  const setFormRef = useCallback(
    (el: HTMLDivElement | null) => {
      formRef.current = el;
      formRefCallback?.(el);
    },
    [formRefCallback]
  );

  const DraggableColumn: React.FC<{ column: Column; groupId: string }> = ({ column, groupId }) => (
    <div
      data-column-id={column.id}
      data-group-id={groupId}
      className={`${styles.columnDraggableJH} draggable-jh`}
      draggable
      onDragStart={e => onColumnDragStart(e, column.id, groupId)}
      onDragEnd={onColumnDragEnd}
    >
      {column.name}
    </div>
  );

  const ColumnGroup: React.FC<{ group: UIGroup }> = ({ group }) => {
    const state = issueTypeSelectorStates[group.id] ?? {
      countAllTypes: !group.includedIssueTypes || group.includedIssueTypes.length === 0,
      projectKey: '',
      selectedTypes: group.includedIssueTypes ?? [],
    };

    const [localLimit, setLocalLimit] = React.useState<number | undefined>(group.max);

    React.useEffect(() => {
      setLocalLimit(group.max);
    }, [group.max]);

    const handleIssueTypesChange = React.useCallback(
      (selectedTypes: string[], countAllTypes: boolean) => {
        onIssueTypesChange(group.id, selectedTypes, countAllTypes);
      },
      [group.id, onIssueTypesChange]
    );

    return (
      <Card className={styles.columnGroupJH} style={{ marginBottom: 10 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
            <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>Limit for group:</span>
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
                if (numValue !== null && numValue !== undefined && !isNaN(numValue) && numValue >= 1) {
                  onLimitChange(group.id, numValue);
                } else if (localLimit !== undefined) {
                  setLocalLimit(group.max);
                }
              }}
              style={{ flex: '0 0 auto', minWidth: 60, maxWidth: 100 }}
            />
            <Button
              type="default"
              data-group-id={group.id}
              data-color-picker-btn
              onClick={() => onColorChange(group.id)}
              style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Change color
            </Button>
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
              <DraggableColumn key={column.id} column={column} groupId={group.id} />
            ))}
          </div>
          <div style={{ marginTop: 0, paddingTop: 8, paddingBottom: 0 }}>
            <IssueTypeSelector
              groupId={group.id}
              selectedTypes={state.selectedTypes}
              initialCountAllTypes={state.countAllTypes}
              initialProjectKey={state.projectKey}
              onSelectionChange={handleIssueTypesChange}
            />
          </div>
        </Space>
      </Card>
    );
  };

  const Dropzone: React.FC = () => (
    <div
      className={`${styles.addGroupDropzoneJH} dropzone-jh`}
      id={createGroupDropzoneId}
      onDrop={e => {
        const randomGroupId = Math.random().toString(36).substring(7);
        onDrop(e, randomGroupId);
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      Drag column over here to create group
    </div>
  );

  return (
    <div id={formId} ref={setFormRef} className={styles.form}>
      <div className={styles.formLeftBlock}>
        <Card title="Without Group" className={styles.columnGroupJH} style={{ marginBottom: 10 }}>
          <div
            className={`${styles.columnListJH} dropzone-jh`}
            data-group-id={WITHOUT_GROUP_ID}
            onDrop={e => onDrop(e, WITHOUT_GROUP_ID)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {withoutGroupColumns.map(column => (
              <DraggableColumn key={column.id} column={column} groupId={WITHOUT_GROUP_ID} />
            ))}
          </div>
        </Card>
      </div>
      <div className={styles.formRightBlock} id={allGroupsId}>
        {groups.map(group => (
          <ColumnGroup key={group.id} group={group} />
        ))}
        <Dropzone />
      </div>
    </div>
  );
};
