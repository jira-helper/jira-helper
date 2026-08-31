#!/usr/bin/env node
/**
 * Seed ~N personal WIP limits via combinatorial column×swimlane filters.
 *
 * Usage (from repo, with jh-chrome-runner already on the board):
 *   node tools/seed-person-wip-combos.mjs
 *   node tools/seed-person-wip-combos.mjs --count=14 --restore
 *
 * Talks to /tmp/jh-cmd.json like other jh helpers.
 */
import fs from 'node:fs';
import path from 'node:path';

const CMD = '/tmp/jh-cmd.json';
const RESULT = '/tmp/jh-result.json';
const BACKUP = path.resolve('.playwright/personLimitsSettings.backup.json');

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);
const COUNT = Number(args.count ?? 14);
const RESTORE = args.restore === 'true';

async function rpc(cmd, timeoutMs = 60000) {
  if (fs.existsSync(RESULT)) fs.unlinkSync(RESULT);
  fs.writeFileSync(CMD, JSON.stringify(cmd));
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (fs.existsSync(RESULT)) {
      return JSON.parse(fs.readFileSync(RESULT, 'utf8'));
    }
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error(`timeout waiting for ${cmd.op}`);
}

const expr = RESTORE
  ? `async () => {
      const backup = ${JSON.stringify(fs.existsSync(BACKUP) ? JSON.parse(fs.readFileSync(BACKUP, 'utf8')) : null)};
      if (!backup) return { ok: false, error: 'no backup at ${BACKUP}' };
      const put = await fetch('/rest/agile/1.0/board/35/properties/personLimitsSettings', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: backup }),
      });
      return { ok: put.ok, status: put.status, restoredLimits: (backup.limits||[]).length };
    }`
  : `async () => {
      const [propR, editR, allR] = await Promise.all([
        fetch('/rest/agile/1.0/board/35/properties/personLimitsSettings', { credentials: 'same-origin' }),
        fetch('/rest/greenhopper/1.0/rapidviewconfig/editmodel.json?rapidViewId=35', { credentials: 'same-origin' }),
        fetch('/rest/greenhopper/1.0/xboard/work/allData.json?rapidViewId=35', { credentials: 'same-origin' }),
      ]);
      const prop = await propR.json();
      let current = prop.value;
      if (current && typeof current === 'object' && 'value' in current) current = current.value;
      if (!current || typeof current !== 'object') current = { limits: [] };

      const edit = await editR.json();
      const all = await allR.json();
      const columns = (edit.rapidListConfig?.mappedColumns || [])
        .filter(c => !c.isKanPlanColumn && (c.mappedStatuses || []).length)
        .map(c => ({ id: String(c.id), name: c.name }));
      const swimlanes = (edit.swimlanesConfig?.swimlanes || []).map(s => ({
        id: String(s.id),
        name: s.name,
      }));
      const types = [...new Set((all.issuesData?.issues || []).map(i => i.typeName).filter(Boolean))];
      const assignees = [...new Map(
        (all.issuesData?.issues || [])
          .filter(i => i.assigneeAccountId)
          .map(i => [i.assigneeAccountId, i.assigneeName])
      ).entries()].map(([name, displayName]) => ({ name, displayName }));

      const person = assignees[0];
      if (!person) return { ok: false, error: 'no assignees on board' };

      // Build combos in-page so we can also return the backup payload.
      const colOpts = [[], ...columns.map(c => [c])];
      const swOpts = [[], ...swimlanes.map(s => [s])];
      const typeOpts = types.length ? [[], ...types.map(t => [t])] : [[]];
      const combos = [];
      for (const cols of colOpts) {
        for (const sw of swOpts) {
          for (const includedIssueTypes of typeOpts) {
            if (cols.length === 0 && sw.length === 0 && includedIssueTypes.length === 0 && combos.length > 0) continue;
            combos.push({ columns: cols, swimlanes: sw, includedIssueTypes });
          }
        }
      }
      const count = ${COUNT};
      const picked = combos.slice(0, count);
      const now = Date.now();
      const limits = picked.map((combo, i) => {
        const limit = {
          id: now + i,
          persons: [{ name: person.name, displayName: person.displayName, self: '' }],
          limit: 1 + (i % 5),
          columns: combo.columns,
          swimlanes: combo.swimlanes,
          showAllPersonIssues: true,
          sharedLimit: false,
        };
        if (combo.includedIssueTypes.length) limit.includedIssueTypes = combo.includedIssueTypes;
        return limit;
      });

      const payload = { limits };
      const editCanEdit = edit.canEdit === true;
      if (!editCanEdit) {
        return {
          ok: false,
          error: 'Board is not editable for this user (canEdit=false). Use Storybook FourteenComboAvatars, or log in as a board admin.',
          backup: current,
          seeded: limits.length,
          comboCapacity: combos.length,
          person,
          sample: limits.slice(0, 3).map(l => ({
            limit: l.limit,
            columns: l.columns.map(c => c.name),
            swimlanes: l.swimlanes.map(s => s.name),
            types: l.includedIssueTypes || [],
          })),
        };
      }

      const put = await fetch('/rest/agile/1.0/board/35/properties/personLimitsSettings', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Atlassian-Token': 'no-check' },
        body: JSON.stringify(payload),
      });
      const putText = await put.text();
      return {
        ok: put.ok,
        status: put.status,
        putText: putText.slice(0, 300),
        backup: current,
        seeded: limits.length,
        comboCapacity: combos.length,
        person,
        sample: limits.slice(0, 3).map(l => ({
          limit: l.limit,
          columns: l.columns.map(c => c.name),
          swimlanes: l.swimlanes.map(s => s.name),
          types: l.includedIssueTypes || [],
        })),
      };
    }`;

const res = await rpc({ op: 'evaluate', expr: expr });
if (!res.ok) {
  console.error(res);
  process.exit(1);
}
const value = res.result?.value ?? res.result;
if (!RESTORE && value?.backup) {
  fs.mkdirSync(path.dirname(BACKUP), { recursive: true });
  fs.writeFileSync(BACKUP, JSON.stringify(value.backup, null, 2) + '\n');
  console.log('backup saved →', BACKUP);
}
console.log(JSON.stringify(value, null, 2));

if (!RESTORE && value?.ok) {
  await rpc({
    op: 'goto',
    url: 'https://crazymax101.atlassian.net/jira/software/c/projects/TRB3/boards/35',
    waitUntil: 'domcontentloaded',
  });
  await new Promise(r => setTimeout(r, 6000));
  const check = await rpc({
    op: 'evaluate',
    expr: `() => ({
      avatars: document.querySelectorAll('#avatars-limits [data-person-name]').length,
      texts: [...document.querySelectorAll('#avatars-limits [data-person-name]')].map(el =>
        (el.textContent || '').replace(/\\s+/g, ' ').trim()
      ),
    })`,
  });
  console.log('render check:', JSON.stringify(check.result?.value ?? check.result, null, 2));
}
