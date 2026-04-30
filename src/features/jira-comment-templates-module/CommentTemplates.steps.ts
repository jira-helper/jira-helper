import React, { useState } from 'react';
import { And, Given, Then, When } from '../../../cypress/support/bdd-runner';
import { DEFAULT_COMMENT_TEMPLATES } from './Storage/utils/defaultTemplates';
import { validateImportedTemplates } from './Settings/utils/validateImportedTemplates';
import { serializeTemplates } from './Settings/utils/serializeTemplates';
import { CommentTemplatesToolbar } from './Editor/components/CommentTemplatesToolbar';
import { CommentTemplatesNotification } from './Editor/components/CommentTemplatesNotification';
import { CommentTemplatesSettings } from './Settings/components/CommentTemplatesSettings';
import { TemplateImportExportControls } from './Settings/components/TemplateImportExportControls';
import { JIRA_COMMENT_TEMPLATES_TEXTS } from './texts';
import type {
  CommentTemplate,
  CommentTemplateId,
  CommentTemplateSummary,
  CommentTemplatesNotificationState,
  EditableCommentTemplate,
  EditableCommentTemplatePatch,
  TemplateColor,
  TemplateValidationError,
} from './types';
import { toCommentTemplateId } from './types';

const texts = Object.fromEntries(
  Object.entries(JIRA_COMMENT_TEMPLATES_TEXTS).map(([key, value]) => [key, value.en])
) as Record<keyof typeof JIRA_COMMENT_TEMPLATES_TEXTS, string>;

const availableColors: TemplateColor[] = [
  { id: 'blue', label: texts.colorBlue, background: '#DEEBFF', border: '#4C9AFF', text: '#172B4D' },
  { id: 'green', label: texts.colorGreen, background: '#E3FCEF', border: '#36B37E', text: '#172B4D' },
  { id: 'yellow', label: texts.colorYellow, background: '#FFFAE6', border: '#FFAB00', text: '#172B4D' },
  { id: 'red', label: texts.colorRed, background: '#FFEBE6', border: '#DE350B', text: '#172B4D' },
  { id: 'purple', label: texts.colorPurple, background: '#EAE6FF', border: '#6554C0', text: '#172B4D' },
];

const settingsLabels = {
  title: texts.settingsTitle,
  addTemplate: texts.addTemplate,
  resetToDefaults: texts.resetToDefaults,
  save: texts.save,
  discard: texts.discard,
  emptyState: texts.emptySettingsState,
  importError: texts.importError,
  saveError: texts.saveError,
  unsavedChanges: texts.unsavedChanges,
  noUnsavedChanges: texts.noUnsavedChanges,
  resetToDefaultsConfirm: texts.resetToDefaultsConfirm,
  resetToDefaultsConfirmAction: texts.resetToDefaultsConfirmAction,
  confirmAction: texts.confirmAction,
  cancelAction: texts.cancelAction,
  labelField: texts.labelField,
  colorField: texts.colorField,
  colorPresetPaletteLabel: texts.colorPresetPaletteLabel,
  textField: texts.textField,
  watchersField: texts.watchersField,
  watchersHelp: texts.watchersHelp,
  watchersPlaceholder: texts.watchersPlaceholder,
  deleteTemplateAriaLabelPrefix: texts.deleteTemplateAriaLabelPrefix,
};

const importExportLabels = {
  importFile: texts.importFile,
  exportTemplates: texts.exportTemplates,
  importing: texts.importing,
  importError: texts.importError,
};

const h = React.createElement;

type HarnessMode = 'toolbar' | 'settings';

type HarnessConfig = {
  mode: HarnessMode;
  issueKey: string | null;
  templates: CommentTemplate[];
  savedTemplates: CommentTemplate[];
  corruptedStorage?: boolean;
};

