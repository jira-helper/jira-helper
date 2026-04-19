import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Alert, Form, InputNumber, Button, Space, Row, Col, Checkbox, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { SearchUsers } from 'src/shared/di/jiraApiTokens';
import { useDi } from 'src/shared/diContext';
import { IssueTypeSelector } from '../../../../shared/components/IssueTypeSelector';
import { SwimlaneSelector } from 'src/shared/components/SwimlaneSelector';
import { PersonalWipLimitTable } from './PersonalWipLimitTable';
import { PersonNameSelect } from './PersonNameSelect';
import { settingsUIModelToken } from '../../tokens';
import type { FormData, Column, Swimlane, SelectedPerson } from '../state/types';
import { settingsJiraDOM } from '../constants';
import { PERSON_LIMITS_TEXTS } from '../texts';

export interface PersonalWipLimitContainerProps {
  columns: Column[];
  swimlanes: Swimlane[];
  searchUsers: SearchUsers;
  onAddLimit: (data: FormData) => void;
}

export const PersonalWipLimitContainer: React.FC<PersonalWipLimitContainerProps> = ({
  columns,
  swimlanes,
  searchUsers,
  onAddLimit,
}) => {
  const { model: settingsUi, useModel } = useDi().inject(settingsUIModelToken);
  const snap = useModel();
  const { limits, editingId, formData } = snap;
  const texts = useGetTextsByLocale(PERSON_LIMITS_TEXTS);
  const [form] = Form.useForm();

  // Filter out kanban columns
  const availableColumns = useMemo(() => columns.filter(col => !col.isKanPlanColumn), [columns]);

  // Prepare swimlanes for SwimlaneSelector (memoized to avoid unnecessary re-renders)
  const swimlanesForSelector = useMemo(
    () =>
      swimlanes.map((swim, index) => ({
        id: String((swim as any).id ?? swim.name ?? `swimlane-${index}`),
        name: swim.name,
      })),
    [swimlanes]
  );

  // Default form values (all columns and swimlanes selected; ids as strings for Checkbox.Group)
  // selectedColumns uses explicit IDs for initial UI state
  // swimlanes uses [] convention (empty = all)
  const defaultFormData = useMemo<FormData>(
    () => ({
      person: null,
      limit: 1,
      selectedColumns: availableColumns.map(col => String(col.id)),
      swimlanes: [], // [] = all swimlanes (convention)
      showAllPersonIssues: true,
    }),
    [availableColumns]
  );

  // Current form data (from props or defaults)
  const currentFormData: FormData = formData || defaultFormData;

  // Initialize form when formData changes
  // Note: swimlanes is managed separately (not via Form.Item name)
  useEffect(() => {
    if (formData) {
      const columnsToShow =
        formData.selectedColumns.length === 0
          ? availableColumns.map(col => String(col.id))
          : formData.selectedColumns.map(String);

      form.setFieldsValue({
        person: formData.person,
        limit: formData.limit,
        selectedColumns: columnsToShow,
      });
    } else {
      form.setFieldsValue({
        person: null,
        limit: 1,
        selectedColumns: defaultFormData.selectedColumns,
      });
    }
  }, [formData, form, defaultFormData, availableColumns]);

  // Issue types state (local UI state)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(formData?.includedIssueTypes || []);
  const [countAllTypes, setCountAllTypes] = useState<boolean>(
    !formData?.includedIssueTypes || formData.includedIssueTypes.length === 0
  );
  const [resetCounter, setResetCounter] = useState(0);

  // Track previous editingId and formData null-ness to detect mode changes
  const prevEditingIdRef = useRef<number | null>(null);
  const prevIsFormDataNullRef = useRef(formData === null);

  const isFormDataNull = formData === null;

  // Reset issue types when switching between add/edit modes or after successful add
  useEffect(() => {
    const editingIdChanged = prevEditingIdRef.current !== editingId;
    prevEditingIdRef.current = editingId;

    // Detect formData clearing (non-null → null) for the "Add" mode reset case:
    // when editingId stays null but addLimit sets formData to null
    const formDataCleared = !prevIsFormDataNullRef.current && isFormDataNull;
    prevIsFormDataNullRef.current = isFormDataNull;

    if (!editingIdChanged && !formDataCleared) {
      return;
    }

    if (editingId === null) {
      setSelectedTypes([]);
      setCountAllTypes(true);
      setResetCounter(prev => prev + 1);
    } else if (formData?.includedIssueTypes) {
      setSelectedTypes(formData.includedIssueTypes);
      setCountAllTypes(false);
    } else {
      setSelectedTypes([]);
      setCountAllTypes(true);
    }
  }, [editingId, isFormDataNull, formData?.includedIssueTypes]);

  // Track columns state for "All" checkbox
  const [columnsValue, setColumnsValue] = useState<string[]>(currentFormData.selectedColumns);

  // Update columns local state when formData changes
  useEffect(() => {
    // If formData has empty arrays, it means "all" - populate with all IDs for display
    const columnsToSet =
      currentFormData.selectedColumns.length === 0
        ? availableColumns.map(col => String(col.id))
        : currentFormData.selectedColumns.map(String);

    setColumnsValue(columnsToSet);
  }, [currentFormData, availableColumns]);

  // Track if "All" checkboxes should show lists
  const [showColumnsList, setShowColumnsList] = useState(() => {
    // Show list if not all columns are selected
    return currentFormData.selectedColumns.length !== availableColumns.length || availableColumns.length === 0;
  });

  // Track if user has manually toggled "All" checkbox to prevent useEffect from overriding
  const [userToggledColumns, setUserToggledColumns] = useState(false);

  // Update show lists when editingId changes (not when formData changes)
  // This only sets initial state when editing starts/ends, not when user toggles "All" checkbox
  useEffect(() => {
    if (editingId !== null && formData) {
      // Only update if user hasn't manually toggled
      if (!userToggledColumns) {
        // When editing - check if empty array (all) or all IDs selected
        const allColumnsSelected =
          formData.selectedColumns.length === 0 || // empty = all
          (formData.selectedColumns.length === availableColumns.length &&
            availableColumns.every(col => formData.selectedColumns.includes(col.id)));
        setShowColumnsList(!allColumnsSelected);
      }
    } else if (editingId === null && formData === null) {
      // Only reset to default (hide lists) when formData is also null (completely reset)
      // Don't reset if user is just typing in the form
      setShowColumnsList(false);
      setUserToggledColumns(false);
    }
  }, [editingId, formData, availableColumns, userToggledColumns]);

  // Reset toggle flags and clear validation errors when editingId changes
  useEffect(() => {
    setUserToggledColumns(false);
    form.setFields([{ name: 'person', errors: [] }]);
  }, [editingId, form]);

  // Handle form field changes — only update the specific field to avoid
  // cross-contamination (e.g., swimlane change overwriting columns representation)
  const handleFormChange = (field: string, value: any) => {
    const formDataForUpdate = formData || defaultFormData;
    settingsUi.setFormData({
      ...formDataForUpdate,
      [field]: value,
    } as FormData);
  };

  // Determine if edit button should be enabled
  const isEditMode = editingId !== null;

  // Handle form submit
  const handleSubmit = () => {
    const currentPerson: SelectedPerson | null = currentFormData.person;
    const values = form.getFieldsValue();

    const columnsToSave =
      values.selectedColumns?.length === availableColumns.length ? [] : values.selectedColumns || [];

    // Use swimlanes from store (currentFormData) since Form.Item doesn't manage it
    const swimlanesToSave = currentFormData.swimlanes;

    const issueTypesToCheck = selectedTypes.length > 0 && !countAllTypes ? selectedTypes : undefined;

    if (!currentPerson) {
      form.setFields([{ name: 'person', errors: [texts.selectPerson] }]);
      return;
    }

    if (!isEditMode && settingsUi.isDuplicate(currentPerson.name, columnsToSave, swimlanesToSave, issueTypesToCheck)) {
      form.setFields([{ name: 'person', errors: ['A limit with the same filters already exists for this person'] }]);
      return;
    }

    const formDataToSubmit: FormData = {
      person: currentPerson,
      limit: values.limit || 0,
      selectedColumns: columnsToSave,
      swimlanes: swimlanesToSave,
      showAllPersonIssues: currentFormData.showAllPersonIssues ?? true,
      ...(selectedTypes.length > 0 && !countAllTypes ? { includedIssueTypes: selectedTypes } : {}),
    };

    onAddLimit(formDataToSubmit);
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} message={<span>{texts.avatarWarning}</span>} />
        <Row gutter={16}>
          <Col span={12} style={{ paddingRight: 8 }}>
            <Form.Item
              label={texts.personJiraName}
              name="person"
              rules={[{ required: true, message: texts.selectPerson }]}
            >
              <PersonNameSelect
                id={settingsJiraDOM.idPersonName}
                searchUsers={searchUsers}
                value={currentFormData.person}
                onChange={person => handleFormChange('person', person)}
              />
            </Form.Item>

            <Form.Item
              label={texts.maxIssuesAtWork}
              name="limit"
              rules={[{ required: true, type: 'number', min: 1, message: texts.limitMinError }]}
            >
              <InputNumber
                id={settingsJiraDOM.idLimit}
                style={{ width: '100%' }}
                min={1}
                placeholder=""
                onChange={value => handleFormChange('limit', value || 0)}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 16 }}>
              <IssueTypeSelector
                key={`issue-type-selector-${editingId ?? 'new'}-${resetCounter}`}
                groupId="person-limit-form"
                selectedTypes={selectedTypes}
                initialCountAllTypes={countAllTypes}
                onSelectionChange={(types, countAll) => {
                  setSelectedTypes(types);
                  setCountAllTypes(countAll);
                  handleFormChange('includedIssueTypes', countAll ? undefined : types);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ paddingLeft: 8 }}>
            <Form.Item label={texts.columns} name="selectedColumns">
              <div>
                <Checkbox
                  style={{ marginBottom: 8 }}
                  onChange={e => {
                    setUserToggledColumns(true); // Mark that user manually toggled
                    if (e.target.checked) {
                      // When checking "All" - select all and hide list
                      const newValue = availableColumns.map(col => String(col.id));
                      form.setFieldValue('selectedColumns', newValue);
                      setColumnsValue(newValue);
                      setShowColumnsList(false);
                      handleFormChange('selectedColumns', newValue);
                    } else {
                      // When unchecking "All" - show list with all selected
                      const newValue = availableColumns.map(col => String(col.id));
                      form.setFieldValue('selectedColumns', newValue);
                      setColumnsValue(newValue);
                      setShowColumnsList(true);
                      handleFormChange('selectedColumns', newValue);
                    }
                  }}
                  checked={
                    !showColumnsList && columnsValue.length === availableColumns.length && availableColumns.length > 0
                  }
                >
                  {texts.allColumns}
                </Checkbox>
                {showColumnsList && (
                  <div
                    style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      border: '1px solid #d9d9d9',
                      borderRadius: '4px',
                      padding: '8px',
                      marginBottom: 8,
                    }}
                  >
                    <Checkbox.Group
                      style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}
                      value={columnsValue}
                      options={availableColumns.map(col => ({
                        label: col.name,
                        value: String(col.id),
                      }))}
                      onChange={values => {
                        const newValues = values as string[];
                        form.setFieldValue('selectedColumns', newValues);
                        setColumnsValue(newValues);
                        handleFormChange('selectedColumns', newValues);
                        // If all are selected again, hide the list
                        if (newValues.length === availableColumns.length) {
                          setShowColumnsList(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </Form.Item>

            <Form.Item label={texts.swimlanes}>
              <SwimlaneSelector
                swimlanes={swimlanesForSelector}
                value={currentFormData.swimlanes}
                onChange={ids => handleFormChange('swimlanes', ids)}
                label={null}
                allLabel={texts.allSwimlanes}
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={currentFormData.showAllPersonIssues ?? true}
                onChange={e => handleFormChange('showAllPersonIssues', e.target.checked)}
              >
                {texts.showAllPersonIssues}{' '}
                <Tooltip title={texts.showAllPersonIssuesTooltip}>
                  <QuestionCircleOutlined style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                </Tooltip>
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={12}>
            <Space>
              <Button
                id={isEditMode ? settingsJiraDOM.idButtonEditLimit : settingsJiraDOM.idButtonAddLimit}
                type="primary"
                htmlType="submit"
              >
                {isEditMode ? texts.updateLimit : texts.addLimit}
              </Button>
              {isEditMode && <Button onClick={() => settingsUi.setEditingId(null)}>{texts.cancel}</Button>}
            </Space>
          </Col>
        </Row>
      </Form>
      <div style={{ marginTop: 24 }}>
        <PersonalWipLimitTable
          texts={texts}
          limits={limits}
          onDelete={(id: number) => settingsUi.deleteLimit(id)}
          onEdit={(id: number) => settingsUi.setEditingId(id)}
        />
      </div>
    </>
  );
};
