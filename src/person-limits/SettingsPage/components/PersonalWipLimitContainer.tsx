/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Alert, Form, Input, InputNumber, Button, Space, Row, Col, Checkbox } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import { IssueTypeSelector } from '../../../shared/components/IssueTypeSelector';
import { PersonalWipLimitTable } from './PersonalWipLimitTable';
import { useSettingsUIStore } from '../stores/settingsUIStore';
import type { FormData, Column, Swimlane } from '../state/types';
import { settingsJiraDOM } from '../constants';

const TEXTS = {
  avatarWarning: {
    en: 'To work correctly, the person must have a Jira avatar.',
    ru: 'Чтобы WIP-лимиты на человека работали корректно, у пользователя должен быть установлен аватар.',
  },
};

export interface PersonalWipLimitContainerProps {
  // Available options
  columns: Column[];
  swimlanes: Swimlane[];

  // Callbacks
  onAddLimit: (data: FormData) => void;
}

export const PersonalWipLimitContainer: React.FC<PersonalWipLimitContainerProps> = ({
  columns,
  swimlanes,
  onAddLimit,
}) => {
  // Zustand automatically subscribes component to changes
  const { data, actions } = useSettingsUIStore();
  const { limits, checkedIds, editingId, formData } = data;
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
      personName: '',
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
      // Editing mode - set form values from formData
      // If selectedColumns/swimlanes are empty arrays, it means "all" - populate with all IDs
      const columnsToShow =
        formData.selectedColumns.length === 0
          ? availableColumns.map(col => String(col.id)) // empty array = all columns
          : formData.selectedColumns.map(String);

      const swimlanesToShow =
        formData.swimlanes.length === 0
          ? defaultSwimlaneIds // empty array = all swimlanes
          : formData.swimlanes.map(String);

      form.setFieldsValue({
        personName: formData.personName,
        limit: formData.limit,
        selectedColumns: columnsToShow,
        swimlanes: swimlanesToShow,
      });
    } else {
      // New limit mode - set defaults
      form.setFieldsValue({
        personName: '',
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

  // Track previous editingId to detect mode changes (not formData changes)
  const prevEditingIdRef = useRef<number | null>(null);

  // Reset issue types when switching between add/edit modes (only when editingId changes)
  useEffect(() => {
    const editingIdChanged = prevEditingIdRef.current !== editingId;
    prevEditingIdRef.current = editingId;

    // Only reset state when editingId actually changes (mode switch), not on formData changes
    if (!editingIdChanged) {
      // formData changed but editingId didn't - don't reset user input
      return;
    }

    // Reset logic only runs when editingId changes
    if (editingId === null) {
      // Reset to defaults when exiting edit mode or after successful add
      setSelectedTypes([]);
      setCountAllTypes(true);
      setResetCounter(prev => prev + 1); // Force remount of IssueTypeSelector
    } else if (formData?.includedIssueTypes) {
      setSelectedTypes(formData.includedIssueTypes);
      setCountAllTypes(false);
    } else {
      setSelectedTypes([]);
      setCountAllTypes(true);
    }
  }, [editingId, formData?.includedIssueTypes]);

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

  // Reset toggle flags when editingId changes
  useEffect(() => {
    setUserToggledColumns(false);
    setUserToggledSwimlanes(false);
  }, [editingId]);

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    const currentValues = form.getFieldsValue();
    const formDataForUpdate = formData || defaultFormData;
    const newFormData: Partial<FormData> = {
      ...formDataForUpdate,
      ...currentValues,
      [field]: value,
    };
    actions.setFormData(newFormData as FormData);
  };

  // Determine if edit button should be enabled
  const isEditMode = editingId !== null;

  // Handle form submit
  const handleSubmit = (values: any) => {
    // If all columns/swimlanes are selected, save empty array (meaning "all")
    const columnsToSave =
      values.selectedColumns?.length === availableColumns.length
        ? [] // all selected = empty array (meaning "all")
        : values.selectedColumns || [];

    const swimlanesToSave =
      values.swimlanes?.length === defaultSwimlaneIds.length
        ? [] // all selected = empty array (meaning "all")
        : values.swimlanes || [];

    const formDataToSubmit: FormData = {
      personName: values.personName || '',
      limit: values.limit || 0,
      selectedColumns: columnsToSave,
      swimlanes: swimlanesToSave,
      ...(selectedTypes.length > 0 && !countAllTypes ? { includedIssueTypes: selectedTypes } : {}),
    };

    // onAddLimit callback will check editingId and handle add/edit accordingly
    onAddLimit(formDataToSubmit);
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Alert type="warning" showIcon style={{ marginBottom: 16 }} message={<span>{texts.avatarWarning}</span>} />
        <Row gutter={16}>
          <Col span={12} style={{ paddingRight: 8 }}>
            <Form.Item label="Person JIRA name" name="personName">
              <Input
                id={settingsJiraDOM.idPersonName}
                placeholder=""
                onChange={e => handleFormChange('personName', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Max issues at work" name="limit">
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
                <Button
                  id={settingsJiraDOM.idApplyColumnSelect}
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => {
                    const values = form.getFieldsValue();
                    const formDataForApply: FormData = {
                      personName: values.personName || '',
                      limit: values.limit || 0,
                      selectedColumns: values.selectedColumns || [],
                      swimlanes: values.swimlanes || [],
                      ...(selectedTypes.length > 0 && !countAllTypes ? { includedIssueTypes: selectedTypes } : {}),
                    };
                    // Apply columns to selected limits
                    const columnsToApply = formDataForApply.selectedColumns
                      .map(id => {
                        const col = columns.find(c => c.id === id);
                        return col ? { id: col.id, name: col.name } : null;
                      })
                      .filter((col): col is { id: string; name: string } => col !== null);
                    actions.applyColumnsToSelected(columnsToApply);
                  }}
                >
                  Apply columns for selected users
                </Button>
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
                <Button
                  id={settingsJiraDOM.idApplySwimlaneSelect}
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => {
                    const values = form.getFieldsValue();
                    const formDataForApply: FormData = {
                      personName: values.personName || '',
                      limit: values.limit || 0,
                      selectedColumns: values.selectedColumns || [],
                      swimlanes: values.swimlanes || [],
                      ...(selectedTypes.length > 0 && !countAllTypes ? { includedIssueTypes: selectedTypes } : {}),
                    };
                    // Apply swimlanes to selected limits
                    const swimlanesToApply = formDataForApply.swimlanes
                      .map(id => {
                        const swim = swimlanes.find(s => (s as any).id === id || s.name === id);
                        return swim ? { id: (swim as any).id || swim.name, name: swim.name } : null;
                      })
                      .filter((swim): swim is { id: string; name: string } => swim !== null);
                    actions.applySwimlanesToSelected(swimlanesToApply);
                  }}
                >
                  Apply swimlanes for selected users
                </Button>
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
          onCheckboxChange={(id: number, checked: boolean) => {
            if (checked) {
              actions.toggleChecked(id);
            } else {
              actions.setCheckedIds(checkedIds.filter(pid => pid !== id));
            }
          }}
          checkedIds={checkedIds}
        />
      </div>
    </>
  );
};
