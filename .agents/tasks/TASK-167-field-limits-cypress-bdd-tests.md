# TASK-167: Cypress BDD Tests — .feature.cy.tsx runners

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать Cypress component test runners для каждого .feature файла. Каждый .cy.tsx файл — минимальный (~7 строк), вся логика в step definitions и helpers.

## Файлы

```
src/features/field-limits/SettingsPage/features/
├── add-limit.feature.cy.tsx           # новый
├── edit-limit.feature.cy.tsx          # новый
├── delete-limit.feature.cy.tsx        # новый
├── modal-lifecycle.feature.cy.tsx     # новый
└── mass-operations.feature.cy.tsx     # новый
```

## Что сделать

### Каждый файл — одинаковая структура

По аналогии с `src/person-limits/SettingsPage/features/add-limit.feature.cy.tsx`:

```tsx
/// <reference types="cypress" />
import { defineFeature } from '../../../../cypress/support/bdd-runner';
import { setupBackground } from './helpers';
import featureText from './add-limit.feature?raw';
import './steps/common.steps';
import 'cypress/support/gherkin-steps/common';

defineFeature(featureText, ({ Background }) => {
  Background(() => setupBackground());
});
```

### Создать 5 файлов:

1. `add-limit.feature.cy.tsx` — impоrt `add-limit.feature?raw`
2. `edit-limit.feature.cy.tsx` — import `edit-limit.feature?raw`
3. `delete-limit.feature.cy.tsx` — import `delete-limit.feature?raw`
4. `modal-lifecycle.feature.cy.tsx` — import `modal-lifecycle.feature?raw`
5. `mass-operations.feature.cy.tsx` — import `mass-operations.feature?raw`

### Прогнать тесты

```bash
npx cypress run --component --spec "src/features/field-limits/SettingsPage/features/*.feature.cy.tsx"
```

## Критерии приёмки

- [ ] 5 .cy.tsx файлов — по одному на каждый .feature
- [ ] Формат: `/// <reference types="cypress" />` + defineFeature + Background
- [ ] Все степы из .feature матчатся с step definitions
- [ ] Все сценарии проходят: `npx cypress run --component`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`
- [ ] ESLint `require-gherkin-steps-import` добавляет импорт глобальных степов

## Зависимости

- Зависит от: [TASK-165](./TASK-165-field-limits-feature-files.md), [TASK-166](./TASK-166-field-limits-cypress-infrastructure.md)
- Референс: `src/person-limits/SettingsPage/features/*.feature.cy.tsx`
- Скиллы: `.cursor/skills/cypress-bdd-testing/SKILL.md`

---

## Результаты

**Дата**: 2026-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

{Заполняется после выполнения задачи}

**Проблемы и решения**:

{Документируй ВСЕ проблемы, с которыми столкнулся, и как их решил}
