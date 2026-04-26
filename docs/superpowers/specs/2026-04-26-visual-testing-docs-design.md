# Visual Testing Docs Design

## Goal

Document the visual testing workflow introduced for Storybook-based screenshot regression so that development and testing docs clearly explain when and how to use it.

## Scope

This change is documentation-only.

It covers:

- a new dedicated visual testing document
- links from existing testing docs to that document
- updates to internal testing/storybook skill references so they point to the visual testing doc

It does not change the visual runner implementation itself.

## Recommended Structure

### 1. New document: `docs/testing-visual.md`

This document becomes the canonical reference for screenshot-based visual regression testing.

It should describe:

- when to use visual tests
- how visual tests differ from plain Storybook stories and Cypress tests
- how `visual` story tags opt a story into screenshot coverage
- the expected test structure: top-level `describe`, nested `describe` per story file, one test per screenshot state
- commands for build, test, and snapshot update
- where baselines live
- where to look for actual/diff artifacts
- stability rules for deterministic screenshots

### 2. Update `docs/TESTING.md`

`docs/TESTING.md` stays the entry point for test strategy.

It should:

- mention visual regression explicitly as part of the testing pyramid/process
- link to `docs/testing-visual.md`
- briefly explain when to choose Storybook-only stories vs screenshot regression

### 3. Update `docs/testing-storybook.md`

This file should remain focused on authoring stories.

It should add a short section clarifying:

- stories are not automatically screenshot-tested
- only stories explicitly tagged with `visual` are part of screenshot regression
- detailed workflow lives in `docs/testing-visual.md`

### 4. Update internal skill references

Update these repo-tracked skill docs:

- `.cursor/skills/testing/SKILL.md`
- `.cursor/skills/storybook/SKILL.md`

They should include `docs/testing-visual.md` in the required reading context.

## Content Principles

- Keep `docs/testing-storybook.md` about story authoring, not full visual-regression process
- Keep `docs/testing-visual.md` focused on screenshot workflow and maintenance
- Avoid duplicating the full same instructions across all docs; use links where possible
- Document current repo conventions rather than abstract generic Storybook advice

## Key Workflow To Document

The documented visual workflow should be:

1. Create or update a Storybook story for a meaningful visual state
2. Add `visual` tag only to stories that should be screenshot-regressed
3. Run:
   - `npm run visual:build`
   - `npm run visual:test`
4. If intended UI changes occur, update baselines with:
   - `npm run visual:update`
5. Review snapshot files and any diff artifacts before accepting the change

## Expected Outcomes

After this doc update:

- developers can discover the visual testing workflow from `docs/TESTING.md`
- story authors know how to opt stories into screenshot regression
- internal testing/storybook skills reference the correct visual testing doc
- the visual testing process is documented separately from general Storybook authoring
