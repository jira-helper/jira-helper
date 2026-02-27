# TASK-69: Обновить .feature файлы по результатам тестирования

**Status**: DONE

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

---

## Описание

После исправления багов (TASK-64..68) нужно обновить .feature файлы Personal WIP Limits,
чтобы они отражали актуальное поведение. **Требуется ручное ревью перед мержем.**

## Файлы

```
src/person-limits/SettingsPage/
└── SettingsPage.feature                # изменение
src/person-limits/BoardPage/
└── board-page.feature                  # проверить актуальность
```

## Что сделать

1. Обновить сценарии формы (SC-ADD-*):
   - Добавить/уточнить шаг про сброс формы после добавления лимита
   - Убедиться, что валидация описана с визуальной обратной связью

2. Обновить сценарии валидации:
   - SC-ADD-7 (пустое имя): уточнить "should see a validation error" — красная рамка + текст
   - SC-ADD-9 (дубликат): уточнить формулировку ошибки

3. Обновить сценарии редактирования:
   - SC-EDIT-3 (изменение имени): убрать упоминание displayName, использовать login
   - SC-EDIT-4..6: уточнить, что swimlanes/columns работают независимо

4. Удалить сценарии массовых операций:
   - SC-MASS-1 (Apply columns to multiple limits)
   - SC-MASS-2 (Apply swimlanes to multiple limits)

5. Удалить связанные BDD-тесты для удалённых сценариев

## Критерии приёмки

- [ ] .feature файлы отражают актуальное поведение после багфиксов
- [ ] Удалены сценарии массовых операций (SC-MASS-*)
- [ ] Сценарии валидации описывают визуальную обратную связь
- [ ] Сценарии редактирования не упоминают displayName
- [ ] **Ручное ревью пройдено**
- [ ] BDD-тесты для удалённых сценариев удалены/обновлены
- [ ] Тесты проходят: `npm test`

## Зависимости

- Зависит от: [TASK-64](./TASK-64-fix-form-reset-after-add.md)
- Зависит от: [TASK-65](./TASK-65-add-validation-errors.md)
- Зависит от: [TASK-66](./TASK-66-show-login-in-table.md)
- Зависит от: [TASK-67](./TASK-67-fix-swimlane-column-coupling.md)
- Зависит от: [TASK-68](./TASK-68-remove-mass-operations.md)
- Референс: `src/person-limits/SettingsPage/SettingsPage.feature`
