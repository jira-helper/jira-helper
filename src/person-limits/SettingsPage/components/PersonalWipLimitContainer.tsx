import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Alert, Form, InputNumber, Button, Space, Row, Col, Checkbox } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { SearchUsers } from 'src/shared/di/jiraApiTokens';
import { IssueTypeSelector } from '../../../shared/components/IssueTypeSelector';
import { PersonalWipLimitTable } from './PersonalWipLimitTable';
import { PersonNameSelect } from './PersonNameSelect';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { FormData, Column, Swimlane } from '../state/types';
import type { SelectedPerson } from '../stores/settingsUIStore.types';
import { settingsJiraDOM } from '../constants';

const TEXTS = {
  avatarWarning: {
    en: 'To work correctly, the person must have a Jira avatar.',
    ru: 'Чтобы WIP-лимиты на человека работали корректно, у пользователя должен быть установлен аватар.',
  },
};

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
  // Zustand automatically subscribes component to changes
  const { data, actions } = useSettingsUIStore();
  const { limits, editingId, formData } = data;
  const texts = useGetTextsByLocale(TEXTS);
  const [form] = Form.useForm();

  // Filter out kanban columns
  const availableColumns = useMemo(() => columns.filter(col => !col.isKanPlanColumn), [columns]);

  // Prepare default values for swimlanes (normalize to strings for Checkbox.Group matching)
  const defaultSwimlaneIds = useMemo(
    () => swimlanes.map((swim, index) => String((swim as any).id ?? swim.name ?? `swimlane-${index}`)),
    [swimlanes]
  );

  // Default form values (all columns and swimlanes selected; ids as strings for Checkbox.Group)
  const defaultFormData = useMemo<FormData>(
    () => ({
      person: null,
      limit: 1,
      selectedColumns: availableColumns.map(col => String(col.id)),
      swimlanes: defaultSwimlaneIds,
    }),
    [availableColumns, defaultSwimlaneIds]
  );

  // Current form data (from props or defaults)
  const currentFormData: FormData = formData || defaultFormData;

  // Initialize form when formData changes
  useEffect(() => {
    if (formData) {
      const columnsToShow =
        formData.selectedColumns.length === 0
          ? availableColumns.map(col => String(col.id))
          : formData.selectedColumns.map(String);

      const swimlanesToShow = formData.swimlanes.length === 0 ? defaultSwimlaneIds : formData.swimlanes.map(String);

      form.setFieldsValue({
        person: formData.person,
        limit: formData.limit,
        selectedColumns: columnsToShow,
        swimlanes: swimlanesToShow,
      });
    } else {
      form.setFieldsValue({
        person: null,
        limit: 1,
        selectedColumns: defaultFormData.selectedColumns,
        swimlanes: defaultFormData.swimlanes,
      });
    }
  }, [formData, form, defaultFormData, availableColumns, defaultSwimlaneIds]);

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

  // Track columns and swimlanes state for "All" checkboxes
  const [columnsValue, setColumnsValue] = useState<string[]>(currentFormData.selectedColumns);
  const [swimlanesValue, setSwimlanesValue] = useState<string[]>(currentFormData.swimlanes);

  // Update local state when formData changes
  useEffect(() => {
    // If formData has empty arrays, it means "all" - populate with all IDs for display
    const columnsToSet =
      currentFormData.selectedColumns.length === 0
        ? availableColumns.map(col => String(col.id))
        : currentFormData.selectedColumns.map(String);

    const swimlanesToSet =
      currentFormData.swimlanes.length === 0 ? defaultSwimlaneIds : currentFormData.swimlanes.map(String);

    setColumnsValue(columnsToSet);
    setSwimlanesValue(swimlanesToSet);
  }, [currentFormData, availableColumns, defaultSwimlaneIds]);

  // Track if "All" checkboxes should show lists
  const [showColumnsList, setShowColumnsList] = useState(() => {
    // Show list if not all columns are selected
    return currentFormData.selectedColumns.length !== availableColumns.length || availableColumns.length === 0;
  });

  const [showSwimlanesList, setShowSwimlanesList] = useState(() => {
    // Show list if not all swimlanes are selected
    return currentFormData.swimlanes.length !== defaultSwimlaneIds.length || defaultSwimlaneIds.length === 0;
  });

  // Track if user has manually toggled "All" checkbox to prevent useEffect from overriding
  const [userToggledColumns, setUserToggledColumns] = useState(false);
  const [userToggledSwimlanes, setUserToggledSwimlanes] = useState(false);

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

      if (!userToggledSwimlanes) {
        const allSwimlanesSelected =
          formData.swimlanes.length === 0 || // empty = all
          (formData.swimlanes.length === defaultSwimlaneIds.length &&
            defaultSwimlaneIds.every(id => formData.swimlanes.includes(id)));
        setShowSwimlanesList(!allSwimlanesSelected);
      }
    } else if (editingId === null && formData === null) {
      // Only reset to default (hide lists) when formData is also null (completely reset)
      // Don't reset if user is just typing in the form
      setShowColumnsList(false);
      setShowSwimlanesList(false);
      setUserToggledColumns(false);
      setUserToggledSwimlanes(false);
    }
  }, [editingId, formData, availableColumns, defaultSwimlaneIds, userToggledColumns, userToggledSwimlanes]);

  // Reset toggle flags and clear validation errors when editingId changes
  useEffect(() => {
    setUserToggledColumns(false);
    setUserToggledSwimlanes(false);
    form.setFields([{ name: 'person', errors: [] }]);
  }, [editingId, form]);

  // Handle form field changes — only update the specific field to avoid
  // cross-contamination (e.g., swimlane change overwriting columns representation)
  const handleFormChange = (field: string, value: any) => {
    const formDataForUpdate = formData || defaultFormData;
    actions.setFormData({
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

    const swimlanesToSave = values.swimlanes?.length === defaultSwimlaneIds.length ? [] : values.swimlanes || [];

    const issueTypesToCheck = selectedTypes.length > 0 && !countAllTypes ? selectedTypes : undefined;

    if (!currentPerson) {
      form.setFields([{ name: 'person', errors: ['Select a person'] }]);
      return;
    }

    if (!isEditMode && actions.isDuplicate(currentPerson.name, columnsToSave, swimlanesToSave, issueTypesToCheck)) {
      form.setFields([{ name: 'person', errors: ['A limit with the same filters already exists for this person'] }]);
      return;
    }

    const formDataToSubmit: FormData = {
      person: currentPerson,
      limit: values.limit || 0,
      selectedColumns: columnsToSave,
      swimlanes: swimlanesToSave,
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
            <Form.Item label="Person JIRA name" name="person" rules={[{ required: true, message: 'Select a person' }]}>
              <PersonNameSelect
                id={settingsJiraDOM.idPersonName}
                searchUsers={searchUsers}
                value={currentFormData.person}
                onChange={person => handleFormChange('person', person)}
              />
            </Form.Item>

            <Form.Item
              label="Max issues at work"
              name="limit"
              rules={[{ required: true, type: 'number', min: 1, message: 'Limit must be at least 1' }]}
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
            <Form.Item label="Columns" name="selectedColumns">
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
                  All columns
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

            <Form.Item label="Swimlanes" name="swimlanes">
              <div>
                <Checkbox
                  style={{ marginBottom: 8 }}
                  onChange={e => {
                    setUserToggledSwimlanes(true); // Mark that user manually toggled
                    if (e.target.checked) {
                      // When checking "All" - select all and hide list
                      form.setFieldValue('swimlanes', defaultSwimlaneIds);
                      setSwimlanesValue(defaultSwimlaneIds);
                      setShowSwimlanesList(false);
                      handleFormChange('swimlanes', defaultSwimlaneIds);
                    } else {
                      // When unchecking "All" - show list with all selected
                      form.setFieldValue('swimlanes', defaultSwimlaneIds);
                      setSwimlanesValue(defaultSwimlaneIds);
                      setShowSwimlanesList(true);
                      handleFormChange('swimlanes', defaultSwimlaneIds);
                    }
                  }}
                  checked={
                    !showSwimlanesList &&
                    swimlanesValue.length === defaultSwimlaneIds.length &&
                    defaultSwimlaneIds.length > 0
                  }
                >
                  All swimlanes
                </Checkbox>
                {showSwimlanesList && (
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
                      value={swimlanesValue}
                      options={swimlanes.map((swim, index) => {
                        // Use name as id if id is not available; normalize to string for matching
                        const swimId = (swim as any).id || swim.name || `swimlane-${index}`;
                        return {
                          label: swim.name,
                          value: String(swimId),
                        };
                      })}
                      onChange={values => {
                        const newValues = values as string[];
                        form.setFieldValue('swimlanes', newValues);
                        setSwimlanesValue(newValues);
                        handleFormChange('swimlanes', newValues);
                        if (newValues.length === defaultSwimlaneIds.length) {
                          setShowSwimlanesList(false);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
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
                {isEditMode ? 'Edit limit' : 'Add limit'}
              </Button>
              {isEditMode && <Button onClick={() => actions.setEditingId(null)}>Cancel</Button>}
            </Space>
          </Col>
        </Row>
      </Form>
      <div style={{ marginTop: 24 }}>
        <PersonalWipLimitTable
          limits={limits}
          onDelete={(id: number) => actions.deleteLimit(id)}
          onEdit={(id: number) => actions.setEditingId(id)}
        />
      </div>
    </>
  );
};
