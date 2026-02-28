# TASK-92: Создать глобальные step definitions

**Status**: DONE

**Parent**: Standalone

**Note**: Используем ESLint 8 + `eslint-plugin-local-rules`. После [TASK-93](./TASK-93-eslint-9-migration.md) можно упростить.

---

## Описание

Создать набор универсальных step definitions для переиспользования во всех BDD тестах.

## Что сделать

### 1. Создать `cypress/support/gherkin-steps/common.ts`

```typescript
import { When, Then } from '../bdd-runner';

// === Text Visibility ===
Then('I see text {string}', (text: string) => {
  cy.contains(text).should('be.visible');
});

Then('I do not see text {string}', (text: string) => {
  cy.contains(text).should('not.exist');
});

// === Buttons ===
Then('I see {string} button', (text: string) => {
  cy.contains('button', text).should('be.visible');
});

Then('I do not see {string} button', (text: string) => {
  cy.contains('button', text).should('not.exist');
});

When('I click {string} button', (text: string) => {
  cy.contains('button', text).click();
});

When('I click {string}', (text: string) => {
  cy.contains(text).click();
});

// === Checkboxes ===
Then('I see checkbox {string} is checked', (label: string) => {
  cy.contains('label', label).find('input[type="checkbox"]').should('be.checked');
});

Then('I see checkbox {string} is unchecked', (label: string) => {
  cy.contains('label', label).find('input[type="checkbox"]').should('not.be.checked');
});

When('I check {string}', (label: string) => {
  cy.contains('label', label).find('input[type="checkbox"]').check({ force: true });
});

When('I uncheck {string}', (label: string) => {
  cy.contains('label', label).find('input[type="checkbox"]').uncheck({ force: true });
});

// === Modal ===
Then('I see the modal', () => {
  cy.get('[role="dialog"]').should('be.visible');
});

Then('I do not see the modal', () => {
  cy.get('[role="dialog"]').should('not.exist');
});

// === Inputs ===
Then('I see input {string} has value {string}', (label: string, value: string) => {
  cy.contains('label', label).parent().find('input').should('have.value', value);
});

When('I type {string} into {string} input', (text: string, label: string) => {
  cy.contains('label', label).parent().find('input').clear().type(text);
});

When('I clear {string} input', (label: string) => {
  cy.contains('label', label).parent().find('input').clear();
});

// === Elements by selector ===
Then('I see element {string}', (selector: string) => {
  cy.get(selector).should('be.visible');
});

Then('I do not see element {string}', (selector: string) => {
  cy.get(selector).should('not.exist');
});
```

### 2. Обновить существующие feature тесты

Добавить импорт `gherkin-steps/common` в каждый `.feature.cy.tsx`:

```typescript
import 'cypress/support/gherkin-steps/common';
```

### 3. Удалить дублирующие степы из domain-specific файлов

Проверить и удалить из:
- `src/person-limits/SettingsPage/features/steps/common.steps.ts`
- `src/column-limits/SettingsPage/features/steps/common.steps.ts`

Степы которые дублируются (заменить на глобальные):
- `When I click {string}` → уже глобальный
- `Then the modal should be closed` → `Then I do not see the modal`
- `Then checkbox {string} should be checked/unchecked` → `Then I see checkbox {string} is checked/unchecked`
- `When I check/uncheck {string}` → уже глобальный

### 4. Создать ESLint плагин для автоимпорта gherkin-steps

**Файл:** `eslint-local-rules/require-gherkin-steps-import.js`

