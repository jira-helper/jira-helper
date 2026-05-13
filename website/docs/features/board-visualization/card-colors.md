---
---

import {CardColorsMockup} from '@site/src/components/CardColorsMockup';

# Card Colors

| | |
|---|---|
| Where configured | «Board Settings» → «Card Colors» |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Make Jira's built-in **«Card Colors»** rules easier to see by applying a soft background tint across the whole card instead of only the thin strip on the left.

<CardColorsMockup />

Click the **«Fill whole card»** toggle above the board to see the difference: a thin colour strip on the left vs. a soft full-card background tint.

## How to configure

### Where to find settings

1. Open your board and go to **«Board settings»** (gear icon).
2. Open the **«Card Colors»** tab — Jira's standard screen for JQL-based colour rules.

### How to configure

- **«Fill whole card»**: turn on to fill cards with colour across the whole card; turn off to keep only the left strip (standard Jira behaviour).

Your choice is saved as a board property together with the rest of the board configuration.

## How to use

- When enabled, each card gets a light background tint in the colour from its Card Colors rule. Jira's left colour strip remains.
- **Flagged** cards and cards that already have special highlighting (for example WIP-limit warnings) are left unchanged so urgent signals stay visible.
- The setting applies to the entire board.

## Usage scenarios

1. **Readability:** Full-card fill makes colour coding easier to see, especially on large boards.
2. **Works with WIP limits:** Cards with WIP-limit warning highlighting are not recoloured, so important signals keep priority.
3. **Quick rollback:** If the fill is distracting, a board admin turns it off in one click and returns to the strip-only look.

## Troubleshooting

- **Fill not applied:** Ensure Card Colors JQL rules exist on the **«Card Colors»** tab and **«Fill whole card»** is enabled.
- **Flagged cards unchanged:** Expected — flagged and specially highlighted cards are skipped.
- **Toggle not visible:** Check permissions — only board administrators can see and change Card Colors settings.
