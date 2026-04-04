# TASK-65: Добавить валидацию: пустое имя, дубликат

**Status**: DONE

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

---

## Описание

Два бага валидации:

1. **Пустое имя** — не даёт добавить (кнопка заблокирована?), но ошибка визуально не подсвечивается. Пользователь не понимает, почему не работает. Нужно показывать красную рамку/текст ошибки.
2. **Дубликат лимита** — не работает вообще. Можно добавить дубликат (тот же пользователь, те же фильтры). Должно блокировать добавление и показывать сообщение об ошибке.

## Root Cause

В `PersonalWipLimitContainer.tsx` (handleSubmit, строки 219-241) и `SettingsModalContainer.tsx` (handleAddLimit, строки 33-59) нет validation rules на Form.Item, нет проверки дубликатов.

## Файлы

```
src/person-limits/SettingsPage/
├── components/
│   ├── PersonalWipLimitContainer.tsx   # изменение — добавить rules и валидацию
│   └── SettingsModal/
│       └── SettingsModalContainer.tsx   # изменение — проверка дубликатов
└── stores/
    └── settingsUIStore.ts              # изменение — метод проверки дубликатов
```

## Что сделать

1. Добавить Ant Design Form validation `rules` на поле person name:
   - `required: true, message: 'Enter person name'`
2. Добавить визуальную обратную связь при ошибке (красная рамка, текст ошибки под полем)
3. В `settingsUIStore` добавить метод `isDuplicate(personName, columns, swimlanes, issueTypes)` — проверяет, есть ли уже лимит с таким же набором фильтров
4. В `handleSubmit` перед добавлением вызывать проверку дубликата, если дубликат — показывать ошибку
5. Заблокировать кнопку "Add limit" при невалидной форме

## Критерии приёмки

- [ ] Пустое имя: красная рамка вокруг поля + текст "Enter person name"
- [ ] Дубликат: сообщение об ошибке, лимит не добавляется
- [ ] При вводе имени ошибка пустого поля исчезает
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx` строки 219-241, 249, 257
- Референс: feature-сценарии SC-ADD-7, SC-ADD-8, SC-ADD-9 в `SettingsPage.feature`