```javascript
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require gherkin-steps import in .feature.cy.tsx files',
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    
    // Only check .feature.cy.tsx files
    if (!filename.endsWith('.feature.cy.tsx')) {
      return {};
    }

    let hasGherkinStepsImport = false;
    let lastImportNode = null;

    return {
      ImportDeclaration(node) {
        lastImportNode = node;
        if (node.source.value.includes('gherkin-steps/common')) {
          hasGherkinStepsImport = true;
        }
      },
      'Program:exit'(node) {
        if (!hasGherkinStepsImport) {
          context.report({
            node,
            message: 'Missing gherkin-steps/common import in feature test file',
            fix(fixer) {
              const importStatement = "import 'cypress/support/gherkin-steps/common';\n";
              if (lastImportNode) {
                return fixer.insertTextAfter(lastImportNode, '\n' + importStatement);
              }
              return fixer.insertTextBefore(node.body[0], importStatement);
            },
          });
        }
      },
    };
  },
};
```

**Регистрация в `.eslintrc.js`:**

```javascript
module.exports = {
  // ...
  plugins: ['eslint-plugin-local-rules'],
  rules: {
    'local-rules/require-gherkin-steps-import': 'error',
  },
};
```

**Или через `eslint-plugin-local-rules`:**

1. Установить: `npm install -D eslint-plugin-local-rules`
2. Создать `eslint-local-rules/index.js`:
```javascript
module.exports = {
  'require-gherkin-steps-import': require('./require-gherkin-steps-import'),
};
```

### 5. Обновить скилл BDD testing

Добавить в `.cursor/skills/cypress-bdd-testing/SKILL.md`:
- Информацию о глобальных степах в `cypress/support/gherkin-steps/common.ts`
- Инструкцию импортировать `gherkin-steps/common` в каждый тест
- Список доступных глобальных степов
- Упомянуть ESLint правило которое автоматически добавит импорт

## Критерии приёмки

- [ ] `cypress/support/gherkin-steps/common.ts` создан
- [ ] ESLint плагин `require-gherkin-steps-import` создан и работает
- [ ] `npm run lint:eslint -- --fix` автоматически добавляет импорт
- [ ] Все существующие тесты обновлены для использования глобальных степов
- [ ] Дублирующие степы удалены из domain-specific файлов
- [ ] Все тесты проходят
- [ ] Скилл обновлён

## Глобальные степы (итоговый список)

### When (actions)
- `When I click {string}` — click by text
- `When I click {string} button` — click button by text
- `When I check {string}` — check checkbox by label
- `When I uncheck {string}` — uncheck checkbox by label
- `When I type {string} into {string} input` — type into input by label
- `When I clear {string} input` — clear input by label

### Then (assertions)
- `Then I see text {string}` — text visible
- `Then I do not see text {string}` — text not exist
- `Then I see {string} button` — button visible
- `Then I do not see {string} button` — button not exist
- `Then I see checkbox {string} is checked` — checkbox checked
- `Then I see checkbox {string} is unchecked` — checkbox unchecked
- `Then I see input {string} has value {string}` — input value
- `Then I see the modal` — modal open
- `Then I do not see the modal` — modal closed
- `Then I see element {string}` — element by selector visible
- `Then I do not see element {string}` — element by selector not exist

---

## Результаты

**Дата**: 2025-02-28

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

- Создан `cypress/support/gherkin-steps/common.ts` с глобальными степами
- Установлен `eslint-plugin-local-rules`, добавлен `eslint-local-rules/` с правилом `require-gherkin-steps-import`
- Добавлен `package.json` с `"type": "commonjs"` в eslint-local-rules для совместимости с ESM-проектом
- Обновлён `.eslintrc.cjs`: плагин и правило
- Импорт `gherkin-steps/common` добавлен во все 20 `.feature.cy.tsx` (через `lint --fix`)
- Удалены дублирующие степы из person-limits и column-limits `common.steps.ts`
- Обновлены .feature: "the modal should be closed" → "I do not see the modal", "checkbox X should be checked" → "I see checkbox X is checked"
- Добавлен Vite alias в `cypress.config.ts` для резолва `cypress/support/gherkin-steps/common` (Vite иначе ищет в пакете cypress)
- Обновлён скилл cypress-bdd-testing
- Все 135 feature BDD тестов проходят