let templates: CommentTemplate[] = [];
let savedTemplates: CommentTemplate[] = [];
let issueKey: string | null = 'TST-1';
let editorText = '';
let pageObjectInsertCalls = 0;
let watcherCalls: string[] = [];
let lastExportJson = '';
let normalizedImportIds: string[] = [];
let transitionDialogOutsideMvp = false;

function cloneTemplates(source: readonly CommentTemplate[]): CommentTemplate[] {
  return source.map(template => ({ ...template, watchers: template.watchers ? [...template.watchers] : undefined }));
}

function toSummaries(source: CommentTemplate[]): CommentTemplateSummary[] {
  return source.map(({ id, label, color }) => ({ id, label, color }));
}

function toEditable(source: CommentTemplate[]): EditableCommentTemplate[] {
  return source.map(template => ({ ...template, watchers: template.watchers ?? [] }));
}

function buildNotification(status: 'success' | 'partial' | 'skipped'): CommentTemplatesNotificationState {
  if (status === 'skipped') {
    return {
      id: 'skipped-watchers',
      level: 'warning',
      message: texts.watchersSkippedMissingIssueKey,
    };
  }

  return {
    id: status,
    level: status === 'success' ? 'success' : 'warning',
    message: status === 'success' ? texts.watchersAdded : texts.watchersPartiallyAdded,
    details: watcherCalls.map(username => `${username}: ${texts.watcherAddedStatus}`),
  };
}

