# TASK-113: Days in Column — EN + RU docs (Jira prerequisite)

**Status**: DONE
**Type**: other

**Parent**: [EPIC-8](./EPIC-8-days-in-column-jira-prerequisite.md)

---

## Описание

Дополнить user guide фичи «Days in Column» в EN и RU локалях явным prerequisite: фича работает только при включённой настройке Jira «Show days in column» / «Показывать дни в колонке». Три точки заметности: блок сразу после metadata table, bullet в How to configure, Troubleshooting. Текст-черновик и структура — в [target-design.md](./target-design.md); формулировки — паритет с `TEXTS.jiraSettingsRequired` в `DaysInColumnSettings.tsx`.

## Файлы

```
website/docs/features/card-information/
└── days-in-column.md                    # EN: + Prerequisites, configure bullet, Troubleshooting

website/i18n/ru/docusaurus-plugin-content-docs/current/features/card-information/
└── days-in-column.md                    # RU: + Требования, configure bullet, новый Troubleshooting
```

## Что сделать

1. **EN** — после таблицы метаданных добавить `## Prerequisites` (см. target-design § «EN — days-in-column.md»).
2. **EN** — в секции «How to configure» / «How to configure» добавить bullet про Jira board setting «Show days in column».
3. **EN** — расширить пункт **Badge missing** в Troubleshooting: упомянуть настройку Jira и путь Board configuration → Card layout.
4. **RU** — после таблицы метаданных добавить `## Требования` (см. target-design § «RU — days-in-column.md»).
5. **RU** — в «Как настроить» добавить bullet про «Показывать дни в колонке».
6. **RU** — добавить секцию `## Troubleshooting` в конце файла (сейчас отсутствует); пункт про отсутствующий бейдж + остальные пункты из target-design.
7. Сохранить стиль соседних bullets; обязательны: **only / только если**, точные лейблы настройки, путь UI как в Alert.

## Критерии приёмки

- [x] EN: `## Prerequisites` сразу после metadata table (@SC-DOC-EN-1)
- [x] EN: bullet в How to configure про «Show days in column» (@SC-DOC-EN-2)
- [x] EN: Troubleshooting «Badge missing» упоминает настройку Jira (@SC-DOC-EN-3)
- [x] RU: `## Требования` сразу после metadata table (@SC-DOC-RU-1)
- [x] RU: bullet в «Как настроить» про «Показывать дни в колонке» (@SC-DOC-RU-2)
- [x] RU: `## Troubleshooting` с пунктом про отсутствующий бейдж (@SC-DOC-RU-3)
- [x] Формулировки и пути совпадают с Alert (@SC-DOC-PARITY-1)
- [x] Файлы под `src/` не изменены
- [ ] Acceptance checklist: [days-in-column-jira-prerequisite-docs.feature](./days-in-column-jira-prerequisite-docs.feature)

## Зависимости

- Референс UI: `src/features/additional-card-elements/BoardSettings/DaysInColumnSettings.tsx` (`TEXTS.jiraSettingsRequired`, `data-testid="days-in-column-jira-settings-required"`)
- Текст-черновик: [target-design.md](./target-design.md) § «Текст-черновик»
- Требования: [requirements.md](./requirements.md) FR-1 … FR-4

---

## Результаты

**Дата**: 2026-08-04

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- EN `days-in-column.md`: добавлен `## Prerequisites` после metadata table с **only if**, лейблом «Show days in column» и путём Board configuration → Card layout
- EN: bullet **Jira board setting** в How to configure (после включения бейджа)
- EN: расширен пункт **Badge missing** в Troubleshooting — упоминание настройки Jira
- RU `days-in-column.md`: добавлен `## Требования` после metadata table с **только если**, «Показывать дни в колонке» и путём Настройки доски → Макет карточки
- RU: bullet **Настройка доски Jira** в «Как настроить»
- RU: новая секция `## Troubleshooting` (4 пункта, включая отсутствующий бейдж + настройку Jira)

**Проблемы и решения**:

Нет.
