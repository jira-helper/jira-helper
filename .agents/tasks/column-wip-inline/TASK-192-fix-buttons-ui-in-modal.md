# TASK-192: Fix — UI кнопок Save/Cancel в модалке панели JH

**Status**: TODO

**Parent**: [EPIC-19](./EPIC-19-column-wip-inline-board-tab.md)

---

## Описание

Сейчас в модалке панели Jira Helper кнопки Save/Cancel от таба и кнопки от внешней модалки визуально конфликтуют:
- Кнопки таба слева внизу
- Кнопки модалки справа внизу
- Не разделены визуально

## Что сделать

1. **Кнопки таба — справа**: выровнять по правому краю (`justify-content: flex-end`)
2. **Кнопки внешней модалки — отделены чертой**: footer модалки с `border-top` / `Divider`
3. **Тексты кнопок**: 
   - Save → "Сохранить конфигурацию" (en: "Save configuration")
   - Cancel → "Отменить изменения" (en: "Discard changes")
4. **При отмене**: восстанавливаем состояние контента таба (re-init из property)
5. **При сохранении**: сохраняем и перерисовываем борд (уже работает)

## Файлы

```
src/column-limits/SettingsTab/ColumnLimitsSettingsTab.tsx    # кнопки: выравнивание + тексты
src/column-limits/SettingsPage/texts.ts                     # новые ключи: saveConfig, discardChanges
src/board-settings/BoardSettingsComponent.tsx                # footer модалки: border-top / divider
```

## Критерии приёмки

- [ ] Кнопки таба выровнены справа
- [ ] Footer модалки отделён чертой от контента
- [ ] Тексты кнопок: "Сохранить конфигурацию" / "Отменить изменения"
- [ ] Cancel восстанавливает состояние таба
- [ ] Save сохраняет и перерисовывает
- [ ] i18n: тексты в en и ru
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: request-fixes.md (проблема 2)
