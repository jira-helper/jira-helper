# WIP limits by field values

Turn a field shown on your board cards into a capacity-style limit: count or sum how issues contribute by field value (or by whether the field is present), scoped to columns and swimlanes, with badges beside the board and a tint on cards that tip the limit over.

## What it does

- Each rule picks a **field** from your board’s **card layout** (only fields that actually appear on cards can be used).
- You choose how issues contribute: for example **only if the field is filled**, **exactly one value**, **any of several values**, or **sum of numbers** on matching cards—the dialog explains the meaning of each mode when you configure it.
- You give the rule a **short label** for the badge, set the numeric **limit**, and optionally a **badge color**, plus optional **column** and **swimlane** filters so the rule only applies where you need it.
- The badge shows **current vs limit** with colors for under, at, and over capacity.

## How to set up

1. Open **Board settings**.
2. Open the **Card layout** tab (so the fields you want are on the card).
3. Click **Edit WIP limits by field**.
4. Add, edit, or delete limits: select the field, calculation mode, values (if required), display name, limit, and optional column/swimlane scope and badge color.
5. Save from the modal so the configuration is stored on the board for everyone using the extension.

Only people who can edit the board configuration can save.

## Behavior on the board

- A row of **badges** appears in the toolbar area above the columns—one per configured limit—with the label and colors you chose.
- When a limit is **exceeded**, cards that **count toward** that limit get a shared **red tint** so overloaded buckets stand out.
- Counts update as cards move, using the board’s issue statistics settings (such as excluding sub-tasks when your board is set up that way).
