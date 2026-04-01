# EPIC-17: Рефакторинг shared/ — вынос сущностей с side effects в DI

**Status**: IN PROGRESS
**Created**: 2026-03-22

---

## Цель

**Проблема**: В `src/shared/` множество сущностей с side effects (I/O, DOM, state) используются через прямой import вместо DI-токенов. Это нарушает принцип архитектуры: «чистые функции — прямой import, всё остальное — через DI-токен». Результат — жёсткое зацепление, невозможность мокировать в тестах без `vi.mock`, service locator антипаттерн через `globalContainer.inject()`.

**Решение**: Создать DI-токены и регистрацию для каждой проблемной сущности. Перевести потребителей на использование DI вместо прямого импорта.

## Архитектура

```mermaid
flowchart TD
    subgraph before ["До: прямой import"]
        Feature1[Feature] -->|import| ExtService[extensionApiService singleton]
        Feature2[Feature] -->|import| JiraApi[jiraApi functions]
        Feature3[Feature] -->|import| Popup[Popup class]
        Feature4[Feature] -->|import| DomUtils[DOM utils]
        Action1[Store Action] -->|globalContainer.inject| Service[Service]
    end

    subgraph after ["После: DI tokens"]
        Feature1b[Feature] -->|di.inject| ExtToken[extensionApiServiceToken]
        Feature2b[Feature] -->|di.inject| JiraTokens[jiraApi DI tokens]
        Feature3b[Feature] -->|di.inject| PopupToken[popupToken]
        Feature4b[Feature] -->|di.inject| DomToken[domUtils DI tokens]
        Action1b[Store Action] -->|constructor DI| Service2[Service]
    end

    before --> after

    classDef badStyle fill:#FF5630,stroke:#DE350B,color:#fff
    classDef goodStyle fill:#36B37E,stroke:#00875A,color:#fff

    class ExtService,JiraApi,Popup,DomUtils,Action1 badStyle
    class ExtToken,JiraTokens,PopupToken,DomToken,Action1b,Service2 goodStyle
```

## Задачи

### Phase 1: Высокий приоритет — Services & API

| # | Task | Описание | Status |
|---|------|----------|--------|
| 169 | [TASK-169](./TASK-169-extension-api-service-di.md) | ExtensionApiService → DI token | DONE |
| 177 | [TASK-177](./TASK-177-blur-sensitive-service.md) | BlurSensitive → Service с DI | DONE |
| 178 | [TASK-178](./TASK-178-routing-service.md) | Routing → RoutingService с DI | DONE |
| 170 | [TASK-170](./TASK-170-jira-api-migrate-to-di-tokens.md) | jiraApi — перевод на DI tokens | DONE |

### Phase 2: Средний приоритет — Dead code / DOM-классы

| # | Task | Описание | Status |
|---|------|----------|--------|
| 171 | [TASK-171](./TASK-171-popup-di.md) | Popup — dead code, удалить или вынести в DI | DONE |
| 172 | [TASK-172](./TASK-172-color-picker-tooltip-di.md) | ColorPickerTooltip — dead code, удалить или вынести в DI | DONE |

### Phase 3: Средний приоритет — Store actions

| # | Task | Описание | Status |
|---|------|----------|--------|
| 173 | [TASK-173](./TASK-173-store-actions-eliminate-global-container.md) | Zustand store actions — убрать globalContainer.inject | TODO |

### Phase 4: Низкий приоритет — DOM-утилиты

| # | Task | Описание | Status |
|---|------|----------|--------|
| 174 | [TASK-174](./TASK-174-get-project-key-from-url-di.md) | getProjectKeyFromURL → DI token | DONE |
| 175 | [TASK-175](./TASK-175-get-issue-types-from-dom-di.md) | getIssueTypesFromDOM → удалено как dead code + IssueTypeService DI | DONE |
| 176 | [TASK-176](./TASK-176-dom-utils-di.md) | DOM utils — убрать прямые импорты из бизнес-кода | DONE |

## Dependencies

```mermaid
flowchart LR
    T169[TASK-169<br/>ExtensionApiService]
    T177[TASK-177<br/>BlurSensitive Service]
    T178[TASK-178<br/>Routing Service]
    T170[TASK-170<br/>jiraApi tokens]
    T171[TASK-171<br/>Popup]
    T172[TASK-172<br/>ColorPickerTooltip]
    T173[TASK-173<br/>Store actions]
    T174[TASK-174<br/>getProjectKeyFromURL]
    T175[TASK-175<br/>getIssueTypesFromDOM]
    T176[TASK-176<br/>DOM utils]

    T169 --> T177
    T169 --> T178
    T170 --> T173

    classDef phase1 fill:#FF5630,stroke:#DE350B,color:#fff
    classDef phase2 fill:#FFAB00,stroke:#FF991F,color:#000
    classDef phase3 fill:#0065FF,stroke:#0052CC,color:#fff
    classDef phase4 fill:#36B37E,stroke:#00875A,color:#fff

    class T169,T177,T178,T170 phase1
    class T171,T172 phase2
    class T173 phase3
    class T174,T175,T176 phase4
```

**Параллельно можно выполнять:**
- TASK-169, TASK-170 (Phase 1 — независимы друг от друга)
- TASK-177, TASK-178 (после TASK-169 — независимы друг от друга)
- TASK-171, TASK-172 (Phase 2 — независимы)
- TASK-174, TASK-175, TASK-176 (Phase 4 — независимы)

**Последовательно:**
- TASK-169 → TASK-177, TASK-178 (нужен `extensionApiServiceToken`)
- TASK-170 → TASK-173 (store actions используют jiraApi tokens)

## Acceptance Criteria

- [ ] Все сущности с side effects из `src/shared/` имеют DI-токены
- [ ] Нет прямых импортов сервисов с side effects (кроме DI инфраструктуры)
- [ ] Нет `globalContainer.inject()` в store action-функциях
- [ ] Все тесты проходят: `npm test`
- [ ] ESLint без ошибок: `npm run lint:eslint -- --fix`
