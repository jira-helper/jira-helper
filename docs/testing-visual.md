# Visual Regression Testing

Visual regression testing captures screenshots of UI components and compares them against baseline images to detect unintended visual changes.

## Workflow

### 1. Tagging Stories for Visual Testing

Add `tags: ['visual']` to individual Storybook stories to opt them into visual testing:

```tsx
export const UnderLimit = {
  args: { limit: 10, count: 5, active: false },
  tags: ['visual']
} satisfies Story
```

**Important:** Use story-level tags, not meta-level. Only stories with `visual` tag will be screenshot-tested.

### 2. Using Deterministic Fixtures

Visual tests must be deterministic. Replace external resources with inline fixtures:

```tsx
// ❌ Bad - external URL causes flaky tests
imageUrl: 'https://example.com/avatar.jpg'

// ✅ Good - deterministic SVG
imageUrl: 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%23ccc"/></svg>'
```

### 3. Commands

```bash
# Build Storybook for visual testing
npm run visual:build

# Run visual tests against baselines
npm run visual:test

# Update baselines (when intentional visual changes occur)
npm run visual:update
```

### 4. Creating New Visual Tests

1. Add `tags: ['visual']` to relevant Storybook stories
2. Ensure stories use deterministic data (no external URLs)
3. Update `tests/visual/storybook.visual.spec.ts` guard to allow new stories
4. Run `npm run visual:update` to generate baselines
5. Commit baseline PNG files (no Git LFS needed)

### 5. CI Integration

Visual tests run in CI via `npm run visual:test`. Baseline images are platform-specific (`*-linux.png`, `*-darwin.png`, `*-win32.png`). CI must use same OS for consistent results.

### 6. Reviewing Changes

When visual tests fail:
1. Check if change is intentional
2. If intentional: run `npm run visual:update` and commit new baselines
3. If unintentional: fix the visual regression

## Git LFS Storage

Visual test snapshots (PNG files) are stored using Git LFS (Large File Storage) to keep the repository size manageable.

### Requirements
- Git LFS must be installed: `git lfs install`
- When cloning: `git clone` with LFS support or run `git lfs pull` after clone

### File tracking
- Pattern: `tests/visual/**/*.png`
- Configured in `.gitattributes`

See [Git LFS Setup](../git-lfs.md) for detailed setup instructions.

## Reference

- `playwright.config.ts` - Playwright configuration with Storybook server
- `tests/visual/storybook.visual.spec.ts` - Visual test runner with story discovery
- `src/features/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx` - Example of tagged visual stories
- `docs/git-lfs.md` - Git LFS setup and usage guide