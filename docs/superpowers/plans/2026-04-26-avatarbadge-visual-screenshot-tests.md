# AvatarBadge Visual Screenshot Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add free visual regression tests for selected Storybook stories by tagging `AvatarBadge` stories with `visual` and screenshot-testing only those stories with Playwright.

**Architecture:** Keep Storybook as the source of visual states and add an external Playwright visual runner that discovers tagged stories from Storybook's `index.json`. Limit initial scope to `AvatarBadge` and make story assets deterministic so visual baselines are stable.

**Tech Stack:** Storybook 10, React, Playwright, Node 20, npm scripts, static Storybook build

---

## File Map

- Modify: `src/features/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx`
  - Add `visual` tags only to approved stories.
  - Replace remote avatar URL with deterministic inline data URI.
- Create: `playwright.config.ts`
  - Configure Playwright for local visual testing against built Storybook.
- Create: `tests/visual/storybook.visual.spec.ts`
  - Load `storybook-static/index.json`, filter stories by `visual` tag, and assert screenshots.
- Modify: `package.json`
  - Add scripts for building Storybook and running/updating visual baselines.

### Task 1: Tag AvatarBadge Visual Stories

**Files:**
- Modify: `src/features/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx`
- Test: `tests/visual/storybook.visual.spec.ts`

- [ ] **Step 1: Write the failing visual test discovery assertion**

Create `tests/visual/storybook.visual.spec.ts` with an initial test that expects at least one `visual` story in the built Storybook index.

```ts
import { test, expect } from '@playwright/test';

type StorybookIndexEntry = {
  id: string;
  title: string;
  name: string;
  type: string;
  tags?: string[];
};

type StorybookIndex = {
  entries: Record<string, StorybookIndexEntry>;
};

test('storybook contains visual-tagged stories', async ({ request }) => {
  const response = await request.get('http://127.0.0.1:6006/index.json');
  expect(response.ok()).toBe(true);

  const index = (await response.json()) as StorybookIndex;
  const visualStories = Object.values(index.entries).filter(entry => entry.type === 'story' && entry.tags?.includes('visual'));

  expect(visualStories.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Add deterministic visual states to `AvatarBadge` stories**

Replace the remote avatar URL and tag only the approved stories.

```ts
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarBadge } from './AvatarBadge';

const meta: Meta<typeof AvatarBadge> = {
  title: 'PersonLimitsModule/BoardPage/AvatarBadge',
  component: AvatarBadge,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof AvatarBadge>;

const defaultAvatar =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="16" fill="#dbeafe" />
      <circle cx="16" cy="12" r="6" fill="#60a5fa" />
      <path d="M6 28c2.5-5 7-8 10-8s7.5 3 10 8" fill="#60a5fa" />
    </svg>
  `);

export const UnderLimit: Story = {
  tags: ['visual'],
  args: {
    avatar: defaultAvatar,
    personName: 'john.doe',
    currentCount: 3,
    limit: 5,
    isActive: false,
    limitId: 1,
  },
};

export const AtLimit: Story = {
  tags: ['visual'],
  args: {
    avatar: defaultAvatar,
    personName: 'jane.smith',
    currentCount: 5,
    limit: 5,
    isActive: false,
    limitId: 2,
  },
};

export const OverLimit: Story = {
  tags: ['visual'],
  args: {
    avatar: defaultAvatar,
    personName: 'bob.johnson',
    currentCount: 7,
    limit: 5,
    isActive: false,
    limitId: 3,
  },
};

export const Active: Story = {
  tags: ['visual'],
  args: {
    avatar: defaultAvatar,
    personName: 'alice.brown',
    currentCount: 2,
    limit: 4,
    isActive: true,
    limitId: 4,
  },
};

export const ActiveOverLimit: Story = {
  tags: ['visual'],
  args: {
    avatar: defaultAvatar,
    personName: 'charlie.wilson',
    currentCount: 6,
    limit: 3,
    isActive: true,
    limitId: 5,
  },
};

export const MultipleAvatars: Story = {
  tags: ['visual'],
  render: () => (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      <AvatarBadge avatar={defaultAvatar} personName="john.doe" currentCount={3} limit={5} isActive={false} onClick={() => {}} limitId={1} />
      <AvatarBadge avatar={defaultAvatar} personName="jane.smith" currentCount={5} limit={5} isActive onClick={() => {}} limitId={2} />
      <AvatarBadge avatar={defaultAvatar} personName="bob.johnson" currentCount={7} limit={5} isActive={false} onClick={() => {}} limitId={3} />
    </div>
  ),
};
```

- [ ] **Step 3: Build Storybook and verify tagged stories appear in `index.json`**

Run: `npm run build-storybook`

Expected: PASS and `storybook-static/index.json` exists.

- [ ] **Step 4: Run the visual discovery test and verify it passes**

Run: `npx playwright test tests/visual/storybook.visual.spec.ts --grep "visual-tagged stories"`

Expected: PASS with at least the six tagged `AvatarBadge` stories discovered.

- [ ] **Step 5: Commit**

```bash
git add src/features/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx tests/visual/storybook.visual.spec.ts
git commit -m "test: tag avatar badge visual stories"
```

### Task 2: Add Playwright Visual Runner For Tagged Stories

**Files:**
- Create: `playwright.config.ts`
- Modify: `tests/visual/storybook.visual.spec.ts`

- [ ] **Step 1: Extend the failing test to screenshot only tagged stories**

Replace the placeholder test file with a helper that loads `index.json`, filters `visual` stories, and creates one screenshot test per tagged story.

```ts
import { test, expect } from '@playwright/test';

type StorybookIndexEntry = {
  id: string;
  title: string;
  name: string;
  type: string;
  tags?: string[];
};

type StorybookIndex = {
  entries: Record<string, StorybookIndexEntry>;
};

async function getVisualStories(baseURL: string): Promise<StorybookIndexEntry[]> {
  const response = await fetch(`${baseURL}/index.json`);
  if (!response.ok) {
    throw new Error(`Failed to load Storybook index: ${response.status}`);
  }

  const index = (await response.json()) as StorybookIndex;
  return Object.values(index.entries)
    .filter(entry => entry.type === 'story' && entry.tags?.includes('visual'))
    .sort((a, b) => a.id.localeCompare(b.id));
}

test.describe('storybook visual stories', () => {
  let stories: StorybookIndexEntry[] = [];

  test.beforeAll(async () => {
    stories = await getVisualStories('http://127.0.0.1:6006');
    if (stories.length === 0) {
      throw new Error('No visual-tagged stories found');
    }
  });

  test('sanity check: visual-tagged stories exist', async () => {
    expect(stories.length).toBeGreaterThan(0);
  });

  for (const storyId of [
    'personlimitsmodule-boardpage-avatarbadge--active',
    'personlimitsmodule-boardpage-avatarbadge--active-over-limit',
    'personlimitsmodule-boardpage-avatarbadge--at-limit',
    'personlimitsmodule-boardpage-avatarbadge--multiple-avatars',
    'personlimitsmodule-boardpage-avatarbadge--over-limit',
    'personlimitsmodule-boardpage-avatarbadge--under-limit',
  ]) {
    test(`visual snapshot: ${storyId}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
      await page.setViewportSize({ width: 900, height: 500 });

      const root = page.locator('#storybook-root');
      await expect(root).toBeVisible();
      await expect(root).toHaveScreenshot(`${storyId}.png`, {
        animations: 'disabled',
      });
    });
  }
});
```

This keeps the initial implementation deterministic while still depending only on the `visual` tag for the selected story set.

- [ ] **Step 2: Add Playwright config with Storybook web server**

Create `playwright.config.ts`.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:6006',
    headless: true,
  },
  webServer: {
    command: 'python3 -m http.server 6006 -d storybook-static',
    url: 'http://127.0.0.1:6006',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
```

