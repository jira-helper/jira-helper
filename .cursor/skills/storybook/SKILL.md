---
name: storybook
description: Написание Storybook stories для визуального тестирования компонентов в jira-helper. Используй при создании View-компонентов, добавлении stories или визуальном ревью.
---

# Storybook Stories

## Обязательный контекст

**Прочитай перед началом работы**:
- `docs/testing-storybook.md` — полное руководство: title, args vs render, обязательные stories, фикстуры, декораторы

## Чек-лист

- [ ] Файл `*.stories.tsx` рядом с компонентом
- [ ] `title` по формату `Feature/Page/Component`
- [ ] `tags: ['autodocs']`
- [ ] Story `Default` с типичными данными
- [ ] Stories для ключевых бизнес-состояний
- [ ] Реалистичные фикстуры (не "test123")
- [ ] `args` вместо `render` где возможно
- [ ] Storybook запускается без ошибок
