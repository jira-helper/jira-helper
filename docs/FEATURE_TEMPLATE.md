# Feature Documentation Template

Use this template when creating `feature.md` and `feature.ru.md` files for new features.

## Template Structure

```markdown
# Feature Name

One-sentence description of what this feature does and its main benefit.

## What it does

- Main capability 1
- Main capability 2
- Main capability 3

## How to set up

1. Step one to configure
2. Step two to configure
3. Step three to configure

Note any permissions required (e.g., "Only board administrators can change these settings").

## Behavior on the board

Describe how the feature looks and behaves once enabled:
- Visual indicators
- User interactions
- Edge cases or special conditions
```

## Guidelines

### File naming
- English: `feature.md`
- Russian: `feature.ru.md`

### H1 Title
- **English file**: Use English feature name
- **Russian file**: Use Russian translation of feature name (not English)

### Sections
All feature docs must have these 3 sections:
1. **What it does** / **Что делает** — capabilities list
2. **How to set up** / **Как настроить** — configuration steps
3. **Behavior on the board** / **Поведение на доске** — runtime behavior

### For complex features
If the feature has multiple sub-features (like Additional Card Elements), use H3 subsections under "What it does":

```markdown
## What it does

### Sub-feature 1
- Detail A
- Detail B

### Sub-feature 2
- Detail C
- Detail D
```

### Additional files (optional)
- `ARCHITECTURE.md` — for complex features with multiple modules/components
- `USER-GUIDE.md` — detailed step-by-step guide (if feature is complex)
- `REQUIREMENTS.md` — product requirements and acceptance criteria

## Example

See existing feature documentation:
- Simple feature: `src/card-colors/feature.md`
- Complex feature: `src/features/additional-card-elements/feature.md`
- Feature with full docs: `src/person-limits-module/` (feature.md, ARCHITECTURE.md, USER-GUIDE.md, REQUIREMENTS.md)
