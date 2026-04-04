# TASK-44: Кнопки Settings Page должны быть в строку

## Описание

Сейчас кнопки на странице Columns Settings выстраиваются в колонку (вертикально). Нужно расположить их в строку (горизонтально).

## Проблема

Каждая фича создаёт свой контейнер div и вставляет его через `insertAdjacentElement('beforebegin')`, что приводит к вертикальному расположению.

## Решение

Создать общий контейнер с `display: flex` и `gap` для всех кнопок Settings Page.

### Вариант 1: Общий контейнер в первой фиче

Первая загружающаяся фича (`column-limits`) создаёт общий контейнер:
```html
<div id="jh-settings-buttons-container" style="display: flex; gap: 8px; margin-bottom: 10px;">
  <!-- кнопки вставляются сюда -->
</div>
```

Остальные фичи проверяют наличие контейнера и вставляют кнопки внутрь.

### Вариант 2: CSS для существующих контейнеров

Добавить CSS в общие стили:
```css
#ghx-config-columns > div[id*="button-container"],
#ghx-config-columns > div[id*="settings-root"] {
  display: inline-block;
  margin-right: 8px;
}
```

## Файлы для изменения

1. `src/column-limits/SettingsPage/index.ts` — создать общий контейнер
2. `src/person-limits/SettingsPage/index.tsx` — использовать общий контейнер
3. `src/wiplimit-on-cells/SettingsPage/index.tsx` — использовать общий контейнер

Или:

1. `src/shared/styles/settings-page.css` — добавить CSS для inline layout

## Acceptance Criteria

- [ ] Кнопки отображаются в строку (горизонтально)
- [ ] Между кнопками есть отступ (gap)
- [ ] Порядок кнопок сохраняется
- [ ] Build проходит
