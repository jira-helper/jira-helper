#!/usr/bin/env bash
# Берёт скриншоты всех GanttSettingsModal stories через playwright-cli.
# Для stories с draft — снимаем все три таба (Bars / Issues / Filters).
# Для NoDraft — один снимок (табов нет, только Empty state).
set -euo pipefail

ROUND="${1:-round-1}"
OUT_DIR=".agents/tasks/gantt-chart/ux-review/${ROUND}"
mkdir -p "$OUT_DIR"

# Stories с draft — снимаем все 3 таба:
declare -a STORIES=(
  "default:01-default"
  "with-link-types:03-with-link-types"
  "with-jql-validation-error:04-with-jql-validation-error"
)

CLEANUP_JS=$(cat <<'JS'
() => {
  const overlays = document.querySelectorAll('vite-error-overlay, .vite-error-overlay');
  overlays.forEach(e => e.remove());
  const targets = document.querySelectorAll('.ant-modal-body, .ant-modal-content, .ant-modal-wrap, .ant-modal');
  targets.forEach(el => { el.style.maxHeight = 'none'; el.style.overflow = 'visible'; el.style.height = 'auto'; });
  document.body.style.overflow = 'auto';
  document.documentElement.style.overflow = 'auto';
  const wrap = document.querySelector('.ant-modal-wrap');
  if (wrap) wrap.style.position = 'static';
  const root = document.querySelector('.ant-modal-root');
  if (root) root.style.position = 'static';
  return 'ok';
}
JS
)

clickTab() {
  local TAB_KEY="$1"
  playwright-cli -s=jh eval "() => { const t = document.querySelector('.ant-tabs-tab[data-node-key=\"${TAB_KEY}\"]'); if (t) t.click(); return t ? 'clicked' : 'missing'; }" >/dev/null 2>&1 || true
}

for entry in "${STORIES[@]}"; do
  STORY_ID="${entry%%:*}"
  FILE_BASE="${entry#*:}"
  URL="http://localhost:6006/iframe.html?id=ganttchart-issuepage-ganttsettingsmodal--${STORY_ID}&viewMode=story&globals=viewport:reset"
  echo "» $STORY_ID"
  playwright-cli -s=jh goto "$URL" >/dev/null 2>&1
  sleep 2
  playwright-cli -s=jh eval "$CLEANUP_JS" >/dev/null 2>&1 || true

  for TAB_KEY in bars issues filters; do
    clickTab "$TAB_KEY"
    sleep 1
    # При смене таба может появиться скролл; повторим cleanup
    playwright-cli -s=jh eval "$CLEANUP_JS" >/dev/null 2>&1 || true
    sleep 1
    OUT="${OUT_DIR}/${FILE_BASE}-${TAB_KEY}.png"
    playwright-cli -s=jh screenshot --full-page --filename="$OUT" >/dev/null 2>&1
    file "$OUT"
  done
done

# NoDraft — один снимок
echo "» no-draft"
URL="http://localhost:6006/iframe.html?id=ganttchart-issuepage-ganttsettingsmodal--no-draft&viewMode=story&globals=viewport:reset"
playwright-cli -s=jh goto "$URL" >/dev/null 2>&1
sleep 2
playwright-cli -s=jh eval "$CLEANUP_JS" >/dev/null 2>&1 || true
sleep 1
OUT="${OUT_DIR}/02-no-draft.png"
playwright-cli -s=jh screenshot --full-page --filename="$OUT" >/dev/null 2>&1
file "$OUT"

# Footer-only verifications: snap modals WITHOUT the CLEANUP_JS hack so the modal stays at its
# natural height with sticky footer + scrolling body. This is the real UX, not a stitched preview.
# We additionally enlarge viewport so the whole modal (including footer) fits a single screenshot.
RESIZE_JS='() => { window.resizeTo(1280, 1100); return "ok"; }'

snapNatural() {
  local STORY_ID="$1"
  local FILE_NAME="$2"
  local TAB_KEY="${3:-bars}"
  local URL="http://localhost:6006/iframe.html?id=ganttchart-issuepage-ganttsettingsmodal--${STORY_ID}&viewMode=story&globals=viewport:reset"
  playwright-cli -s=jh goto "$URL" >/dev/null 2>&1
  sleep 2
  playwright-cli -s=jh eval "$RESIZE_JS" >/dev/null 2>&1 || true
  # Remove only the Vite error overlay; do NOT touch modal CSS.
  playwright-cli -s=jh eval '() => { document.querySelectorAll("vite-error-overlay,.vite-error-overlay").forEach(e=>e.remove()); return "ok"; }' >/dev/null 2>&1 || true
  if [ -n "$TAB_KEY" ]; then
    clickTab "$TAB_KEY"
    sleep 1
  fi
  local OUT="${OUT_DIR}/${FILE_NAME}.png"
  playwright-cli -s=jh screenshot --filename="$OUT" >/dev/null 2>&1
  file "$OUT"
}

echo "» natural-viewport snapshots (with sticky footer)"
snapNatural "default" "10-natural-default-bars" "bars"
snapNatural "with-jql-validation-error" "11-natural-jql-error-filters" "filters"
snapNatural "no-draft" "12-natural-no-draft" ""

echo "Готово: $(ls "$OUT_DIR" | wc -l | tr -d ' ') файлов в $OUT_DIR"
