# AvatarBadge Visual Screenshot Tests Design

## Goal

Add free visual regression tests for selected Storybook stories without using Chromatic.

Initial scope covers `AvatarBadge` stories in `person-limits-module` and uses an opt-in `visual` tag on individual stories.

## Approved Approach

Use:

- Storybook stories as the source of visual states
- Playwright for screenshot comparison against baselines stored in git
- Story-level `tags: ['visual']` to opt specific stories into screenshot testing

Do not run screenshots for all stories.

## Visual States In Scope

For `src/features/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx`, the initial screenshot baseline includes:

- `UnderLimit`
- `AtLimit`
- `OverLimit`
- `Active`
- `ActiveOverLimit`
- `MultipleAvatars`

These states cover:

- under / at / over limit color states
- active selection styling
- combined active + over-limit styling
- composition of multiple badges in a row

Out of scope for the first iteration:

- hover state
- keyboard focus state
- long names
- missing avatar fallback

## Story Tagging

Tag only selected stories, not the whole meta export.

Example shape:

```ts
export const OverLimit: Story = {
  tags: ['visual'],
  args: {
    // ...
  },
};
```

Rationale:

- explicit opt-in per state
- avoids screenshotting playground or incidental stories
- scales naturally to other components

## Test Discovery

The Playwright test reads `storybook-static/index.json` after Storybook build and selects only entries whose story metadata contains the `visual` tag.

For each matching story:

1. open `iframe.html?id=<story-id>&viewMode=story`
2. set a fixed viewport
3. wait for stable render
4. capture a screenshot of `#storybook-root`
5. compare against the checked-in baseline

## Stability Requirements

To keep baselines stable:

- disable animations during screenshot assertions
- use fixed viewport size
- capture the story root instead of the entire page
- avoid external image dependencies in stories

`AvatarBadge.stories.tsx` should stop using a remote avatar URL and instead use a deterministic local asset representation, preferably a small inline data URI.

## Files To Add Or Change

- update `src/features/person-limits-module/BoardPage/components/AvatarBadge.stories.tsx`
- add `playwright.config.ts`
- add a visual test file that filters stories by `visual` tag
- add npm scripts for building Storybook and running/updating visual baselines

## Scripts

Expected scripts:

- `visual:build` -> build Storybook
- `visual:test` -> run Playwright visual tests
- `visual:update` -> update Playwright snapshots

Exact naming may be adapted to project conventions, but the workflow remains:

1. build Storybook
2. serve built assets in Playwright config via `webServer`
3. run screenshot comparisons only for tagged stories

## Verification

Implementation is complete when:

- tagged `AvatarBadge` stories are discovered automatically
- only tagged stories are screenshot-tested
- baselines can be generated and re-run locally
- tests run without Chromatic or external paid services
