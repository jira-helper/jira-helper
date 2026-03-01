# TASK-93: Миграция на ESLint 9 (flat config)

**Status**: DONE

**Parent**: Standalone

---

## Описание

Мигрировать проект с ESLint 8 на ESLint 9 с flat config для упрощения работы с локальными правилами.

## Текущее состояние

- ESLint: 8.57.1
- Конфиг: `.eslintrc.cjs`
- Плагины: airbnb, prettier, storybook, @typescript-eslint

## Что сделать

### 1. Обновить ESLint и зависимости

```bash
npm install eslint@^9 --save-dev
npm install @eslint/js --save-dev
npm install globals --save-dev
```

### 2. Проверить совместимость плагинов

| Плагин | Совместимость с ESLint 9 |
|--------|--------------------------|
| eslint-config-airbnb | Проверить |
| eslint-plugin-prettier | Проверить |
| eslint-plugin-storybook | Проверить |
| @typescript-eslint | v8+ поддерживает |

### 3. Создать `eslint.config.js`

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    rules: {
      // migrate rules from .eslintrc.cjs
    },
  },
  // Local rules for feature tests
  {
    files: ['**/*.feature.cy.tsx'],
    plugins: {
      local: {
        rules: {
          'require-gherkin-steps-import': require('./eslint-rules/require-gherkin-steps-import'),
        },
      },
    },
    rules: {
      'local/require-gherkin-steps-import': 'error',
    },
  },
];
```

### 4. Перенести правила из `.eslintrc.cjs`

Конвертировать все существующие правила в формат flat config.

### 5. Удалить старый конфиг

```bash
rm .eslintrc.cjs
```

### 6. Обновить локальные правила

Перенести `eslint-local-rules/` → `eslint-rules/` и интегрировать в flat config.

### 7. Проверить

```bash
npm run lint:eslint
npm run lint:eslint -- --fix
```

## Критерии приёмки

- [ ] ESLint 9 установлен
- [ ] `eslint.config.js` создан
- [ ] Все существующие правила перенесены
- [ ] Локальные правила работают без `eslint-plugin-local-rules`
- [ ] `.eslintrc.cjs` удалён
- [ ] `npm run lint:eslint` проходит
- [ ] CI/CD работает

## Зависимости

- После: TASK-92 (gherkin steps) — можно выполнить после или вместе

## Риски

- Несовместимость плагинов (airbnb особенно)
- Breaking changes в конфигурации
- Время на отладку

## Ресурсы

- [ESLint 9 Migration Guide](https://eslint.org/docs/latest/use/migrate-to-9.0.0)
- [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
