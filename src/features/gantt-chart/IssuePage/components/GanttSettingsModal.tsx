import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  ColorPicker,
  Empty,
  Form,
  Input,
  Modal,
  Alert,
  Segmented,
  Select,
  Spin,
  Switch,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import type { FormInstance } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CopyOutlined,
  BarChartOutlined,
  BranchesOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import { useGetFields } from 'src/infrastructure/jira/fields/useGetFields';
import { useGetStatuses } from 'src/shared/jira/stores/useGetStatuses';
import { useGetIssueLinkTypes } from 'src/infrastructure/jira/stores/useGetIssueLinkTypes';
import type { JiraField } from 'src/infrastructure/jira/types';
import type {
  ColorRule,
  DateMapping,
  DateMappingSource,
  GanttScopeSettings,
  QuickFilter,
  SettingsScope,
} from '../../types';
import { parseJql } from 'src/shared/jql/simpleJqlParser';
import { stopJiraHotkeys } from 'src/shared/dom/stopJiraHotkeys';
import './gantt-ui.css';

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
  scopeContextGlobal: {
    en: 'Editing default settings for all projects',
    ru: 'Редактируются настройки по умолчанию для всех проектов',
  },
  scopeContextProject: {
    en: 'Editing settings for project {project}',
    ru: 'Редактируются настройки для проекта {project}',
  },
  scopeContextProjectIssueType: {
    en: 'Editing settings for {project} › {issueType}',
    ru: 'Редактируются настройки для {project} › {issueType}',
  },
  tabBars: {
    en: 'Bars',
    ru: 'Полосы',
  },
  tabIssues: {
    en: 'Issues',
    ru: 'Задачи',
  },
  tabFilters: {
    en: 'Filters',
    ru: 'Фильтры',
  },
  startMapping: {
    en: 'Start of bar',
    ru: 'Начало полосы',
  },
  endMapping: {
    en: 'End of bar',
    ru: 'Конец полосы',
  },
  startMappingHint: {
    en: 'For each task, the first matching rule produces the date. Use ↑/↓ to reorder — the topmost match wins.',
    ru: 'Для каждой задачи берётся первое сверху правило, которое даёт дату. Используйте ↑/↓ — выигрывает верхнее.',
  },
  endMappingHint: {
    en: 'For each task, the first matching rule produces the date. Tasks with no end date are drawn as open-ended.',
    ru: 'Для каждой задачи берётся первое сверху правило, которое даёт дату. Задачи без даты конца рисуются «открытыми».',
  },
  addStartMapping: {
    en: 'Add another start source',
    ru: 'Добавить ещё один источник начала',
  },
  addEndMapping: {
    en: 'Add another end source',
    ru: 'Добавить ещё один источник конца',
  },
  removeMapping: {
    en: 'Remove rule',
    ru: 'Удалить правило',
  },
  moveMappingUp: {
    en: 'Move up (higher priority)',
    ru: 'Поднять выше (выше приоритет)',
  },
  moveMappingDown: {
    en: 'Move down (lower priority)',
    ru: 'Опустить ниже (ниже приоритет)',
  },
  mappingPriorityBadge: {
    en: 'Priority',
    ru: 'Приоритет',
  },
  mappingSource: {
    en: 'Source',
    ru: 'Источник',
  },
  ruleMatchBy: {
    en: 'Match by',
    ru: 'Сопоставить по',
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
    en: 'Bar tooltip fields',
    ru: 'Поля подсказки полосы',
  },
  tooltipFieldsHint: {
    en: 'Fields shown in the bar tooltip on hover.',
    ru: 'Поля, отображаемые в подсказке при наведении на полосу.',
  },
  colorRulesHint: {
    en: 'Override bar color based on field value or JQL (e.g. priority = Critical → red).',
    ru: 'Переопределить цвет полосы по значению поля или JQL (напр. priority = Critical → красный).',
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
  colorRuleName: {
    en: 'Name',
    ru: 'Название',
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
    en: 'Issue is excluded if it matches ANY filter (OR logic).',
    ru: 'Задача исключается, если соответствует ЛЮБОМУ фильтру (логика ИЛИ).',
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
  quickFiltersLegend: {
    en: 'Quick filters',
    ru: 'Быстрые фильтры',
  },
  quickFiltersHint: {
    en: 'Saved presets shown as toggleable chips on the toolbar. Multiple active chips combine via AND. Built-in chips (Unresolved, Hide completed) are always available.',
    ru: 'Сохранённые пресеты, появляющиеся в виде переключаемых «чипов» на тулбаре. Несколько активных чипов объединяются через И. Встроенные чипы (Unresolved, Hide completed) доступны всегда.',
  },
  addQuickFilter: {
    en: 'Add quick filter',
    ru: 'Добавить быстрый фильтр',
  },
  removeQuickFilter: {
    en: 'Remove quick filter',
    ru: 'Удалить быстрый фильтр',
  },
  moveQuickFilterUp: {
    en: 'Move up',
    ru: 'Поднять выше',
  },
  moveQuickFilterDown: {
    en: 'Move down',
    ru: 'Опустить ниже',
  },
  quickFilterName: {
    en: 'Chip label',
    ru: 'Подпись чипа',
  },
  quickFilterModeField: {
    en: 'Field value',
    ru: 'Значение поля',
  },
  quickFilterModeJql: {
    en: 'JQL',
    ru: 'JQL',
  },
  quickFilterFieldId: {
    en: 'Field',
    ru: 'Поле',
  },
  quickFilterValue: {
    en: 'Value',
    ru: 'Значение',
  },
  quickFilterJql: {
    en: 'JQL fragment',
    ru: 'Фрагмент JQL',
  },
  quickFilterJqlError: {
    en: 'Invalid JQL: {error}',
    ru: 'Неверный JQL: {error}',
  },
  quickFilterNamePlaceholder: {
    en: 'e.g. My team',
    ru: 'напр. Моя команда',
  },
  quickFilterJqlPlaceholder: {
    en: 'project = TRPA AND priority = High',
    ru: 'project = TRPA AND priority = High',
  },
  save: {
    en: 'Save',
    ru: 'Сохранить',
  },
  saveDisabledHasErrors: {
    en: 'Fix the highlighted errors before saving.',
    ru: 'Исправьте выделенные ошибки перед сохранением.',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
  copyFrom: {
    en: 'Copy from…',
    ru: 'Копировать из…',
  },
  copyFromHint: {
    en: 'Replace current draft with settings from another scope.',
    ru: 'Заменить текущий черновик настройками из другой области.',
  },
  noDraftTitle: {
    en: 'No settings for this scope yet',
    ru: 'Для этой области пока нет настроек',
  },
  noDraftDescription: {
    en: 'Pick a starting point — copy from a wider scope, or open that wider scope to create them.',
    ru: 'Выберите отправную точку — скопируйте из более широкой области или откройте её настройки, чтобы создать.',
  },
  issueInclusionLegend: {
    en: 'Issue inclusion',
    ru: 'Включение задач',
  },
  issueInclusionHint: {
    en: 'Choose which related issues are pulled into the chart along with the root issue.',
    ru: 'Выберите, какие связанные задачи подтягивать в чарт вместе с корневой.',
  },
  includeSubtasks: {
    en: 'Include subtasks',
    ru: 'Включать подзадачи',
  },
  includeSubtasksHint: {
    en: 'Pull child sub-tasks of the root issue.',
    ru: 'Подтягивать дочерние подзадачи корневой задачи.',
  },
  includeEpicChildren: {
    en: 'Include epic children',
    ru: 'Включать дочерние эпика',
  },
  includeEpicChildrenHint: {
    en: 'Pull all issues that belong to this epic.',
    ru: 'Подтягивать все задачи, принадлежащие эпику.',
  },
  includeIssueLinks: {
    en: 'Include issue links',
    ru: 'Включать связанные задачи',
  },
  includeIssueLinksHint: {
    en: 'Pull issues linked via Jira issue links (Blocks, Relates, …).',
    ru: 'Подтягивать задачи, связанные через типы связей Jira (Blocks, Relates, …).',
  },
  issueLinkTypesHint: {
    en: 'Restrict by link type and direction. Leave empty to include all link types.',
    ru: 'Ограничить типом связи и направлением. Пусто — все типы связей.',
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
    en: '← Inward (linked → this)',
    ru: '← Входящая (связанная → эта)',
  },
  directionOutward: {
    en: '→ Outward (this → linked)',
    ru: '→ Исходящая (эта → связанная)',
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
  emptyListHint: {
    en: 'Nothing here yet. Use the button below to add the first one.',
    ru: 'Здесь пока пусто. Используйте кнопку ниже, чтобы добавить первое.',
  },
  emptyColorRules: {
    en: 'No color rules yet — bars will use the default color.',
    ru: 'Правил цвета ещё нет — полосы будут использовать цвет по умолчанию.',
  },
  emptyQuickFilters: {
    en: 'No quick filters yet — only built-in chips will appear on the toolbar.',
    ru: 'Быстрых фильтров ещё нет — на тулбаре появятся только встроенные чипы.',
  },
  emptyExclusionFilters: {
    en: 'No exclusion filters yet — every fetched issue will be drawn.',
    ru: 'Фильтров исключения ещё нет — будут отображаться все загруженные задачи.',
  },
  emptyLinkTypes: {
    en: 'No link type restrictions — all link types will be included.',
    ru: 'Ограничений по типу связи нет — будут включены все типы связей.',
  },
  errorSummaryOneSingleTab: {
    en: '1 error in {tabs} prevents saving',
    ru: '1 ошибка на табе {tabs} мешает сохранить',
  },
  errorSummaryManySingleTab: {
    en: '{count} errors in {tabs} prevent saving',
    ru: 'Ошибок на табе {tabs}: {count}. Сохранить нельзя',
  },
  errorSummaryManyTabs: {
    en: '{count} errors prevent saving — fix them in: {tabs}',
    ru: 'Ошибок: {count}. Исправьте на табах: {tabs}',
  },
  errorSummaryJumpHint: {
    en: 'Click a tab name above to jump there.',
    ru: 'Нажмите на имя таба выше, чтобы перейти туда.',
  },
  colHeaderActions: {
    en: 'Actions',
    ru: 'Действия',
  },
} satisfies Texts<
  | 'title'
  | 'scopeLegend'
  | 'scopeGlobal'
  | 'scopeProject'
  | 'scopeProjectIssueType'
  | 'scopeContextGlobal'
  | 'scopeContextProject'
  | 'scopeContextProjectIssueType'
  | 'tabBars'
  | 'tabIssues'
  | 'tabFilters'
  | 'startMapping'
  | 'endMapping'
  | 'startMappingHint'
  | 'endMappingHint'
  | 'addStartMapping'
  | 'addEndMapping'
  | 'removeMapping'
  | 'moveMappingUp'
  | 'moveMappingDown'
  | 'mappingPriorityBadge'
  | 'mappingSource'
  | 'ruleMatchBy'
  | 'sourceDateField'
  | 'sourceStatusTransition'
  | 'startDateField'
  | 'startStatus'
  | 'endDateField'
  | 'endStatus'
  | 'tooltipFields'
  | 'tooltipFieldsHint'
  | 'colorRulesLegend'
  | 'colorRulesHint'
  | 'addColorRule'
  | 'removeColorRule'
  | 'colorRuleName'
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
  | 'quickFiltersLegend'
  | 'quickFiltersHint'
  | 'addQuickFilter'
  | 'removeQuickFilter'
  | 'moveQuickFilterUp'
  | 'moveQuickFilterDown'
  | 'quickFilterName'
  | 'quickFilterModeField'
  | 'quickFilterModeJql'
  | 'quickFilterFieldId'
  | 'quickFilterValue'
  | 'quickFilterJql'
  | 'quickFilterJqlError'
  | 'quickFilterNamePlaceholder'
  | 'quickFilterJqlPlaceholder'
  | 'save'
  | 'saveDisabledHasErrors'
  | 'cancel'
  | 'copyFrom'
  | 'copyFromHint'
  | 'noDraftTitle'
  | 'noDraftDescription'
  | 'issueInclusionLegend'
  | 'issueInclusionHint'
  | 'includeSubtasks'
  | 'includeSubtasksHint'
  | 'includeEpicChildren'
  | 'includeEpicChildrenHint'
  | 'includeIssueLinks'
  | 'includeIssueLinksHint'
  | 'issueLinkTypesHint'
  | 'linkTypeId'
  | 'linkDirection'
  | 'directionInward'
  | 'directionOutward'
  | 'addLinkTypeRow'
  | 'removeLinkTypeRow'
  | 'selectPlaceholder'
  | 'emptyListHint'
  | 'emptyColorRules'
  | 'emptyQuickFilters'
  | 'emptyExclusionFilters'
  | 'emptyLinkTypes'
  | 'errorSummaryOneSingleTab'
  | 'errorSummaryManySingleTab'
  | 'errorSummaryManyTabs'
  | 'errorSummaryJumpHint'
  | 'colHeaderActions'
>;

type IssueLinkFormRow = {
  id: string;
  direction: 'inward' | 'outward';
};

type ColorRuleFormRow = {
  name: string;
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

type DateMappingFormRow = {
  source: DateMappingSource;
  detail: string;
};

type QuickFilterFormRow = {
  id: string;
  name: string;
  selectorMode: 'field' | 'jql';
  selectorFieldId: string;
  selectorValue: string;
  selectorJql: string;
};

type FormShape = {
  startMappings: DateMappingFormRow[];
  endMappings: DateMappingFormRow[];
  tooltipFieldIds: string[];
  colorRules: ColorRuleFormRow[];
  quickFilters: QuickFilterFormRow[];
  exclusionFilters: ExclusionFilterFormRow[];
  includeSubtasks: boolean;
  includeEpicChildren: boolean;
  includeIssueLinks: boolean;
  issueLinkRows: IssueLinkFormRow[];
};

function generateQuickFilterId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `qf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function dateMappingToRow(m: DateMapping): DateMappingFormRow {
  return {
    source: m.source,
    detail: m.source === 'dateField' ? (m.fieldId ?? '') : (m.statusName ?? ''),
  };
}

function rowToDateMapping(row: DateMappingFormRow): DateMapping {
  return row.source === 'dateField'
    ? { source: 'dateField', fieldId: row.detail }
    : { source: 'statusTransition', statusName: row.detail };
}

function draftToFormValues(draft: GanttScopeSettings): FormShape {
  const issueLinkRows: IssueLinkFormRow[] = draft.issueLinkTypesToInclude.map(s => ({
    id: s.id,
    direction: s.direction,
  }));

  const startMappings =
    draft.startMappings.length > 0
      ? draft.startMappings.map(dateMappingToRow)
      : [{ source: 'dateField' as const, detail: '' }];
  const endMappings =
    draft.endMappings.length > 0
      ? draft.endMappings.map(dateMappingToRow)
      : [{ source: 'dateField' as const, detail: '' }];

  return {
    startMappings,
    endMappings,
    tooltipFieldIds: [...draft.tooltipFieldIds],
    colorRules: (draft.colorRules ?? []).map(
      (r): ColorRuleFormRow => ({
        name: r.name ?? '',
        selectorMode: r.selector.mode,
        selectorFieldId: r.selector.fieldId ?? '',
        selectorValue: r.selector.value ?? '',
        selectorJql: r.selector.jql ?? '',
        color: r.color,
      })
    ),
    quickFilters: (draft.quickFilters ?? []).map(
      (q): QuickFilterFormRow => ({
        id: q.id,
        name: q.name,
        selectorMode: q.selector.mode,
        selectorFieldId: q.selector.mode === 'field' ? (q.selector.fieldId ?? '') : '',
        selectorValue: q.selector.mode === 'field' ? (q.selector.value ?? '') : '',
        selectorJql: q.selector.mode === 'jql' ? (q.selector.jql ?? '') : '',
      })
    ),
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

  const colorRules: ColorRule[] = (values.colorRules ?? []).map(row => {
    const name = row.name.trim();
    return {
      ...(name ? { name } : {}),
      selector: {
        mode: row.selectorMode,
        fieldId: row.selectorMode === 'field' ? row.selectorFieldId : undefined,
        value: row.selectorMode === 'field' ? row.selectorValue : undefined,
        jql: row.selectorMode === 'jql' ? row.selectorJql : undefined,
      },
      color: row.color,
    };
  });

  const rows = values.issueLinkRows ?? [];
  const issueLinkTypesToInclude = values.includeIssueLinks
    ? rows.filter(r => r.id.trim() !== '').map(r => ({ id: r.id.trim(), direction: r.direction }))
    : [];

  const startMappings: DateMapping[] = (values.startMappings ?? []).map(rowToDateMapping);
  const endMappings: DateMapping[] = (values.endMappings ?? []).map(rowToDateMapping);

  const quickFilters: QuickFilter[] = (values.quickFilters ?? [])
    .filter(row => row.name.trim() !== '')
    .map(row => ({
      id: row.id,
      name: row.name.trim(),
      selector:
        row.selectorMode === 'field'
          ? { mode: 'field' as const, fieldId: row.selectorFieldId, value: row.selectorValue }
          : { mode: 'jql' as const, jql: row.selectorJql },
    }));

  return {
    startMappings: startMappings.length > 0 ? startMappings : [{ source: 'dateField', fieldId: 'created' }],
    endMappings: endMappings.length > 0 ? endMappings : [{ source: 'dateField', fieldId: 'duedate' }],
    colorRules,
    tooltipFieldIds: values.tooltipFieldIds ?? [],
    quickFilters,
    exclusionFilters,
    includeSubtasks: values.includeSubtasks,
    includeEpicChildren: values.includeEpicChildren,
    includeIssueLinks: values.includeIssueLinks,
    issueLinkTypesToInclude,
  };
}

// ---------- Layout helpers ----------

function ganttListColClass(c: { width?: string | number; flex?: number }): string {
  const parts: string[] = ['jh-gantt-list-col'];
  if (c.flex != null && c.flex !== 0) {
    parts.push('jh-gantt-list-col--flex');
    return parts.join(' ');
  }
  const w = c.width;
  if (w === 24) parts.push('jh-gantt-list-col--w-24');
  else if (w === 36) parts.push('jh-gantt-list-col--w-36');
  else if (w === 96) parts.push('jh-gantt-list-col--w-96');
  else if (w === 120) parts.push('jh-gantt-list-col--w-120');
  else if (w === 130) parts.push('jh-gantt-list-col--w-130');
  else if (w === 140) parts.push('jh-gantt-list-col--w-140');
  else if (w === 220) parts.push('jh-gantt-list-col--w-220');
  else parts.push('jh-gantt-list-col--flex');
  return parts.join(' ');
}

/** Atlassian-style group caption. Uses an `<h3>` for accessibility. */
const SectionHeading: React.FC<{
  children: React.ReactNode;
  hint?: string;
  count?: number;
  /** small action node rendered to the right (e.g. "Add" button) */
  right?: React.ReactNode;
  /** When true, draws a thin separator above the heading. Use to break up consecutive sections. */
  divider?: boolean;
}> = ({ children, hint, count, right, divider }) => (
  <div
    className={
      divider ? 'jh-gantt-section-heading-wrap jh-gantt-section-heading-wrap--divider' : 'jh-gantt-section-heading-wrap'
    }
  >
    <div className="jh-gantt-section-heading-row">
      <h3 className="jh-gantt-section-heading-h3">
        {children}
        {typeof count === 'number' && count > 0 ? (
          <Tag className="jh-gantt-section-heading-count-tag" bordered={false} color="default">
            {count}
          </Tag>
        ) : null}
      </h3>
      {right}
    </div>
    {hint ? <div className="jh-gantt-section-heading-hint">{hint}</div> : null}
  </div>
);

/** Visible "this list is empty" placeholder above the dashed `+ Add…` button. */
const EmptyListPlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="jh-gantt-empty-list-placeholder">{children}</div>
);

/** Visible "table-like" header for list rows — rendered ONCE per list, replaces per-row labels. */
const ListColumnsHeader: React.FC<{ columns: { label: string; width?: string | number; flex?: number }[] }> = ({
  columns,
}) => (
  <div className="jh-gantt-list-columns-header">
    {columns.map((c, i) => (
      <div key={i} className={ganttListColClass(c)}>
        {c.label}
      </div>
    ))}
  </div>
);

const ROW_ACTIONS_WIDTH = 96;

/** A single inclusion switch (row): switch + bold label + secondary description. */
const InclusionSwitchRow: React.FC<{
  name: keyof FormShape;
  label: string;
  description: string;
}> = ({ name, label, description }) => (
  <Form.Item noStyle shouldUpdate={(prev, cur) => prev[name] !== cur[name]}>
    {() => (
      <div className="jh-gantt-inclusion-row">
        <Form.Item name={name as string} valuePropName="checked" noStyle>
          <Switch aria-label={label} />
        </Form.Item>
        <div className="jh-gantt-inclusion-text">
          <div className="jh-gantt-inclusion-label">{label}</div>
          <div className="jh-gantt-inclusion-desc">{description}</div>
        </div>
      </div>
    )}
  </Form.Item>
);

// ---------- Date mappings section (Bars tab) ----------

type DateMappingsSectionTexts = {
  mappingSource: string;
  selectPlaceholder: string;
  removeMapping: string;
  moveMappingUp: string;
  moveMappingDown: string;
  mappingPriorityBadge: string;
};

interface DateMappingsSectionProps {
  listName: 'startMappings' | 'endMappings';
  heading: string;
  hint: string;
  addLabel: string;
  dateLabel: string;
  statusLabel: string;
  defaultRow: DateMappingFormRow;
  form: FormInstance<FormShape>;
  sourceOptions: { value: DateMappingSource; label: string }[];
  dateFieldOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  isLoadingFields: boolean;
  isLoadingStatuses: boolean;
  selectFilterOption: (input: string, option?: { label?: string }) => boolean;
  texts: DateMappingsSectionTexts;
  /** Called after we mutate the form imperatively (e.g. clearing `detail` on source change). */
  notifyFormChange: () => void;
  'data-testid'?: string;
}

const DateMappingsSection: React.FC<DateMappingsSectionProps> = args => {
  const {
    listName,
    heading,
    hint,
    addLabel,
    dateLabel,
    statusLabel,
    defaultRow,
    form,
    sourceOptions,
    dateFieldOptions,
    statusOptions,
    isLoadingFields,
    isLoadingStatuses,
    selectFilterOption,
    texts,
    notifyFormChange,
  } = args;

  return (
    <div data-testid={args['data-testid']} className="jh-gantt-form-section-mb">
      <SectionHeading hint={hint}>{heading}</SectionHeading>
      <Form.List name={listName}>
        {(rows, { add, remove, move }) => (
          <>
            <ListColumnsHeader
              columns={[
                { label: '#', width: 24 },
                { label: texts.mappingSource, width: 140 },
                { label: dateLabel, flex: 1 },
                { label: '', width: ROW_ACTIONS_WIDTH },
              ]}
            />
            {rows.map(({ key, name, ...restField }, index) => (
              <div key={key} data-testid={`${args['data-testid']}-row-${index}`} className="jh-gantt-mapping-row">
                <div
                  aria-label={texts.mappingPriorityBadge}
                  title={`${texts.mappingPriorityBadge}: ${index + 1}`}
                  className="jh-gantt-mapping-priority"
                >
                  {index + 1}
                </div>
                <Form.Item
                  {...restField}
                  name={[name, 'source']}
                  rules={[{ required: true }]}
                  className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-140"
                >
                  <Select
                    data-testid="gantt-settings-mapping-source"
                    virtual={false}
                    options={sourceOptions}
                    onChange={() => {
                      // Clear the dependent detail field (fieldId or statusName) so we never persist
                      // a stale value from the previous source kind.
                      form.setFieldValue([listName, name, 'detail'], undefined);
                      notifyFormChange();
                    }}
                  />
                </Form.Item>
                <Form.Item noStyle dependencies={[[listName, name, 'source']]}>
                  {() => {
                    const isStatus = form.getFieldValue([listName, name, 'source']) === 'statusTransition';
                    return isStatus ? (
                      <Form.Item
                        {...restField}
                        name={[name, 'detail']}
                        aria-label={statusLabel}
                        rules={[{ required: true }]}
                        className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                      >
                        <Select
                          data-testid="gantt-settings-mapping-value"
                          virtual={false}
                          showSearch
                          optionFilterProp="label"
                          filterOption={selectFilterOption}
                          placeholder={texts.selectPlaceholder}
                          loading={isLoadingStatuses}
                          notFoundContent={isLoadingStatuses ? <Spin size="small" /> : null}
                          options={statusOptions}
                        />
                      </Form.Item>
                    ) : (
                      <Form.Item
                        {...restField}
                        name={[name, 'detail']}
                        aria-label={dateLabel}
                        rules={[{ required: true }]}
                        className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                      >
                        <Select
                          data-testid="gantt-settings-mapping-value"
                          virtual={false}
                          showSearch
                          optionFilterProp="label"
                          filterOption={selectFilterOption}
                          placeholder={texts.selectPlaceholder}
                          loading={isLoadingFields}
                          notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                          options={dateFieldOptions}
                        />
                      </Form.Item>
                    );
                  }}
                </Form.Item>
                <div className="jh-gantt-row-actions">
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowUpOutlined />}
                    aria-label={texts.moveMappingUp}
                    title={texts.moveMappingUp}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<ArrowDownOutlined />}
                    aria-label={texts.moveMappingDown}
                    title={texts.moveMappingDown}
                    disabled={index === rows.length - 1}
                    onClick={() => move(index, index + 1)}
                  />
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    aria-label={texts.removeMapping}
                    title={texts.removeMapping}
                    disabled={rows.length <= 1}
                    onClick={() => remove(name)}
                  />
                </div>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() => add({ ...defaultRow })}
              block
              icon={<PlusOutlined />}
              className="jh-gantt-btn-mt-8"
            >
              {addLabel}
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};

// ---------- Bar colors section ----------

interface ColorRulesSectionProps {
  form: FormInstance<FormShape>;
  texts: ReturnType<typeof useGetTextsByLocale<keyof typeof GANTT_SETTINGS_MODAL_TEXTS>>;
  fieldOptions: { value: string; label: string }[];
  isLoadingFields: boolean;
  selectFilterOption: (input: string, option?: { label?: string }) => boolean;
  handleValuesChange: (changed: Partial<FormShape>, all: FormShape) => void;
}

const ColorRulesSection: React.FC<ColorRulesSectionProps> = ({
  form,
  texts,
  fieldOptions,
  isLoadingFields,
  selectFilterOption,
  handleValuesChange,
}) => {
  return (
    <div className="jh-gantt-form-section-mb">
      <SectionHeading hint={texts.colorRulesHint} divider>
        {texts.colorRulesLegend}
      </SectionHeading>
      <Form.List name="colorRules">
        {(listFields, { add, remove }) => (
          <>
            {listFields.length > 0 ? (
              <ListColumnsHeader
                columns={[
                  { label: texts.colorRuleName, width: 140 },
                  { label: texts.ruleMatchBy, width: 130 },
                  { label: `${texts.colorRuleField} / ${texts.colorRuleJql}`, flex: 1 },
                  { label: texts.colorRuleColor, width: 120 },
                  { label: '', width: 36 },
                ]}
              />
            ) : (
              <EmptyListPlaceholder>{texts.emptyColorRules}</EmptyListPlaceholder>
            )}
            {listFields.map(({ key, name, ...restField }, index) => (
              <div key={key} className="jh-gantt-mapping-row">
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  aria-label={texts.colorRuleName}
                  className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-140"
                >
                  <Input
                    autoComplete="off"
                    placeholder={texts.colorRuleName}
                    data-testid={`gantt-color-rule-name-${index}`}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'selectorMode']}
                  rules={[{ required: true }]}
                  className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-130"
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
                      <div className="jh-gantt-flex-row-gap">
                        <Form.Item
                          {...restField}
                          name={[name, 'selectorFieldId']}
                          aria-label={texts.colorRuleField}
                          className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                        >
                          <Select
                            virtual={false}
                            showSearch
                            optionFilterProp="label"
                            filterOption={selectFilterOption}
                            placeholder={texts.colorRuleField}
                            loading={isLoadingFields}
                            notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                            options={fieldOptions}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'selectorValue']}
                          aria-label={texts.colorRuleValue}
                          className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-140"
                        >
                          <Input autoComplete="off" placeholder={texts.colorRuleValue} />
                        </Form.Item>
                      </div>
                    ) : (
                      <Form.Item
                        {...restField}
                        name={[name, 'selectorJql']}
                        aria-label={texts.colorRuleJql}
                        rules={[
                          {
                            validator: async (_rule, value: unknown) => {
                              if (typeof value !== 'string' || value.trim() === '') return;
                              try {
                                parseJql(value);
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : 'invalid';
                                throw new Error(texts.quickFilterJqlError.replace('{error}', msg), {
                                  cause: err,
                                });
                              }
                            },
                          },
                        ]}
                        className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                      >
                        <Input.TextArea
                          autoSize={{ minRows: 1, maxRows: 4 }}
                          autoComplete="off"
                          className="jh-gantt-input-code"
                          placeholder="priority = Critical"
                        />
                      </Form.Item>
                    )
                  }
                </Form.Item>
                <Form.Item {...restField} name={[name, 'color']} hidden>
                  <input type="hidden" />
                </Form.Item>
                <div className="jh-gantt-color-picker-cell">
                  <Form.Item
                    noStyle
                    shouldUpdate={(p, c) => p.colorRules?.[name]?.color !== c.colorRules?.[name]?.color}
                  >
                    {() => (
                      <ColorPicker
                        value={form.getFieldValue(['colorRules', name, 'color']) || '#FF5630'}
                        onChange={color => {
                          const hexStr = typeof color === 'string' ? color : color.toHexString();
                          form.setFieldValue(['colorRules', name, 'color'], hexStr);
                          const allValues = form.getFieldsValue(true) as FormShape;
                          handleValuesChange({}, allValues);
                        }}
                        showText
                        size="small"
                      />
                    )}
                  </Form.Item>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={texts.removeColorRule}
                  title={texts.removeColorRule}
                  onClick={() => remove(name)}
                />
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() =>
                add({
                  name: '',
                  selectorMode: 'field',
                  selectorFieldId: '',
                  selectorValue: '',
                  selectorJql: '',
                  color: '#FF5630',
                })
              }
              block
              icon={<PlusOutlined />}
              className="jh-gantt-btn-mt-8"
            >
              {texts.addColorRule}
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};

// ---------- Quick filters section ----------

interface QuickFiltersSectionProps {
  form: FormInstance<FormShape>;
  texts: ReturnType<typeof useGetTextsByLocale<keyof typeof GANTT_SETTINGS_MODAL_TEXTS>>;
  fieldOptions: { value: string; label: string }[];
  isLoadingFields: boolean;
  selectFilterOption: (input: string, option?: { label?: string }) => boolean;
}

const QuickFiltersSection: React.FC<QuickFiltersSectionProps> = ({
  form,
  texts,
  fieldOptions,
  isLoadingFields,
  selectFilterOption,
}) => {
  return (
    <div className="jh-gantt-form-section-mb">
      <SectionHeading hint={texts.quickFiltersHint}>{texts.quickFiltersLegend}</SectionHeading>
      <Form.List name="quickFilters">
        {(listFields, { add, remove, move }) => (
          <>
            {listFields.length > 0 ? (
              <ListColumnsHeader
                columns={[
                  { label: texts.quickFilterName, width: 140 },
                  { label: texts.ruleMatchBy, width: 120 },
                  { label: `${texts.quickFilterFieldId} / ${texts.quickFilterJql}`, flex: 1 },
                  { label: '', width: ROW_ACTIONS_WIDTH },
                ]}
              />
            ) : (
              <EmptyListPlaceholder>{texts.emptyQuickFilters}</EmptyListPlaceholder>
            )}
            {listFields.map(({ key, name, ...restField }, index) => (
              <Form.Item key={key} noStyle shouldUpdate={() => true}>
                {() => {
                  const rowId = String(form.getFieldValue(['quickFilters', name, 'id']) ?? `idx-${index}`);
                  return (
                    <div data-testid={`gantt-quick-filter-row-${rowId}`} className="jh-gantt-mapping-row">
                      <Form.Item {...restField} name={[name, 'id']} hidden>
                        <Input type="hidden" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        aria-label={texts.quickFilterName}
                        rules={[{ required: true, message: texts.quickFilterName }]}
                        className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-140"
                      >
                        <Input autoComplete="off" placeholder={texts.quickFilterNamePlaceholder} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'selectorMode']}
                        rules={[{ required: true }]}
                        className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-120"
                      >
                        <Select
                          virtual={false}
                          options={[
                            { value: 'field' as const, label: texts.quickFilterModeField },
                            { value: 'jql' as const, label: texts.quickFilterModeJql },
                          ]}
                        />
                      </Form.Item>
                      <Form.Item noStyle dependencies={[['quickFilters', name, 'selectorMode']]}>
                        {() =>
                          form.getFieldValue(['quickFilters', name, 'selectorMode']) === 'field' ? (
                            <div className="jh-gantt-flex-row-gap">
                              <Form.Item
                                {...restField}
                                name={[name, 'selectorFieldId']}
                                aria-label={texts.quickFilterFieldId}
                                className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                              >
                                <Select
                                  virtual={false}
                                  showSearch
                                  optionFilterProp="label"
                                  filterOption={selectFilterOption}
                                  placeholder={texts.quickFilterFieldId}
                                  loading={isLoadingFields}
                                  notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                                  options={fieldOptions}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, 'selectorValue']}
                                aria-label={texts.quickFilterValue}
                                className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-140"
                              >
                                <Input autoComplete="off" placeholder={texts.quickFilterValue} />
                              </Form.Item>
                            </div>
                          ) : (
                            <Form.Item
                              {...restField}
                              name={[name, 'selectorJql']}
                              aria-label={texts.quickFilterJql}
                              rules={[
                                {
                                  validator: async (_rule, value: unknown) => {
                                    if (typeof value !== 'string' || value.trim() === '') return;
                                    try {
                                      parseJql(value);
                                    } catch (err) {
                                      const msg = err instanceof Error ? err.message : 'invalid';
                                      throw new Error(texts.quickFilterJqlError.replace('{error}', msg), {
                                        cause: err,
                                      });
                                    }
                                  },
                                },
                              ]}
                              className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                            >
                              <Input.TextArea
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                autoComplete="off"
                                className="jh-gantt-input-code"
                                placeholder={texts.quickFilterJqlPlaceholder}
                              />
                            </Form.Item>
                          )
                        }
                      </Form.Item>
                      <Form.Item noStyle shouldUpdate={() => true}>
                        {() =>
                          form.getFieldValue(['quickFilters', name, 'selectorMode']) === 'jql' &&
                          form.getFieldError(['quickFilters', name, 'selectorJql']).length > 0 ? (
                            <span data-testid="gantt-quick-filter-jql-error" className="jh-gantt-sr-only" aria-hidden />
                          ) : null
                        }
                      </Form.Item>
                      <div className="jh-gantt-row-actions">
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowUpOutlined />}
                          aria-label={texts.moveQuickFilterUp}
                          title={texts.moveQuickFilterUp}
                          disabled={index === 0}
                          onClick={() => move(index, index - 1)}
                        />
                        <Button
                          type="text"
                          size="small"
                          icon={<ArrowDownOutlined />}
                          aria-label={texts.moveQuickFilterDown}
                          title={texts.moveQuickFilterDown}
                          disabled={index === listFields.length - 1}
                          onClick={() => move(index, index + 1)}
                        />
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          aria-label={texts.removeQuickFilter}
                          title={texts.removeQuickFilter}
                          data-testid={`gantt-quick-filter-row-delete-${rowId}`}
                          onClick={() => remove(name)}
                        />
                      </div>
                    </div>
                  );
                }}
              </Form.Item>
            ))}
            <Button
              type="dashed"
              onClick={() =>
                add({
                  id: generateQuickFilterId(),
                  name: '',
                  selectorMode: 'field',
                  selectorFieldId: '',
                  selectorValue: '',
                  selectorJql: '',
                })
              }
              block
              icon={<PlusOutlined />}
              className="jh-gantt-btn-mt-8"
            >
              {texts.addQuickFilter}
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};

// ---------- Exclusion filters section ----------

interface ExclusionFiltersSectionProps {
  form: FormInstance<FormShape>;
  texts: ReturnType<typeof useGetTextsByLocale<keyof typeof GANTT_SETTINGS_MODAL_TEXTS>>;
  fieldOptions: { value: string; label: string }[];
  isLoadingFields: boolean;
  selectFilterOption: (input: string, option?: { label?: string }) => boolean;
}

const ExclusionFiltersSection: React.FC<ExclusionFiltersSectionProps> = ({
  form,
  texts,
  fieldOptions,
  isLoadingFields,
  selectFilterOption,
}) => {
  return (
    <div className="jh-gantt-form-section-mb">
      <SectionHeading hint={texts.exclusionOrHint} divider>
        {texts.exclusionLegend}
      </SectionHeading>
      <Form.List name="exclusionFilters">
        {(listFields, { add, remove }) => (
          <>
            {listFields.length > 0 ? (
              <ListColumnsHeader
                columns={[
                  { label: texts.ruleMatchBy, width: 130 },
                  { label: `${texts.exclusionFieldId} / ${texts.exclusionJql}`, flex: 1 },
                  { label: '', width: 36 },
                ]}
              />
            ) : (
              <EmptyListPlaceholder>{texts.emptyExclusionFilters}</EmptyListPlaceholder>
            )}
            {listFields.map(({ key, name, ...restField }, index) => (
              <div key={key} data-testid={`gantt-exclusion-filter-row-${index}`} className="jh-gantt-mapping-row">
                <Form.Item
                  {...restField}
                  name={[name, 'mode']}
                  rules={[{ required: true }]}
                  className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-130"
                >
                  <Select
                    data-testid={`gantt-exclusion-filter-mode-${index}`}
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
                      <div className="jh-gantt-flex-row-gap">
                        <Form.Item
                          {...restField}
                          name={[name, 'fieldId']}
                          aria-label={texts.exclusionFieldId}
                          className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                        >
                          <Select
                            data-testid={`gantt-exclusion-filter-field-${index}`}
                            virtual={false}
                            showSearch
                            optionFilterProp="label"
                            filterOption={selectFilterOption}
                            placeholder={texts.exclusionFieldId}
                            loading={isLoadingFields}
                            notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
                            options={fieldOptions}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'value']}
                          aria-label={texts.exclusionValue}
                          className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-140"
                        >
                          <Input
                            data-testid={`gantt-exclusion-filter-value-${index}`}
                            autoComplete="off"
                            placeholder={texts.exclusionValue}
                          />
                        </Form.Item>
                      </div>
                    ) : (
                      <Form.Item
                        {...restField}
                        name={[name, 'jql']}
                        aria-label={texts.exclusionJql}
                        rules={[
                          {
                            validator: async (_rule, value: unknown) => {
                              if (typeof value !== 'string' || value.trim() === '') return;
                              try {
                                parseJql(value);
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : 'invalid';
                                throw new Error(texts.quickFilterJqlError.replace('{error}', msg), {
                                  cause: err,
                                });
                              }
                            },
                          },
                        ]}
                        className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                      >
                        <Input.TextArea
                          autoSize={{ minRows: 1, maxRows: 4 }}
                          autoComplete="off"
                          className="jh-gantt-input-code"
                          placeholder="status = Done"
                        />
                      </Form.Item>
                    )
                  }
                </Form.Item>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={texts.removeExclusionFilter}
                  title={texts.removeExclusionFilter}
                  onClick={() => remove(name)}
                />
              </div>
            ))}
            <Button
              type="dashed"
              data-testid="gantt-exclusion-filters-add"
              onClick={() => add({ mode: 'field', fieldId: '', value: '', jql: '' })}
              block
              icon={<PlusOutlined />}
              className="jh-gantt-btn-mt-8"
            >
              {texts.addExclusionFilter}
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};

// ---------- Issue link types section ----------

interface IssueLinkTypesSectionProps {
  texts: ReturnType<typeof useGetTextsByLocale<keyof typeof GANTT_SETTINGS_MODAL_TEXTS>>;
  linkTypeOptions: { value: string; label: string }[];
  isLoadingLinkTypes: boolean;
  selectFilterOption: (input: string, option?: { label?: string }) => boolean;
}

const IssueLinkTypesSection: React.FC<IssueLinkTypesSectionProps> = ({
  texts,
  linkTypeOptions,
  isLoadingLinkTypes,
  selectFilterOption,
}) => {
  return (
    <div className="jh-gantt-issue-link-section">
      <div className="jh-gantt-issue-link-hint">{texts.issueLinkTypesHint}</div>
      <Form.List name="issueLinkRows">
        {(listFields, { add, remove }) => (
          <>
            {listFields.length > 0 ? (
              <ListColumnsHeader
                columns={[
                  { label: texts.linkTypeId, flex: 1 },
                  { label: texts.linkDirection, width: 220 },
                  { label: '', width: 36 },
                ]}
              />
            ) : (
              <EmptyListPlaceholder>{texts.emptyLinkTypes}</EmptyListPlaceholder>
            )}
            {listFields.map(({ key, name, ...restField }, index) => (
              <div key={key} data-testid={`gantt-issue-link-type-row-${index}`} className="jh-gantt-mapping-row">
                <Form.Item
                  {...restField}
                  name={[name, 'id']}
                  aria-label={texts.linkTypeId}
                  className="jh-gantt-form-item-mb-0 jh-gantt-form-item-flex"
                >
                  <Select
                    data-testid={`gantt-settings-link-type-select-${index}`}
                    virtual={false}
                    showSearch
                    optionFilterProp="label"
                    filterOption={selectFilterOption}
                    placeholder={texts.selectPlaceholder}
                    loading={isLoadingLinkTypes}
                    notFoundContent={isLoadingLinkTypes ? <Spin size="small" /> : null}
                    options={linkTypeOptions}
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'direction']}
                  aria-label={texts.linkDirection}
                  className="jh-gantt-form-item-mb-0 jh-gantt-form-item-w-220"
                >
                  <Select
                    data-testid={`gantt-issue-link-direction-${index}`}
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
                  title={texts.removeLinkTypeRow}
                  onClick={() => remove(name)}
                />
              </div>
            ))}
            <Button
              type="dashed"
              data-testid="gantt-issue-link-types-add"
              onClick={() => add({ id: '', direction: 'outward' })}
              block
              icon={<PlusOutlined />}
              className="jh-gantt-btn-mt-8"
            >
              {texts.addLinkTypeRow}
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
};

// ---------- Form content ----------

export interface GanttSettingsValidityState {
  hasErrors: boolean;
  /** Number of validation errors per top-level form field path (e.g. "quickFilters", "exclusionFilters").
   *  Used by parents to show error badges on tabs. */
  errorsByPath: Record<string, number>;
}

export interface GanttSettingsFormContentProps {
  draft: GanttScopeSettings | null;
  currentScope: SettingsScope;
  onDraftChange: (patch: Partial<GanttScopeSettings>) => void;
  onScopeLevelChange: (level: SettingsScope['level']) => void;
  /** Optional CTA shown in the empty state when there is no draft (e.g. open Copy-from dialog). */
  onCopyFrom?: () => void;
  /** Notifies the parent whenever the draft becomes valid/invalid. Used to gate the Save button. */
  onValidityChange?: (state: GanttSettingsValidityState) => void;
}

/** Reusable form content for Gantt settings — used both in modal and inline in tab. */
export const GanttSettingsFormContent: React.FC<GanttSettingsFormContentProps> = ({
  draft,
  currentScope,
  onDraftChange,
  onScopeLevelChange,
  onCopyFrom,
  onValidityChange,
}) => {
  const texts = useGetTextsByLocale(GANTT_SETTINGS_MODAL_TEXTS);
  const [form] = Form.useForm<FormShape>();
  const isApplyingDraft = useRef(false);
  const [activeTab, setActiveTab] = React.useState<'bars' | 'issues' | 'filters'>('bars');

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

  const allFieldOptions = useMemo(() => {
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

  const initialValues = useMemo(() => (draft ? draftToFormValues(draft) : undefined), [draft]);

  useEffect(() => {
    if (!draft) {
      onValidityChange?.({ hasErrors: false, errorsByPath: {} });
      return;
    }
    isApplyingDraft.current = true;
    form.setFieldsValue(draftToFormValues(draft));
    queueMicrotask(() => {
      isApplyingDraft.current = false;
      // Fire a full validation pass so error styles, Save gating, and tab badges reflect the
      // freshly loaded draft. AntD doesn't run rules on untouched fields by default, so this
      // is what makes invalid JQL go red on first render.
      void form
        .validateFields()
        .catch(() => undefined)
        .finally(() => {
          if (!onValidityChange) return;
          const allErrors = form.getFieldsError();
          const errorsByPath: Record<string, number> = {};
          let total = 0;
          for (const entry of allErrors) {
            if (entry.errors.length === 0) continue;
            total += entry.errors.length;
            const top = String(entry.name[0] ?? '');
            errorsByPath[top] = (errorsByPath[top] ?? 0) + entry.errors.length;
          }
          onValidityChange({ hasErrors: total > 0, errorsByPath });
        });
    });
  }, [draft, form, onValidityChange]);

  const reportValidity = useCallback(() => {
    if (!onValidityChange) return;
    // antd validates async; wait one tick so the latest rule results are reflected.
    Promise.resolve().then(() => {
      const allErrors = form.getFieldsError();
      const errorsByPath: Record<string, number> = {};
      let total = 0;
      for (const entry of allErrors) {
        if (entry.errors.length === 0) continue;
        total += entry.errors.length;
        const top = String(entry.name[0] ?? '');
        errorsByPath[top] = (errorsByPath[top] ?? 0) + entry.errors.length;
      }
      onValidityChange({ hasErrors: total > 0, errorsByPath });
    });
  }, [form, onValidityChange]);

  const handleValuesChange = useCallback(
    (_changed: Partial<FormShape>, allValues: FormShape) => {
      if (isApplyingDraft.current || !draft) {
        return;
      }
      onDraftChange(formValuesToPatch(allValues));
      reportValidity();
    },
    [draft, onDraftChange, reportValidity]
  );

  const notifyFormChange = useCallback(() => {
    if (isApplyingDraft.current || !draft) return;
    onDraftChange(formValuesToPatch(form.getFieldsValue(true) as FormShape));
  }, [draft, form, onDraftChange]);

  const handleScopeLevelChange = useCallback(
    (value: string | number) => {
      onScopeLevelChange(value as SettingsScope['level']);
    },
    [onScopeLevelChange]
  );

  const sourceOptions = [
    { value: 'dateField' as const, label: texts.sourceDateField },
    { value: 'statusTransition' as const, label: texts.sourceStatusTransition },
  ];

  const selectFilterOption = (input: string, option?: { label?: string }) =>
    (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase());

  // ---- Scope context line ("Editing settings for: TRPA › Bug") with bold tokens ----
  const scopeContext = useMemo<React.ReactNode>(() => {
    if (currentScope.level === 'global') return texts.scopeContextGlobal;

    const renderTemplate = (template: string, tokens: Record<string, string>): React.ReactNode => {
      const parts = template.split(/(\{[^}]+\})/g);
      return parts.map((part, i) => {
        const m = /^\{([^}]+)\}$/.exec(part);
        if (!m) return <React.Fragment key={i}>{part}</React.Fragment>;
        const value = tokens[m[1]] ?? '?';
        return <strong key={i}>{value}</strong>;
      });
    };

    if (currentScope.level === 'project') {
      return renderTemplate(texts.scopeContextProject, { project: currentScope.projectKey ?? '?' });
    }
    return renderTemplate(texts.scopeContextProjectIssueType, {
      project: currentScope.projectKey ?? '?',
      issueType: currentScope.issueType ?? '?',
    });
  }, [currentScope, texts]);

  // ---- Tab contents ----
  const barsTab = (
    <>
      <DateMappingsSection
        listName="startMappings"
        heading={texts.startMapping}
        hint={texts.startMappingHint}
        addLabel={texts.addStartMapping}
        dateLabel={texts.startDateField}
        statusLabel={texts.startStatus}
        defaultRow={{ source: 'dateField', detail: 'created' }}
        form={form}
        sourceOptions={sourceOptions}
        dateFieldOptions={dateFieldOptions}
        statusOptions={statusOptions}
        isLoadingFields={isLoadingFields}
        isLoadingStatuses={isLoadingStatuses}
        selectFilterOption={selectFilterOption}
        texts={texts}
        notifyFormChange={notifyFormChange}
        data-testid="gantt-settings-start-mappings"
      />
      <DateMappingsSection
        listName="endMappings"
        heading={texts.endMapping}
        hint={texts.endMappingHint}
        addLabel={texts.addEndMapping}
        dateLabel={texts.endDateField}
        statusLabel={texts.endStatus}
        defaultRow={{ source: 'dateField', detail: 'duedate' }}
        form={form}
        sourceOptions={sourceOptions}
        dateFieldOptions={dateFieldOptions}
        statusOptions={statusOptions}
        isLoadingFields={isLoadingFields}
        isLoadingStatuses={isLoadingStatuses}
        selectFilterOption={selectFilterOption}
        texts={texts}
        notifyFormChange={notifyFormChange}
        data-testid="gantt-settings-end-mappings"
      />
      <div className="jh-gantt-form-section-mb">
        <SectionHeading hint={texts.tooltipFieldsHint}>{texts.tooltipFields}</SectionHeading>
        <Form.Item name="tooltipFieldIds" className="jh-gantt-form-item-mb-0">
          <Select
            data-testid="gantt-settings-tooltip-fields-select"
            virtual={false}
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            filterOption={selectFilterOption}
            placeholder={texts.selectPlaceholder}
            loading={isLoadingFields}
            notFoundContent={isLoadingFields ? <Spin size="small" /> : null}
            options={tooltipFieldOptions}
          />
        </Form.Item>
      </div>
      <ColorRulesSection
        form={form}
        texts={texts}
        fieldOptions={allFieldOptions}
        isLoadingFields={isLoadingFields}
        selectFilterOption={selectFilterOption}
        handleValuesChange={handleValuesChange}
      />
    </>
  );

  const issuesTab = (
    <>
      <SectionHeading hint={texts.issueInclusionHint}>{texts.issueInclusionLegend}</SectionHeading>
      <div data-testid="gantt-settings-inclusion-list">
        <InclusionSwitchRow
          name="includeSubtasks"
          label={texts.includeSubtasks}
          description={texts.includeSubtasksHint}
        />
        <InclusionSwitchRow
          name="includeEpicChildren"
          label={texts.includeEpicChildren}
          description={texts.includeEpicChildrenHint}
        />
        <InclusionSwitchRow
          name="includeIssueLinks"
          label={texts.includeIssueLinks}
          description={texts.includeIssueLinksHint}
        />
      </div>
      <Form.Item noStyle shouldUpdate={(prev, cur) => prev.includeIssueLinks !== cur.includeIssueLinks}>
        {() =>
          form.getFieldValue('includeIssueLinks') ? (
            <IssueLinkTypesSection
              texts={texts}
              linkTypeOptions={issueLinkTypeOptions}
              isLoadingLinkTypes={isLoadingLinkTypes}
              selectFilterOption={selectFilterOption}
            />
          ) : null
        }
      </Form.Item>
    </>
  );

  const filtersTab = (
    <>
      <QuickFiltersSection
        form={form}
        texts={texts}
        fieldOptions={allFieldOptions}
        isLoadingFields={isLoadingFields}
        selectFilterOption={selectFilterOption}
      />
      <ExclusionFiltersSection
        form={form}
        texts={texts}
        fieldOptions={allFieldOptions}
        isLoadingFields={isLoadingFields}
        selectFilterOption={selectFilterOption}
      />
    </>
  );

  // Wrap content in `data-jh-gantt-root` so any leaked Jira CSS or scoped overrides work
  // (this matters when the modal is rendered outside the Gantt container, e.g. in Storybook).
  return (
    <div data-jh-gantt-root="settings-modal" className="jh-gantt-settings-root">
      <SectionHeading>{texts.scopeLegend}</SectionHeading>
      <Segmented
        data-testid="gantt-scope-picker"
        value={currentScope.level}
        onChange={handleScopeLevelChange}
        options={[
          { value: 'global', label: texts.scopeGlobal },
          { value: 'project', label: texts.scopeProject },
          { value: 'projectIssueType', label: texts.scopeProjectIssueType },
        ]}
      />
      <div data-testid="gantt-settings-scope-context" className="jh-gantt-settings-scope-context">
        {scopeContext}
      </div>

      <div className="jh-gantt-settings-hr" role="separator" />

      {!draft ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div>
              <div className="jh-gantt-settings-no-draft-title">{texts.noDraftTitle}</div>
              <div className="jh-gantt-settings-no-draft-desc">{texts.noDraftDescription}</div>
            </div>
          }
        >
          {onCopyFrom ? (
            <Button type="primary" icon={<CopyOutlined />} onClick={onCopyFrom}>
              {texts.copyFrom}
            </Button>
          ) : null}
        </Empty>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          initialValues={initialValues}
          onKeyDownCapture={stopJiraHotkeys}
          onKeyUpCapture={stopJiraHotkeys}
        >
          <Form.Item noStyle shouldUpdate={() => true}>
            {() => {
              const errorEntries = form.getFieldsError().filter(e => e.errors.length > 0);
              if (errorEntries.length === 0) return null;
              const total = errorEntries.reduce((s, e) => s + e.errors.length, 0);

              type TabKey = 'bars' | 'issues' | 'filters';
              const tabsWithErrors = new Set<TabKey>();
              for (const entry of errorEntries) {
                const top = String(entry.name[0] ?? '');
                if (top === 'quickFilters' || top === 'exclusionFilters') tabsWithErrors.add('filters');
                else if (top === 'issueLinkRows') tabsWithErrors.add('issues');
                else tabsWithErrors.add('bars');
              }

              const tabLabels: Record<TabKey, string> = {
                bars: texts.tabBars,
                issues: texts.tabIssues,
                filters: texts.tabFilters,
              };

              const tabKeys = [...tabsWithErrors];
              // Render each tab name as a link that jumps focus there. Sentence is constructed
              // with grammatically distinct copy for the single-tab vs multi-tab case (round-4 fix).
              const renderTabLink = (key: TabKey) => (
                <Button
                  key={key}
                  type="link"
                  size="small"
                  className="jh-gantt-tab-error-link"
                  onClick={() => setActiveTab(key)}
                >
                  {tabLabels[key]}
                </Button>
              );

              let message: React.ReactNode;
              if (tabKeys.length === 1) {
                const template = total === 1 ? texts.errorSummaryOneSingleTab : texts.errorSummaryManySingleTab;
                const parts = template.split(/(\{tabs\}|\{count\})/g);
                message = parts.map((part, i) => {
                  if (part === '{tabs}') return <React.Fragment key={i}>{renderTabLink(tabKeys[0])}</React.Fragment>;
                  if (part === '{count}') return <React.Fragment key={i}>{total}</React.Fragment>;
                  return <React.Fragment key={i}>{part}</React.Fragment>;
                });
              } else {
                const template = texts.errorSummaryManyTabs;
                const parts = template.split(/(\{tabs\}|\{count\})/g);
                message = parts.map((part, i) => {
                  if (part === '{count}') return <React.Fragment key={i}>{total}</React.Fragment>;
                  if (part === '{tabs}') {
                    return (
                      <React.Fragment key={i}>
                        {tabKeys.map((k, idx) => (
                          <React.Fragment key={k}>
                            {idx > 0 ? ', ' : ''}
                            {renderTabLink(k)}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    );
                  }
                  return <React.Fragment key={i}>{part}</React.Fragment>;
                });
              }

              return (
                <Alert
                  type="error"
                  showIcon
                  message={message}
                  className="jh-gantt-settings-error-alert"
                  data-testid="gantt-settings-error-summary"
                />
              );
            }}
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={() => true /* re-render every keystroke so tab counts/error badges stay live */}
          >
            {() => {
              const errorsByTopField = (paths: string[]) =>
                form
                  .getFieldsError()
                  .filter(e => paths.includes(String(e.name[0] ?? '')))
                  .reduce((sum, e) => sum + e.errors.length, 0);
              const filtersErrors = errorsByTopField(['quickFilters', 'exclusionFilters']);
              const barsErrors = errorsByTopField(['startMappings', 'endMappings', 'colorRules']);
              const issuesErrors = errorsByTopField(['issueLinkRows']);

              // Single-purpose error counter: red badge IFF there are validation errors in that tab.
              // We deliberately do NOT show neutral item counts — that overloaded the same visual
              // affordance with two different meanings (round-3 review).
              const renderErrorBadge = (count: number) =>
                count > 0 ? (
                  <Tag bordered={false} color="error" className="jh-gantt-tab-error-badge">
                    {count}
                  </Tag>
                ) : null;

              return (
                <Tabs
                  activeKey={activeTab}
                  onChange={k => setActiveTab(k as 'bars' | 'issues' | 'filters')}
                  items={[
                    {
                      key: 'bars',
                      label: (
                        <span>
                          <BarChartOutlined className="jh-gantt-tab-icon" />
                          {texts.tabBars}
                          {renderErrorBadge(barsErrors)}
                        </span>
                      ),
                      children: barsTab,
                      forceRender: true,
                    },
                    {
                      key: 'issues',
                      label: (
                        <span>
                          <BranchesOutlined className="jh-gantt-tab-icon" />
                          {texts.tabIssues}
                          {renderErrorBadge(issuesErrors)}
                        </span>
                      ),
                      children: issuesTab,
                      forceRender: true,
                    },
                    {
                      key: 'filters',
                      label: (
                        <span>
                          <FilterOutlined className="jh-gantt-tab-icon" />
                          {texts.tabFilters}
                          {renderErrorBadge(filtersErrors)}
                        </span>
                      ),
                      children: filtersTab,
                      forceRender: true,
                    },
                  ]}
                />
              );
            }}
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

// ---------- Modal wrapper ----------

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
  const [validity, setValidity] = React.useState<GanttSettingsValidityState>({
    hasErrors: false,
    errorsByPath: {},
  });

  // Reset validity whenever the modal closes/reopens so a stale error state doesn't disable Save.
  useEffect(() => {
    if (!visible) {
      setValidity({ hasErrors: false, errorsByPath: {} });
    }
  }, [visible]);

  const saveDisabled = !draft || validity.hasErrors;
  const saveTooltip = !draft ? texts.noDraftTitle : validity.hasErrors ? texts.saveDisabledHasErrors : '';

  return (
    <Modal
      open={visible}
      title={texts.title}
      onCancel={onCancel}
      zIndex={1010}
      width={760}
      maskClosable={false}
      destroyOnClose
      getContainer={false}
      styles={{ body: { paddingTop: 8 } }}
      footer={
        <div className="jh-gantt-modal-footer">
          <Tooltip title={texts.copyFromHint}>
            <Button key="copy" icon={<CopyOutlined />} onClick={onCopyFrom}>
              {texts.copyFrom}
            </Button>
          </Tooltip>
          <div className="jh-gantt-modal-footer-actions">
            <Button key="cancel" onClick={onCancel}>
              {texts.cancel}
            </Button>
            <Tooltip title={saveTooltip}>
              {/* span wrapper so Tooltip works on a disabled Button */}
              <span>
                <Button
                  key="save"
                  type="primary"
                  data-testid="gantt-settings-save"
                  onClick={onSave}
                  disabled={saveDisabled}
                >
                  {texts.save}
                </Button>
              </span>
            </Tooltip>
          </div>
        </div>
      }
    >
      <GanttSettingsFormContent
        draft={draft}
        currentScope={currentScope}
        onDraftChange={onDraftChange}
        onScopeLevelChange={onScopeLevelChange}
        onCopyFrom={onCopyFrom}
        onValidityChange={setValidity}
      />
    </Modal>
  );
};
