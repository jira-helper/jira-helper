# Requirements: Локальные toggle для Comment Templates и Gantt

**Feature folder**: `.agents/tasks/local-feature-toggles/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-05-17
**Статус**: agreed
**Has UI**: yes

## 1. Цель и мотивация

Дать пользователю быстрый способ локально отключить отдельные фичи расширения в конкретном браузере без потери накопленных настроек и данных. Отключение должно сразу влиять на runtime-поведение фичи, но не лишать пользователя доступа к её настройкам и повторному включению.

## 2. Пользователи и контекст

- Роли / контекст использования: пользователь Jira с установленным `jira-helper`, который хочет временно отключить конкретную фичу.
- Страницы Jira и точки входа:
  - Comment Templates: tab настроек board/issue.
  - Gantt: tab настроек issue.
- Точка входа: toggle `Feature enabled` в верхней части соответствующего tab.

## 3. Функциональные требования

1. **FR-1**: Для Comment Templates и Gantt существует локальный флаг `enabled` в storage соответствующей фичи.
2. **FR-2**: Значение по умолчанию для обеих фич — `enabled = true`.
3. **FR-3**: При `enabled = false` runtime-интеграция фичи отключается:
   - Comment Templates toolbar не подключается/удаляется.
   - Gantt chart section не рендерится/удаляется (settings toolbar остаётся доступным).
4. **FR-4**: Tab настроек каждой фичи остаётся доступным при `enabled = false`.
5. **FR-5**: В tab настроек при `enabled = false` показываются только:
   - заголовок фичи,
   - toggle `Feature enabled`,
   - короткий explanatory hint.
6. **FR-6**: При `enabled = true` в tab показывается полный текущий контент настроек фичи.
7. **FR-7**: Переключение toggle сохраняет новое значение в local storage и сразу применяется в текущей сессии.
8. **FR-8**: При выключении фичи данные не удаляются:
   - Comment Templates rows сохраняются.
   - Gantt scope settings сохраняются.
9. **FR-9**: Доступность tab по роутам не меняется:
   - Comment Templates: board + issue settings.
   - Gantt: issue settings.
10. **FR-10**: UI toggle для обеих фич соответствует единому минималистичному контракту (верх таба, без карточек/alerts).

## 4. Сценарии (happy path + важные края)

### S1: Disable Comment Templates в settings
- Given пользователь открыл tab Comment Templates
- When выключает `Feature enabled`
- Then состояние `enabled=false` сохраняется в Comment Templates storage
- And runtime toolbar Comment Templates удаляется/не подключается
- And tab остаётся доступным с toggle и hint

### S2: Re-enable Comment Templates
- Given Comment Templates выключен локально
- When пользователь включает `Feature enabled`
- Then состояние `enabled=true` сохраняется
- And runtime toolbar снова подключается
- And ранее сохранённые шаблоны доступны без потери данных

### S3: Disable Gantt в settings
- Given пользователь открыл tab Gantt
- When выключает `Feature enabled`
- Then состояние `featureEnabled=false` сохраняется в Gantt settings storage
- And runtime chart section удаляется/не рендерится
- And tab остаётся доступным с toggle и hint

### S4: Re-enable Gantt
- Given Gantt выключен локально
- When пользователь включает `Feature enabled`
- Then runtime chart section снова доступен
- And ранее сохранённые настройки Gantt применяются без повторной настройки

### S5: Backward compatibility для старых payload
- Given в storage нет поля `enabled/featureEnabled` (legacy payload)
- When модель загружает данные
- Then фича считается включённой по умолчанию (`true`)
- And существующие данные корректно читаются

## 5. Данные и миграции

- Источник истины:
  - Comment Templates: payload в `jira_helper_comment_templates` расширен полем `enabled`.
  - Gantt: payload `jh-gantt-settings` расширен полем `featureEnabled`.
- Миграции / совместимость:
  - Старые payload без флага поддерживаются.
  - При отсутствии флага используется default `true`.
- Удаление существующих данных при переключении ON/OFF запрещено.

## 6. Нефункциональные требования

- Изменение toggle применяется без перезагрузки страницы.
- Unit-тесты покрывают:
  - сохранение toggle в storage,
  - восстановление флага из storage,
  - отсутствие потери данных при переключении.
- Для UI-статусов ON/OFF есть Storybook-сценарии для обеих фич.
- i18n для новых UI-текстов (RU/EN) обязателен.

## 7. Вне scope

- Глобальный централизованный toggle для всех фич.
- Перенос toggle в модуль `local-settings`.
- Серверная синхронизация флагов между браузерами/устройствами.
- Очистка данных при выключении фичи.

## 8. Открытые вопросы

- [ ] Нет.

## 9. Черновик критериев приёмки (для EPIC / BDD)

- [ ] В каждом feature-tab (Comment Templates, Gantt) есть локальный toggle `Feature enabled`.
- [ ] OFF отключает runtime фичу сразу в текущей сессии.
- [ ] OFF не скрывает tab настроек фичи.
- [ ] OFF показывает только toggle и disabled hint.
- [ ] ON возвращает полный контент настроек.
- [ ] Данные фич сохраняются при OFF/ON.
- [ ] Legacy payload без флагов остаётся совместимым (default true).
- [ ] Тексты новых элементов покрыты RU/EN.
- [ ] Unit tests по моделям и runtime-поведению проходят.

## 10. UI Wireframe

### Comment Templates tab — ON

```
+------------------------------------------------------+
| Comment templates                    Feature enabled |
|                                       [ ON ]         |
+------------------------------------------------------+
| [полный контент настроек шаблонов]                   |
| - список шаблонов                                    |
| - импорт/экспорт                                     |
| - save/reset                                         |
+------------------------------------------------------+
```

### Comment Templates tab — OFF

```
+------------------------------------------------------+
| Comment templates                    Feature enabled |
|                                       [ OFF ]        |
+------------------------------------------------------+
| Comment templates are disabled locally in browser... |
+------------------------------------------------------+
```

### Gantt tab — ON

```
+------------------------------------------------------+
| Gantt Chart                          Feature enabled |
|                                       [ ON ]         |
+------------------------------------------------------+
| [полный контент настроек Gantt]                      |
| - scope selector                                     |
| - mappings/filters                                   |
| - save/copy-from                                     |
+------------------------------------------------------+
```

### Gantt tab — OFF

```
+------------------------------------------------------+
| Gantt Chart                          Feature enabled |
|                                       [ OFF ]        |
+------------------------------------------------------+
| Gantt is disabled locally in this browser...         |
+------------------------------------------------------+
```
