---
name: storybook
description: Написание Storybook stories для визуального тестирования компонентов в jira-helper. Используй при создании View-компонентов, добавлении stories или визуальном ревью.
---

# Storybook Stories

## Обязательный контекст

**Прочитай перед началом работы**:
- `docs/testing-storybook.md` — полное руководство: title, args vs render, обязательные stories, фикстуры, декораторы
- `docs/testing-visual.md` — Visual regression testing workflow

## Tags

- `autodocs` — Generate automatic documentation for stories
- `visual` — Opt-in to visual regression testing. Story will be captured in Playwright screenshot tests. Requires deterministic data (no external URLs).

## Чек-лист

- [ ] Файл `*.stories.tsx` рядом с компонентом
- [ ] `title` по формату `Feature/Page/Component`
- [ ] `tags: ['autodocs']`
- [ ] `tags: ['visual']` for visual regression testing (if applicable)
- [ ] Story `Default` с типичными данными
- [ ] Stories для ключевых бизнес-состояний
- [ ] Реалистичные фикстуры (не "test123")
- [ ] `args` вместо `render` где возможно
- [ ] Storybook запускается без ошибок
- [ ] For visual tests: deterministic data, no external URLs

## Visual Testing

Tag stories with `tags: ['visual']` for visual regression testing. See [Visual Testing Guide](../../../docs/testing-visual.md) for workflow details.
