import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Checkbox, ColorPicker, Form, Input, Modal, Radio, Select, Space, Spin, Switch, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { useGetStatuses } from 'src/shared/jira/stores/useGetStatuses';
import { useGetIssueLinkTypes } from 'src/shared/jira/stores/useGetIssueLinkTypes';
import type { JiraField } from 'src/shared/jira/types';
import type { ColorRule, DateMappingSource, GanttScopeSettings, SettingsScope } from '../../types';

function filterDateLikeFields(fields: JiraField[]): JiraField[] {
  return fields.filter(f => {
    const t = f.schema?.type;
    return t === 'date' || t === 'datetime' || t === 'string';
  });
}

function fieldOptionLabel(field: JiraField): string {
  return `${field.name} (${field.id})`;
}

const GANTT_SETTINGS_MODAL_TEXTS = {
  title: {
    en: 'Gantt settings',
    ru: 'Настройки Ганта',
  },
  scopeLegend: {
    en: 'Settings scope',
    ru: 'Область настроек',
  },
  scopeGlobal: {
    en: 'Global',
    ru: 'Глобально',
  },
  scopeProject: {
    en: 'Project',
    ru: 'Проект',
  },
  scopeProjectIssueType: {
    en: 'Project + issue type',
    ru: 'Проект + тип задачи',
  },
  startMapping: {
    en: 'Start of bar',
    ru: 'Начало полосы',
  },
  endMapping: {
    en: 'End of bar',
    ru: 'Конец полосы',
  },
  mappingSource: {
    en: 'Source',
    ru: 'Источник',
  },
  sourceDateField: {
    en: 'Date field',
    ru: 'Поле даты',
  },
  sourceStatusTransition: {
    en: 'Status transition',
    ru: 'Переход статуса',
  },
  startDateField: {
    en: 'Start date field',
    ru: 'Поле даты начала',
  },
  startStatus: {
    en: 'Start status',
    ru: 'Статус начала',
  },
  endDateField: {
    en: 'End date field',
    ru: 'Поле даты конца',
  },
  endStatus: {
    en: 'End status',
    ru: 'Статус конца',
  },
  tooltipFields: {
    en: 'Tooltip fields',
    ru: 'Поля подсказки',
  },
  colorRulesLegend: {
    en: 'Bar colors',
    ru: 'Цвета полос',
  },
  addColorRule: {
    en: 'Add color rule',
    ru: 'Добавить правило цвета',
  },
  removeColorRule: {
    en: 'Remove color rule',
    ru: 'Удалить правило цвета',
  },
  colorRuleField: {
    en: 'Field',
    ru: 'Поле',
  },
  colorRuleValue: {
    en: 'Value',
    ru: 'Значение',
  },
  colorRuleJql: {
    en: 'JQL',
    ru: 'JQL',
  },
  colorRuleColor: {
    en: 'Color',
    ru: 'Цвет',
  },
  colorRuleModeField: {
    en: 'Field value',
    ru: 'Значение поля',
  },
  colorRuleModeJql: {
    en: 'JQL',
    ru: 'JQL',
  },
  exclusionLegend: {
    en: 'Exclusion filters',
    ru: 'Фильтры исключения',
  },
  exclusionOrHint: {
    en: 'Issue is excluded if it matches ANY filter (OR logic)',
    ru: 'Задача исключается, если соответствует ЛЮБОМУ фильтру (логика ИЛИ)',
  },
  addExclusionFilter: {
    en: 'Add exclusion filter',
    ru: 'Добавить фильтр исключения',
  },
  removeExclusionFilter: {
    en: 'Remove exclusion filter',
    ru: 'Удалить фильтр исключения',
  },
  exclusionModeField: {
    en: 'Field value',
    ru: 'Значение поля',
  },
  exclusionModeJql: {
    en: 'JQL',
    ru: 'JQL',
  },
  exclusionFieldId: {
    en: 'Field',
    ru: 'Поле',
  },
  exclusionValue: {
    en: 'Value',
    ru: 'Значение',
  },
  exclusionJql: {
    en: 'JQL fragment',
    ru: 'Фрагмент JQL',
  },
  hideCompletedTasks: {
    en: 'Hide completed tasks (statusCategory = Done)',
    ru: 'Скрыть завершённые задачи (statusCategory = Done)',
  },
  save: {
    en: 'Save',
    ru: 'Сохранить',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
  copyFrom: {
    en: 'Copy from…',
    ru: 'Копировать из…',
  },
  noDraft: {
    en: 'No settings loaded.',
    ru: 'Настройки не загружены.',
  },
  issueInclusionLegend: {
    en: 'Issue inclusion',
    ru: 'Включение задач',
  },
  includeSubtasks: {
    en: 'Include subtasks',
    ru: 'Включать подзадачи',
  },
  includeEpicChildren: {
    en: 'Include epic children',
    ru: 'Включать дочерние эпика',
  },
  includeIssueLinks: {
    en: 'Include issue links',
    ru: 'Включать связанные задачи',
  },
  issueLinkTypesHint: {
    en: 'Restrict by link type and direction (Jira API integration pending). Leave empty to include all link types.',
    ru: 'Ограничить типом связи и направлением (интеграция с Jira API впереди). Пусто — все типы связей.',
  },
  linkTypeId: {
    en: 'Link type',
    ru: 'Тип связи',
  },
  linkDirection: {
    en: 'Direction',
    ru: 'Направление',
  },
  directionInward: {
    en: 'Inward',
    ru: 'Входящая',
  },
  directionOutward: {
    en: 'Outward',
    ru: 'Исходящая',
  },
  includeLinkTypeRow: {
    en: 'Include',
    ru: 'Включить',
  },
  addLinkTypeRow: {
    en: 'Add link type',
    ru: 'Добавить тип связи',
  },
  removeLinkTypeRow: {
    en: 'Remove link type row',
    ru: 'Удалить строку типа связи',
  },
  selectPlaceholder: {
    en: 'Select…',
    ru: 'Выберите…',
  },
} satisfies Texts<
  | 'title'
  | 'scopeLegend'
  | 'scopeGlobal'
  | 'scopeProject'
  | 'scopeProjectIssueType'
  | 'startMapping'
  | 'endMapping'
  | 'mappingSource'
  | 'sourceDateField'
  | 'sourceStatusTransition'
  | 'startDateField'
  | 'startStatus'
  | 'endDateField'
  | 'endStatus'
  | 'tooltipFields'
  | 'colorRulesLegend'
  | 'addColorRule'
  | 'removeColorRule'
  | 'colorRuleField'
  | 'colorRuleValue'
  | 'colorRuleJql'
  | 'colorRuleColor'
  | 'colorRuleModeField'
  | 'colorRuleModeJql'
  | 'exclusionLegend'
  | 'exclusionOrHint'
  | 'addExclusionFilter'
  | 'removeExclusionFilter'
  | 'exclusionModeField'
  | 'exclusionModeJql'
  | 'exclusionFieldId'
  | 'exclusionValue'
  | 'exclusionJql'
  | 'hideCompletedTasks'
  | 'save'
  | 'cancel'
  | 'copyFrom'
  | 'noDraft'
  | 'issueInclusionLegend'
  | 'includeSubtasks'
  | 'includeEpicChildren'
  | 'includeIssueLinks'
  | 'issueLinkTypesHint'
  | 'linkTypeId'
  | 'linkDirection'
  | 'directionInward'
  | 'directionOutward'
  | 'includeLinkTypeRow'
  | 'addLinkTypeRow'
  | 'removeLinkTypeRow'
  | 'selectPlaceholder'
>;

type IssueLinkFormRow = {
  enabled: boolean;
  id: string;
  direction: 'inward' | 'outward';
};

type ColorRuleFormRow = {
  selectorMode: 'field' | 'jql';
  selectorFieldId: string;
  selectorValue: string;
  selectorJql: string;
  color: string;
};

type ExclusionFilterFormRow = {
  mode: 'field' | 'jql';
  fieldId: string;
  value: string;
  jql: string;
};

type FormShape = {
  startSource: DateMappingSource;
  startDetail: string;
  endSource: DateMappingSource;
  endDetail: string;
  tooltipFieldIds: string[];
  colorRules: ColorRuleFormRow[];
  hideCompletedTasks: boolean;
  exclusionFilters: ExclusionFilterFormRow[];
  includeSubtasks: boolean;
  includeEpicChildren: boolean;
  includeIssueLinks: boolean;
  issueLinkRows: IssueLinkFormRow[];
};

function draftToFormValues(draft: GanttScopeSettings): FormShape {
  const issueLinkRows: IssueLinkFormRow[] =
    draft.issueLinkTypesToInclude.length > 0
      ? draft.issueLinkTypesToInclude.map(s => ({
          enabled: true,
          id: s.id,
          direction: s.direction,
        }))
      : [];

  return {
    startSource: draft.startMapping.source,
    startDetail:
      draft.startMapping.source === 'dateField'
        ? (draft.startMapping.fieldId ?? '')
        : (draft.startMapping.statusName ?? ''),
    endSource: draft.endMapping.source,
    endDetail:
      draft.endMapping.source === 'dateField' ? (draft.endMapping.fieldId ?? '') : (draft.endMapping.statusName ?? ''),
    tooltipFieldIds: [...draft.tooltipFieldIds],
    colorRules: (draft.colorRules ?? []).map(
      (r): ColorRuleFormRow => ({
        selectorMode: r.selector.mode,
        selectorFieldId: r.selector.fieldId ?? '',
        selectorValue: r.selector.value ?? '',
        selectorJql: r.selector.jql ?? '',
        color: r.color,
      })
    ),
    hideCompletedTasks: draft.hideCompletedTasks ?? false,
    exclusionFilters: (draft.exclusionFilters ?? []).map(
      (f): ExclusionFilterFormRow => ({
        mode: f.mode,
        fieldId: f.mode === 'field' ? (f.fieldId ?? '') : '',
        value: f.mode === 'field' ? (f.value ?? '') : '',
        jql: f.mode === 'jql' ? (f.jql ?? '') : '',
      })
    ),
    includeSubtasks: draft.includeSubtasks,
    includeEpicChildren: draft.includeEpicChildren,
    includeIssueLinks: draft.includeIssueLinks,
    issueLinkRows,
  };
}

function formValuesToPatch(values: FormShape): Partial<GanttScopeSettings> {
  const exclusionFilters = (values.exclusionFilters ?? []).map(row =>
    row.mode === 'field'
      ? { mode: 'field' as const, fieldId: row.fieldId, value: row.value }
      : { mode: 'jql' as const, jql: row.jql }
  );

  const colorRules: ColorRule[] = (values.colorRules ?? []).map(row => ({
    selector: {
      mode: row.selectorMode,
      fieldId: row.selectorMode === 'field' ? row.selectorFieldId : undefined,
      value: row.selectorMode === 'field' ? row.selectorValue : undefined,
      jql: row.selectorMode === 'jql' ? row.selectorJql : undefined,
    },
    color: row.color,
  }));

  const rows = values.issueLinkRows ?? [];
  const issueLinkTypesToInclude = values.includeIssueLinks
    ? rows.filter(r => r.enabled && r.id.trim() !== '').map(r => ({ id: r.id.trim(), direction: r.direction }))
    : [];

  return {
    startMapping:
      values.startSource === 'dateField'
        ? { source: 'dateField', fieldId: values.startDetail }
        : { source: 'statusTransition', statusName: values.startDetail },
    endMapping:
      values.endSource === 'dateField'
        ? { source: 'dateField', fieldId: values.endDetail }
        : { source: 'statusTransition', statusName: values.endDetail },
    colorRules,
    tooltipFieldIds: values.tooltipFieldIds ?? [],
    hideCompletedTasks: values.hideCompletedTasks ?? false,
    exclusionFilters,
    includeSubtasks: values.includeSubtasks,
    includeEpicChildren: values.includeEpicChildren,
    includeIssueLinks: values.includeIssueLinks,
    issueLinkTypesToInclude,
  };
}

export interface GanttSettingsFormContentProps {
  draft: GanttScopeSettings | null;
  currentScope: SettingsScope;
  onDraftChange: (patch: Partial<GanttScopeSettings>) => void;
  onScopeLevelChange: (level: SettingsScope['level']) => void;
}

/** Reusable form content for Gantt settings — used both in modal and inline in tab. */
export const GanttSettingsFormContent: React.FC<GanttSettingsFormContentProps> = ({
  draft,
  currentScope,
  onDraftChange,
  onScopeLevelChange,
}) => {
  const texts = useGetTextsByLocale(GANTT_SETTINGS_MODAL_TEXTS);
  const [form] = Form.useForm<FormShape>();
  const isApplyingDraft = useRef(false);

  const { fields, isLoading: isLoadingFields } = useGetFields();
  const { statuses, isLoading: isLoadingStatuses } = useGetStatuses();
  const { linkTypes, isLoading: isLoadingLinkTypes } = useGetIssueLinkTypes();

  const dateFieldOptions = useMemo(() => {
    return filterDateLikeFields(fields ?? []).map(f => ({
      value: f.id,
      label: fieldOptionLabel(f),
    }));
  }, [fields]);

  const tooltipFieldOptions = useMemo(() => {
    return (fields ?? []).map(f => ({
      value: f.id,
      label: fieldOptionLabel(f),
    }));
  }, [fields]);

  const exclusionFieldOptions = useMemo(() => {
    return (fields ?? []).map(f => ({
      value: f.id,
      label: fieldOptionLabel(f),
    }));
  }, [fields]);

  const statusOptions = useMemo(() => {
    const seen = new Set<string>();
    return (statuses ?? []).reduce<{ value: string; label: string }[]>((acc, s) => {
      if (seen.has(s.name)) {
        return acc;
      }
      seen.add(s.name);
      acc.push({ value: s.name, label: s.name });
      return acc;
    }, []);
  }, [statuses]);

  const issueLinkTypeOptions = useMemo(() => {
    return (linkTypes ?? []).map(lt => ({
      value: lt.id,
      label: `${lt.name} (${lt.inward} / ${lt.outward})`,
    }));
  }, [linkTypes]);

  useEffect(() => {
    if (!draft) return;
    isApplyingDraft.current = true;
    form.setFieldsValue(draftToFormValues(draft));
    queueMicrotask(() => {
      isApplyingDraft.current = false;
    });
  }, [draft, form]);

  const handleValuesChange = useCallback(
    (_changed: Partial<FormShape>, allValues: FormShape) => {
      if (isApplyingDraft.current || !draft) {
        return;
      }
      onDraftChange(formValuesToPatch(allValues));
    },
    [draft, onDraftChange]
  );

  const handleScopeLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onScopeLevelChange(e.target.value as SettingsScope['level']);
    },
    [onScopeLevelChange]
  );

  const sourceOptions = [
    { value: 'dateField' as const, label: texts.sourceDateField },
    { value: 'statusTransition' as const, label: texts.sourceStatusTransition },
  ];

  const selectFilterOption = (input: string, option?: { label?: string }) =>
    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase());

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <div role="radiogroup" aria-label={texts.scopeLegend}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>{texts.scopeLegend}</div>
        <Radio.Group value={currentScope.level} onChange={handleScopeLevelChange}>
          <Radio value="global">{texts.scopeGlobal}</Radio>
          <Radio value="project">{texts.scopeProject}</Radio>
          <Radio value="projectIssueType">{texts.scopeProjectIssueType}</Radio>
        </Radio.Group>
      </div>

      {!draft ? (
        <span>{texts.noDraft}</span>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          initialValues={draftToFormValues(draft)}
        >
          <div style={{ fontWeight: 500, marginBottom: 8 }}>{texts.startMapping}</div>
          <Space wrap style={{ width: '100%' }} align="start">
            <Form.Item
              name="startSource"
              label={texts.mappingSource}
              rules={[{ required: true }]}
              style={{ minWidth: 200 }}
            >
              <Select virtual={false} options={sourceOptions} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.startSource !== cur.startSource}>
              {() =>
                form.getFieldValue('startSource') !== 'statusTransition' ? (
                  <Form.Item
                    name="startDetail"
                    label={texts.startDateField}
                    rules={[{ required: true }]}
                    style={{ flex: 1, minWidth: 200 }}
                  >
                    <Select
                      virtual={false}
                      showSearch
                      optionFilterProp="label"
                      filterOption={selectFilterOption}
                      placeholder={texts.selectPlaceholder}
                      loading={isLoadingFields}
                      notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                      options={dateFieldOptions}
                      style={{ minWidth: 260 }}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="startDetail"
                    label={texts.startStatus}
                    rules={[{ required: true }]}
                    style={{ flex: 1, minWidth: 200 }}
                  >
                    <Select
                      virtual={false}
                      showSearch
                      optionFilterProp="label"
                      filterOption={selectFilterOption}
                      placeholder={texts.selectPlaceholder}
                      loading={isLoadingStatuses}
                      notFoundContent={isLoadingStatuses ? <Spin size="small" /> : null}
                      options={statusOptions}
                      style={{ minWidth: 260 }}
                    />
                  </Form.Item>
                )
              }
            </Form.Item>
          </Space>

          <div style={{ fontWeight: 500, marginBottom: 8 }}>{texts.endMapping}</div>
          <Space wrap style={{ width: '100%' }} align="start">
            <Form.Item
              name="endSource"
              label={texts.mappingSource}
              rules={[{ required: true }]}
              style={{ minWidth: 200 }}
            >
              <Select virtual={false} options={sourceOptions} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.endSource !== cur.endSource}>
              {() =>
                form.getFieldValue('endSource') !== 'statusTransition' ? (
                  <Form.Item
                    name="endDetail"
                    label={texts.endDateField}
                    rules={[{ required: true }]}
                    style={{ flex: 1, minWidth: 200 }}
                  >
                    <Select
                      virtual={false}
                      showSearch
                      optionFilterProp="label"
                      filterOption={selectFilterOption}
                      placeholder={texts.selectPlaceholder}
                      loading={isLoadingFields}
                      notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                      options={dateFieldOptions}
                      style={{ minWidth: 260 }}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="endDetail"
                    label={texts.endStatus}
                    rules={[{ required: true }]}
                    style={{ flex: 1, minWidth: 200 }}
                  >
                    <Select
                      virtual={false}
                      showSearch
                      optionFilterProp="label"
                      filterOption={selectFilterOption}
                      placeholder={texts.selectPlaceholder}
                      loading={isLoadingStatuses}
                      notFoundContent={isLoadingStatuses ? <Spin size="small" /> : null}
                      options={statusOptions}
                      style={{ minWidth: 260 }}
                    />
                  </Form.Item>
                )
              }
            </Form.Item>
          </Space>

          <Form.Item name="tooltipFieldIds" label={texts.tooltipFields}>
            <Select
              data-testid="gantt-settings-tooltip-fields-select"
              virtual={false}
              mode="multiple"
              showSearch
              optionFilterProp="label"
              filterOption={selectFilterOption}
              placeholder={texts.selectPlaceholder}
              loading={isLoadingFields}
              notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
              options={tooltipFieldOptions}
            />
          </Form.Item>

          <div style={{ fontWeight: 500, marginBottom: 8 }}>{texts.colorRulesLegend}</div>
          <Form.List name="colorRules">
            {(listFields, { add, remove }) => (
              <>
                {listFields.map(({ key, name, ...restField }) => (
                  <Space key={key} wrap align="start" style={{ display: 'flex', marginBottom: 8, width: '100%' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'selectorMode']}
                      label={texts.mappingSource}
                      rules={[{ required: true }]}
                      style={{ marginBottom: 0, minWidth: 160 }}
                    >
                      <Select
                        virtual={false}
                        options={[
                          { value: 'field' as const, label: texts.colorRuleModeField },
                          { value: 'jql' as const, label: texts.colorRuleModeJql },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item noStyle dependencies={[['colorRules', name, 'selectorMode']]}>
                      {() =>
                        form.getFieldValue(['colorRules', name, 'selectorMode']) === 'field' ? (
                          <Space wrap align="start">
                            <Form.Item
                              {...restField}
                              name={[name, 'selectorFieldId']}
                              label={texts.colorRuleField}
                              style={{ marginBottom: 0, minWidth: 200 }}
                            >
                              <Select
                                virtual={false}
                                showSearch
                                optionFilterProp="label"
                                filterOption={selectFilterOption}
                                placeholder={texts.selectPlaceholder}
                                loading={isLoadingFields}
                                notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                                options={exclusionFieldOptions}
                                style={{ minWidth: 220 }}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'selectorValue']}
                              label={texts.colorRuleValue}
                              style={{ marginBottom: 0, minWidth: 160 }}
                            >
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Space>
                        ) : (
                          <Form.Item
                            {...restField}
                            name={[name, 'selectorJql']}
                            label={texts.colorRuleJql}
                            style={{ marginBottom: 0, flex: 1, minWidth: 200 }}
                          >
                            <Input autoComplete="off" />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'color']} rules={[{ required: true }]} hidden>
                      <input type="hidden" />
                    </Form.Item>
                    <Form.Item label={texts.colorRuleColor} style={{ marginBottom: 0, minWidth: 160 }}>
                      <ColorPicker
                        value={form.getFieldValue(['colorRules', name, 'color'])}
                        onChange={color => {
                          const hexStr = typeof color === 'string' ? color : color.toHexString();
                          form.setFieldValue(['colorRules', name, 'color'], hexStr);
                          const allValues = form.getFieldsValue(true) as FormShape;
                          handleValuesChange({}, allValues);
                        }}
                        showText
                        size="small"
                      />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={texts.removeColorRule}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      selectorMode: 'field',
                      selectorFieldId: '',
                      selectorValue: '',
                      selectorJql: '',
                      color: '#FF5630',
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  {texts.addColorRule}
                </Button>
              </>
            )}
          </Form.List>

          <div style={{ fontWeight: 500, marginBottom: 8 }}>{texts.issueInclusionLegend}</div>
          <Form.Item name="includeSubtasks" label={texts.includeSubtasks} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="includeEpicChildren" label={texts.includeEpicChildren} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="includeIssueLinks" label={texts.includeIssueLinks} valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.includeIssueLinks !== cur.includeIssueLinks}>
            {() =>
              form.getFieldValue('includeIssueLinks') ? (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 8, color: 'var(--ant-color-text-secondary)' }}>
                    {texts.issueLinkTypesHint}
                  </div>
                  <Form.List name="issueLinkRows">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Space
                            key={key}
                            wrap
                            align="center"
                            style={{ display: 'flex', marginBottom: 8, width: '100%' }}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'enabled']}
                              valuePropName="checked"
                              style={{ marginBottom: 0 }}
                              label={texts.includeLinkTypeRow}
                            >
                              <Checkbox />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'id']}
                              style={{ marginBottom: 0, flex: 1, minWidth: 160 }}
                              label={texts.linkTypeId}
                            >
                              <Select
                                data-testid={`gantt-settings-link-type-select-${name}`}
                                virtual={false}
                                showSearch
                                optionFilterProp="label"
                                filterOption={selectFilterOption}
                                placeholder={texts.selectPlaceholder}
                                loading={isLoadingLinkTypes}
                                notFoundContent={isLoadingLinkTypes ? <Spin size="small" /> : null}
                                options={issueLinkTypeOptions}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'direction']}
                              style={{ marginBottom: 0, minWidth: 140 }}
                              label={texts.linkDirection}
                            >
                              <Select
                                virtual={false}
                                options={[
                                  { value: 'inward' as const, label: texts.directionInward },
                                  { value: 'outward' as const, label: texts.directionOutward },
                                ]}
                              />
                            </Form.Item>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              aria-label={texts.removeLinkTypeRow}
                              onClick={() => remove(name)}
                            />
                          </Space>
                        ))}
                        <Button
                          type="dashed"
                          onClick={() => add({ enabled: true, id: '', direction: 'outward' })}
                          block
                          icon={<PlusOutlined />}
                        >
                          {texts.addLinkTypeRow}
                        </Button>
                      </>
                    )}
                  </Form.List>
                </div>
              ) : null
            }
          </Form.Item>

          <Form.Item name="hideCompletedTasks" label={texts.hideCompletedTasks} valuePropName="checked">
            <Checkbox />
          </Form.Item>

          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            {texts.exclusionLegend}{' '}
            <Tooltip title={texts.exclusionOrHint}>
              <InfoCircleOutlined style={{ color: 'var(--ant-color-text-secondary)' }} />
            </Tooltip>
          </div>
          <Form.List name="exclusionFilters">
            {(listFields, { add, remove }) => (
              <>
                {listFields.map(({ key, name, ...restField }) => (
                  <Space key={key} wrap align="start" style={{ display: 'flex', marginBottom: 8, width: '100%' }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'mode']}
                      label={texts.mappingSource}
                      rules={[{ required: true }]}
                      style={{ marginBottom: 0, minWidth: 160 }}
                    >
                      <Select
                        virtual={false}
                        options={[
                          { value: 'field' as const, label: texts.exclusionModeField },
                          { value: 'jql' as const, label: texts.exclusionModeJql },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item noStyle dependencies={[['exclusionFilters', name, 'mode']]}>
                      {() =>
                        form.getFieldValue(['exclusionFilters', name, 'mode']) === 'field' ? (
                          <Space wrap align="start">
                            <Form.Item
                              {...restField}
                              name={[name, 'fieldId']}
                              label={texts.exclusionFieldId}
                              style={{ marginBottom: 0, minWidth: 200 }}
                            >
                              <Select
                                virtual={false}
                                showSearch
                                optionFilterProp="label"
                                filterOption={selectFilterOption}
                                placeholder={texts.selectPlaceholder}
                                loading={isLoadingFields}
                                notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                                options={exclusionFieldOptions}
                                style={{ minWidth: 220 }}
                              />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'value']}
                              label={texts.exclusionValue}
                              style={{ marginBottom: 0, minWidth: 160 }}
                            >
                              <Input autoComplete="off" />
                            </Form.Item>
                          </Space>
                        ) : (
                          <Form.Item
                            {...restField}
                            name={[name, 'jql']}
                            label={texts.exclusionJql}
                            style={{ marginBottom: 0, flex: 1, minWidth: 200 }}
                          >
                            <Input autoComplete="off" />
                          </Form.Item>
                        )
                      }
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      aria-label={texts.removeExclusionFilter}
                      onClick={() => remove(name)}
                    />
                  </Space>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add({ mode: 'field', fieldId: '', value: '', jql: '' })}
                  block
                  icon={<PlusOutlined />}
                >
                  {texts.addExclusionFilter}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      )}
    </Space>
  );
};