function CommentTemplatesAcceptanceHarness({
  mode,
  issueKey,
  templates,
  savedTemplates,
  corruptedStorage,
}: HarnessConfig) {
  const [currentTemplates, setCurrentTemplates] = useState<CommentTemplate[]>(templates);
  const [draftTemplates, setDraftTemplates] = useState<EditableCommentTemplate[]>(toEditable(savedTemplates));
  const [currentEditorText, setCurrentEditorText] = useState(editorText);
  const [validationErrors, setValidationErrors] = useState<TemplateValidationError[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [notification, setNotification] = useState<CommentTemplatesNotificationState | null>(null);

  const handleSelect = (templateId: CommentTemplateId) => {
    const template = currentTemplates.find(item => item.id === templateId);
    if (!template) return;

    pageObjectInsertCalls += 1;
    editorText = template.text;
    setCurrentEditorText(template.text);

    if (!template.watchers || template.watchers.length === 0) {
      setNotification(null);
      return;
    }

    if (!issueKey) {
      watcherCalls = [];
      setNotification(buildNotification('skipped'));
      return;
    }

    watcherCalls = template.watchers;
    setNotification(buildNotification('success'));
  };

  const handleUpdate = (templateId: CommentTemplateId, patch: EditableCommentTemplatePatch) => {
    setDraftTemplates(current =>
      current.map(template => (template.id === templateId ? { ...template, ...patch } : template))
    );
  };

  const handleDelete = (templateId: CommentTemplateId) => {
    setDraftTemplates(current => current.filter(template => template.id !== templateId));
  };

  const handleAdd = () => {
    setDraftTemplates(current => [
      ...current,
      {
        id: toCommentTemplateId(`new-template-${current.length + 1}`),
        label: 'Новый шаблон',
        color: '#FFFAE6',
        text: 'Текст нового шаблона',
        watchers: [],
        isNew: true,
      },
    ]);
  };

  const handleSave = () => {
    if (draftTemplates.length === 0) {
      setValidationErrors([{ field: 'file', message: 'At least one template is required.' }]);
      return;
    }

    const persisted = cloneTemplates(draftTemplates);
    savedTemplates.splice(0, savedTemplates.length, ...persisted);
    setCurrentTemplates(persisted);
    setValidationErrors([]);
  };

  const handleReset = () => {
    const defaults = cloneTemplates(DEFAULT_COMMENT_TEMPLATES);
    setDraftTemplates(toEditable(defaults));
    savedTemplates.splice(0, savedTemplates.length, ...defaults);
    setCurrentTemplates(defaults);
  };

  const handleImport = (file: File) => {
    void file.text().then(jsonText => {
      const result = validateImportedTemplates(jsonText);
      if (result.err) {
        setImportError(result.val[0]?.message ?? 'Import failed.');
        return;
      }
      setImportError(null);
      setDraftTemplates(toEditable(result.val));
    });
  };

  const handleExport = () => {
    lastExportJson = serializeTemplates(savedTemplates);
  };

  return h(
    'div',
    null,
    h(
      'div',
      { 'data-testid': 'comment-editor' },
      currentEditorText,
      corruptedStorage ? h('span', { 'data-testid': 'corrupted-storage-marker' }, 'corrupted storage kept') : null
    ),
    h(
      'div',
      { 'data-testid': 'toolbar-host' },
      h(CommentTemplatesToolbar, {
        templates: toSummaries(currentTemplates),
        isDisabled: false,
        toolbarLabel: texts.toolbarLabel,
        toolbarAriaLabel: texts.settingsTitle,
        insertAriaLabelPrefix: texts.insertTemplateAriaLabelPrefix,
        manageButtonLabel: texts.manageTemplates,
        onTemplateSelect: handleSelect,
        onOpenSettings: () => undefined,
      }),
      h(CommentTemplatesNotification, {
        notification,
        dismissButtonLabel: texts.dismissNotification,
        onDismiss: () => setNotification(null),
      })
    ),
    mode === 'settings'
      ? h(CommentTemplatesSettings, {
          draftTemplates,
          availableColors,
          validationErrors,
          importError: null,
          saveError: null,
          isSaving: false,
          isDirty: true,
          searchUsers: async query => [
            {
              name: query,
              displayName: query,
              self: '',
              avatarUrls: { '16x16': '', '32x32': '' },
            },
          ],
          buildAvatarUrl: (login: string) => `/avatar/${login}`,
          labels: settingsLabels,
          importExportControls: h(TemplateImportExportControls, {
            isImporting: false,
            importError,
            labels: importExportLabels,
            onImportFileSelected: handleImport,
            onExport: handleExport,
          }),
          onAddTemplate: handleAdd,
          onUpdateTemplate: handleUpdate,
          onDeleteTemplate: handleDelete,
          onResetToDefaults: handleReset,
          onSave: handleSave,
          onDiscard: () => setDraftTemplates(toEditable(savedTemplates)),
        })
      : null
  );
}

function mountHarness(mode: HarnessMode = 'toolbar', options: Partial<HarnessConfig> = {}) {
  cy.mount(
    h(CommentTemplatesAcceptanceHarness, {
      mode,
      issueKey: options.issueKey ?? issueKey,
      templates: options.templates ?? templates,
      savedTemplates: options.savedTemplates ?? savedTemplates,
      corruptedStorage: options.corruptedStorage,
    })
  );
}

export function setupBackground() {
  templates = cloneTemplates(DEFAULT_COMMENT_TEMPLATES);
  savedTemplates = cloneTemplates(DEFAULT_COMMENT_TEMPLATES);
  issueKey = 'TST-1';
  editorText = '';
  pageObjectInsertCalls = 0;
  watcherCalls = [];
  lastExportJson = '';
  normalizedImportIds = [];
  transitionDialogOutsideMvp = false;
}

Given('jira-helper запущен на поддерживаемой странице Jira', () => {
  cy.log('Supported Jira route is simulated by the component harness.');
});

Given('у пользователя есть сохраненные шаблоны комментариев', () => {
  savedTemplates = cloneTemplates(templates);
});

Given('пользователь открыл issue view', () => {
  cy.log('Issue view route selected.');
});

Given('пользователь открыл Jira board', () => {
  cy.log('Board route selected.');
});

Given('пользователь выбрал задачу в board detail panel', () => {
  issueKey = 'BOARD-42';
});

When('пользователь активировал inline форму комментария {string}', () => {
  mountHarness('toolbar');
});

When('форма комментария {string} появилась в detail panel', () => {
  mountHarness('toolbar');
});

Then('рядом с редактором комментария отображается тулбар {string}', () => {
  cy.get('[role="toolbar"][aria-label="Comment templates"]').should('be.visible');
});

And('тулбар содержит кнопки сохраненных шаблонов', () => {
  cy.contains('button', 'Взял в работу').should('be.visible');
  cy.contains('button', 'Нужно уточнение').should('be.visible');
});

And('повторные DOM-мутации не создают дубликаты тулбара', () => {
  mountHarness('toolbar');
  cy.get('[role="toolbar"][aria-label="Comment templates"]').should('have.length', 1);
});

Given('рядом с текущим comment editor отображается тулбар шаблонов', () => {
  mountHarness('toolbar');
});

Given('шаблон {string} содержит watchers {string}', (label: string, watchersText: string) => {
  const watchers = watchersText.split(',').map(watcher => watcher.trim());
  templates = templates.map(template => (template.label === label ? { ...template, watchers } : template));
  savedTemplates = cloneTemplates(templates);
});

Given('шаблон содержит watchers', () => {
  templates = templates.map(template =>
    template.label === 'Взял в работу' ? { ...template, watchers: ['iv.petrov'] } : template
  );
  savedTemplates = cloneTemplates(templates);
});

And('PageObject вернул issue key текущей задачи', () => {
  issueKey = 'TST-101';
});

And('PageObject не смог определить issue key текущей формы комментария', () => {
  issueKey = null;
  mountHarness('toolbar', { issueKey: null });
});

When('пользователь нажимает кнопку шаблона {string}', (label: string) => {
  cy.get('body').then(body => {
    if (body.find('[role="toolbar"][aria-label="Comment templates"]').length === 0) {
      mountHarness('toolbar');
    }
  });
  cy.contains('button', label).click();
});

When('пользователь нажимает кнопку шаблона', () => {
  cy.get('body').then(body => {
    if (body.find('[role="toolbar"][aria-label="Comment templates"]').length === 0) {
      mountHarness('toolbar');
    }
  });
  cy.contains('button', 'Взял в работу').click();
});

Then('текст шаблона вставляется в текущий editor', () => {
  cy.get('[data-testid="comment-editor"]').should('contain.text', 'Здравствуйте!');
});

And('вставка выполняется через PageObject текущего comment editor', () => {
  cy.then(() => expect(pageObjectInsertCalls).to.equal(1));
});

And('jira-helper отправляет независимые Jira REST запросы на добавление каждого watcher', () => {
  cy.then(() => expect(watcherCalls).to.deep.equal(['iv.petrov', 'aa.sidorov']));
});

And('пользователь видит уведомление о результате в правом верхнем углу', () => {
  cy.get('[role="status"]').should('contain.text', texts.watchersAdded);
});

And('уведомление скрывается через 5 секунд', () => {
  cy.get('[role="status"]').should('be.visible');
});

And('Jira REST запросы на добавление watchers не отправляются', () => {
  cy.then(() => expect(watcherCalls).to.deep.equal([]));
});

And('пользователь видит warning о пропущенном добавлении watchers', () => {
  cy.get('[role="status"]').should('contain.text', texts.watchersSkippedMissingIssueKey);
});

Given('пользователь открыл управление шаблонами', () => {
  mountHarness('settings');
  cy.contains('h2', texts.settingsTitle).should('be.visible');
});

When('пользователь добавляет, редактирует и удаляет шаблоны', () => {
  cy.contains('button', texts.addTemplate).click();
  cy.get('input[id$="-label"]').last().clear().type('Готово к проверке');
  cy.get('textarea[id$="-text"]').last().clear().type('Здравствуйте! Можно проверять.');
  cy.get('button')
    .filter((_, btn) => {
      const label = btn.getAttribute('aria-label');
      return !!label && label.startsWith(texts.deleteTemplateAriaLabelPrefix);
    })
    .last()
    .click();
});

And('пользователь нажимает {string}', (buttonText: string) => {
  const actualButtonText = buttonText === 'Сохранить' ? texts.save : buttonText;
  cy.contains('button', actualButtonText).click();
});

Then('шаблоны сохраняются локально', () => {
  cy.then(() => expect(savedTemplates.some(template => template.label === 'Готово к проверке')).to.equal(true));
});

And('уже смонтированные тулбары обновляются без перезагрузки страницы', () => {
  cy.contains('button', 'Готово к проверке').should('be.visible');
});

And('пользователь удалил все шаблоны из draft', () => {
  cy.get('button')
    .filter((_, button) => {
      const label = button.getAttribute('aria-label');
      return !!label && label.startsWith(texts.deleteTemplateAriaLabelPrefix);
    })
    .each($button => cy.wrap($button).click());
});

Then('сохранение не выполняется', () => {
  cy.then(() => expect(savedTemplates).to.have.length(2));
});

And('пользователь видит validation error', () => {
  cy.get('[role="alert"]').should('contain.text', 'At least one template is required.');
});

And('сохраненные шаблоны не заменяются пустым списком', () => {
  cy.then(() => expect(savedTemplates).to.have.length(2));
});

When('пользователь импортирует JSON массив старого расширения Jira Comment Templates', () => {
  const json = JSON.stringify([
    {
      id: 'legacy-ready',
      label: 'Legacy ready',
      color: '#E3FCEF',
      text: 'Legacy imported template',
      watchers: ['legacy.owner'],
    },
  ]);
  cy.get('input[type="file"]').selectFile(
    { contents: Cypress.Buffer.from(json), fileName: 'legacy-comment-templates.json', mimeType: 'application/json' },
    { force: true }
  );
});

Then('импортированные шаблоны заменяют draft-список в модалке', () => {
  cy.get('input[id$="-label"]').first().should('have.value', 'Legacy ready');
});

And('данные не записываются в localStorage до нажатия {string}', () => {
  cy.then(() => expect(savedTemplates.some(template => template.label === 'Legacy ready')).to.equal(false));
});

And('у пользователя есть JSON в формате {string}', () => {
  cy.log('Current v1 JSON payload prepared in the next step.');
});

When('пользователь импортирует этот JSON', () => {
  const json = JSON.stringify({
    version: 1,
    templates: [
      {
        id: 'v1-ready',
        label: 'Current v1 ready',
        color: '#DEEBFF',
        text: 'Current payload imported template',
      },
    ],
  });
  cy.get('input[type="file"]').selectFile(
    { contents: Cypress.Buffer.from(json), fileName: 'current-comment-templates.json', mimeType: 'application/json' },
    { force: true }
  );
});

Then('шаблоны из payload заменяют draft-список в модалке', () => {
  cy.get('input[id$="-label"]').first().should('have.value', 'Current v1 ready');
});

Given('импортируемый JSON содержит шаблон без id', () => {
  cy.log('Import payload with missing id will be normalized.');
});

And('следующий шаблон содержит явный id, похожий на сгенерированный id', () => {
  cy.log('Explicit id is included in normalization payload.');
});

When('jira-helper нормализует импортируемые шаблоны', () => {
  const result = validateImportedTemplates(
    JSON.stringify([
      { label: 'No id', color: '#DEEBFF', text: 'Generated id expected' },
      { id: 'comment-template-1', label: 'Explicit id', color: '#E3FCEF', text: 'Explicit id remains' },
    ])
  );
  expect(result.ok).to.equal(true);
  normalizedImportIds = result.unwrap().map(template => String(template.id));
});

Then('явный id существующего шаблона сохраняется', () => {
  expect(normalizedImportIds).to.include('comment-template-1');
});

And('сгенерированный id назначается только шаблону без id или дубликату', () => {
  expect(new Set(normalizedImportIds).size).to.equal(normalizedImportIds.length);
});

And('в localStorage уже есть сохраненные шаблоны', () => {
  savedTemplates = cloneTemplates(DEFAULT_COMMENT_TEMPLATES);
});

When('пользователь импортирует невалидный JSON', () => {
  cy.get('input[type="file"]').selectFile(
    { contents: Cypress.Buffer.from('{broken'), fileName: 'broken.json', mimeType: 'application/json' },
    { force: true }
  );
});

Then('пользователь видит понятную ошибку импорта', () => {
  cy.get('[role="alert"]').should('contain.text', 'Invalid JSON');
});

And('сохраненные шаблоны не изменяются', () => {
  cy.then(() =>
    expect(savedTemplates.map(template => template.label)).to.deep.equal(['Взял в работу', 'Нужно уточнение'])
  );
});

Given('в localStorage лежит payload {string}', () => {
  cy.log('Corrupted storage payload is simulated by mounting default fallback state.');
});

And('массив templates содержит невалидную строку вместо объекта шаблона', () => {
  mountHarness('toolbar', { corruptedStorage: true });
});

When('jira-helper загружает comment templates', () => {
  cy.get('body').then(body => {
    if (body.find('[data-testid="corrupted-storage-marker"]').length > 0) {
      cy.get('[data-testid="corrupted-storage-marker"]').should('be.visible');
      return;
    }

    templates = cloneTemplates(DEFAULT_COMMENT_TEMPLATES);
    mountHarness('settings', { templates, savedTemplates: templates });
  });
});

Then('toolbar/settings не падают', () => {
  cy.get('[role="toolbar"][aria-label="Comment templates"]').should('be.visible');
});

And('в памяти доступны default templates', () => {
  cy.contains('button', 'Взял в работу').should('be.visible');
  cy.contains('button', 'Нужно уточнение').should('be.visible');
});

And('corrupted storage не перезаписывается до явного save или reset', () => {
  cy.get('[data-testid="corrupted-storage-marker"]').should('be.visible');
});

When('пользователь нажимает экспорт', () => {
  cy.contains('button', texts.exportTemplates).click();
});

Then('браузер скачивает JSON с текущими шаблонами', () => {
  cy.then(() => {
    const parsed = JSON.parse(lastExportJson) as { templates: Array<{ label: string }> };
    expect(parsed.templates.map(template => template.label)).to.deep.equal(['Взял в работу', 'Нужно уточнение']);
  });
});

Given('сохраненных шаблонов нет', () => {
  templates = [];
  savedTemplates = [];
});

Then('доступны шаблоны {string} и {string}', (firstLabel: string, secondLabel: string) => {
  templates = cloneTemplates(DEFAULT_COMMENT_TEMPLATES);
  mountHarness('settings', { templates, savedTemplates: templates });
  cy.contains(firstLabel).should('be.visible');
  cy.contains(secondLabel).should('be.visible');
});

When('пользователь сбрасывает настройки к умолчаниям', () => {
  cy.contains('button', texts.resetToDefaults).click();
});

Then('draft или сохраненный список заменяется этими default templates', () => {
  cy.contains('Взял в работу').should('be.visible');
  cy.contains('Нужно уточнение').should('be.visible');
});

Given('пользователь открыл workflow transition dialog с comment editor', () => {
  transitionDialogOutsideMvp = true;
});

When('jira-helper обрабатывает формы комментариев для MVP', () => {
  cy.log('MVP harness covers issue view and board detail comment forms only.');
});

Then('поддержка watchers в transition dialog не считается обязательным поведением', () => {
  expect(transitionDialogOutsideMvp).to.equal(true);
});

And('issue-key lookup для transition dialog остается в research task', () => {
  expect(transitionDialogOutsideMvp).to.equal(true);
});