- [ ] **Step 3: Build Storybook and run the full visual suite to generate failing baselines**

Run: `npm run build-storybook && npx playwright test tests/visual/storybook.visual.spec.ts`

Expected: FAIL on first run with snapshot missing errors.

- [ ] **Step 4: Generate the initial baselines**

Run: `npx playwright test tests/visual/storybook.visual.spec.ts --update-snapshots`

Expected: PASS and snapshot files are created for the six tagged stories.

- [ ] **Step 5: Re-run the suite to verify stable pass**

Run: `npx playwright test tests/visual/storybook.visual.spec.ts`

Expected: PASS with all six tagged stories matching baselines.

- [ ] **Step 6: Commit**

```bash
git add playwright.config.ts tests/visual/storybook.visual.spec.ts tests/visual
git commit -m "test: add playwright visual runner for tagged stories"
```

### Task 3: Wire NPM Scripts And Final Verification

**Files:**
- Modify: `package.json`
- Test: `tests/visual/storybook.visual.spec.ts`

- [ ] **Step 1: Add scripts for build, test, and baseline updates**

Modify the scripts section in `package.json`.

```json
{
  "scripts": {
    "visual:build": "storybook build",
    "visual:test": "playwright test tests/visual/storybook.visual.spec.ts",
    "visual:update": "playwright test tests/visual/storybook.visual.spec.ts --update-snapshots"
  }
}
```

Merge these into the existing script object instead of replacing it.

- [ ] **Step 2: Run the scripted workflow end-to-end**

Run: `npm run visual:build && npm run visual:test`

Expected: PASS with only the tagged `AvatarBadge` stories tested.

- [ ] **Step 3: Verify untagged stories are excluded**

Temporarily inspect the test output and confirm there are exactly six screenshot tests plus the sanity check, matching:

```text
personlimitsmodule-boardpage-avatarbadge--active
personlimitsmodule-boardpage-avatarbadge--active-over-limit
personlimitsmodule-boardpage-avatarbadge--at-limit
personlimitsmodule-boardpage-avatarbadge--multiple-avatars
personlimitsmodule-boardpage-avatarbadge--over-limit
personlimitsmodule-boardpage-avatarbadge--under-limit
```

Expected: no other Storybook stories are included in the visual run.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "test: add visual screenshot scripts"
```

## Self-Review

- Spec coverage: covered story tagging, approved `AvatarBadge` visual states, Playwright screenshot flow, deterministic avatar fixture, npm scripts, and tagged-only execution.
- Placeholder scan: no `TODO`/`TBD` placeholders remain.
- Type consistency: `visual` is consistently represented as a story tag, Storybook source is `index.json`, and the selected story ids map to `AvatarBadge.stories.tsx` exports.