export interface GanttSettingsModalProps {
  visible: boolean;
  draft: GanttScopeSettings | null;
  currentScope: SettingsScope;
  onDraftChange: (patch: Partial<GanttScopeSettings>) => void;
  onSave: () => void;
  onCancel: () => void;
  onScopeLevelChange: (level: SettingsScope['level']) => void;
  onCopyFrom: () => void;
}

/** Modal wrapper around {@link GanttSettingsFormContent}. Used for standalone settings (gear button). */
export const GanttSettingsModal: React.FC<GanttSettingsModalProps> = ({
  visible,
  draft,
  currentScope,
  onDraftChange,
  onSave,
  onCancel,
  onScopeLevelChange,
  onCopyFrom,
}) => {
  const texts = useGetTextsByLocale(GANTT_SETTINGS_MODAL_TEXTS);

  return (
    <Modal
      open={visible}
      title={texts.title}
      onCancel={onCancel}
      zIndex={1010}
      width={640}
      maskClosable={false}
      destroyOnClose
      getContainer={false}
      footer={[
        <Button key="copy" onClick={onCopyFrom}>
          {texts.copyFrom}
        </Button>,
        <Button key="cancel" onClick={onCancel}>
          {texts.cancel}
        </Button>,
        <Button key="save" type="primary" onClick={onSave} disabled={!draft}>
          {texts.save}
        </Button>,
      ]}
    >
      <GanttSettingsFormContent
        draft={draft}
        currentScope={currentScope}
        onDraftChange={onDraftChange}
        onScopeLevelChange={onScopeLevelChange}
      />
    </Modal>
  );
};
