/**
 * MAIN-world Jira editor bridge for comment-template insertion.
 *
 * Chrome content scripts run in an isolated world: they can see Jira's DOM, but they cannot call page-owned
 * JavaScript objects such as `window.require`, `jira/editor/registry`, `AJS.$`, or the wiki editor instance
 * attached to `textarea#comment`. Jira's rich comment editor needs those page-owned APIs to keep Text and
 * Visual modes in sync, especially when inserting Jira wiki markup (`*bold*`, lists, `{code}`, etc.).
 *
 * The extension injects this file as a web-accessible `<script>` so it executes in Jira's MAIN world. The
 * content script posts raw wiki markup to `window`; this bridge receives the message and then:
 * - Text mode: inserts raw wiki through Jira's `wikiEditor.manipulationEngine.replaceSelectionWith`.
 * - Visual mode: renders wiki through Jira's `/rest/api/1.0/render` endpoint, then inserts the returned HTML
 *   through the registered RTE/TinyMCE selection API.
 *
 * This avoids treating wiki markup as plain HTML and lets Jira's own editor/converter keep the backing
 * textarea and WYSIWYG iframe consistent.
 */
(function jiraHelperCommentWikiInsertBridge() {
  var MARK = 'data-jira-helper-comment-wiki-bridge';
  if (document.documentElement.getAttribute(MARK) === '1') {
    return;
  }
  document.documentElement.setAttribute(MARK, '1');

  function escCss(value) {
    if (typeof CSS !== 'undefined' && CSS.escape) {
      return CSS.escape(value);
    }
    return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  function getRegistry() {
    try {
      return window.require && window.require('jira/editor/registry');
    } catch (e) {
      return null;
    }
  }

  function getJQuery() {
    if (window.AJS && window.AJS.$) {
      return window.AJS.$;
    }
    return window.jQuery || window.$ || null;
  }

  function parseRenderHtml(data) {
    if (data == null) {
      return '';
    }
    if (typeof data === 'string') {
      return data;
    }
    return (
      data.renderedValue ||
      data.renderedWiki ||
      data.html ||
      data.body ||
      (typeof data.render === 'string' ? data.render : '') ||
      ''
    );
  }

  function renderPath() {
    var ctx = typeof window.contextPath === 'string' ? window.contextPath : '';
    return ctx + '/rest/api/1.0/render';
  }

  async function fetchRenderedHtml(wikiText, issueKey) {
    var payload = {
      rendererType: 'atlassian-wiki-renderer',
      unrenderedMarkup: wikiText,
    };
    if (issueKey) {
      payload.issueKey = issueKey;
    }
    var res = await fetch(renderPath(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/html,*/*' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return null;
    }
    var contentType = res.headers && res.headers.get ? res.headers.get('content-type') || '' : '';
    var data = contentType.indexOf('json') === -1 ? await res.text() : await res.json();
    var html = parseRenderHtml(data);
    return html || null;
  }

  function findAddCommentRoot(commentEditorId) {
    return document.querySelector(
      '#addcomment[data-jira-helper-comment-editor-id="' + escCss(commentEditorId) + '"]'
    );
  }

  window.addEventListener('message', function onWikiInsertMessage(event) {
    if (event.source !== window) {
      return;
    }
    var d = event.data;
    if (!d || d.source !== 'jira-helper-comment-insert' || d.action !== 'insertWiki') {
      return;
    }

    (async function handle() {
      var wikiText = d.wikiText;
      var commentEditorId = d.commentEditorId;
      var issueKey = d.issueKey || null;
      try {
        var root = findAddCommentRoot(commentEditorId);
        if (!root) {
          return;
        }
        var textarea = root.querySelector('textarea#comment');
        if (!textarea) {
          return;
        }

        var registry = getRegistry();
        if (!registry) {
          return;
        }

        var entry = null;
        try {
          var taId =
            registry._getTextAreaId && typeof registry._getTextAreaId === 'function'
              ? registry._getTextAreaId(textarea)
              : null;
          entry = taId && registry.getEntry ? registry.getEntry(taId) : null;
        } catch (err) {
          entry = null;
        }

        if (!entry) {
          return;
        }

        if (entry.isTextMode && entry.isTextMode()) {
          var $ = getJQuery();
          if ($) {
            var wikiEditor = $(textarea).data('wikiEditor');
            if (wikiEditor && wikiEditor.manipulationEngine && wikiEditor.manipulationEngine.replaceSelectionWith) {
              wikiEditor.manipulationEngine.replaceSelectionWith(wikiText);
              return;
            }
          }
          if (typeof entry.applyIfTextMode === 'function') {
            entry.applyIfTextMode(function applyText() {
              var jq = getJQuery();
              if (!jq) {
                return;
              }
              var we = jq(textarea).data('wikiEditor');
              if (we && we.manipulationEngine && we.manipulationEngine.replaceSelectionWith) {
                we.manipulationEngine.replaceSelectionWith(wikiText);
              }
            });
          }
          return;
        }

        if (entry.isVisualMode && entry.isVisualMode()) {
          var html = await fetchRenderedHtml(wikiText, issueKey);
          if (!html) {
            return;
          }
          if (entry.rteInstance && typeof entry.rteInstance.then === 'function') {
            entry.rteInstance.then(function (rte) {
              try {
                if (rte && rte.editor && rte.editor.selection && rte.editor.selection.setContent) {
                  rte.editor.selection.setContent(html);
                  if (typeof rte.editor.save === 'function') {
                    rte.editor.save();
                  }
                }
              } catch (e2) {
                /* ignore */
              }
            });
          } else if (typeof entry.applyIfVisualMode === 'function') {
            entry.applyIfVisualMode(function applyVis(rte) {
              try {
                if (rte && rte.editor && rte.editor.selection && rte.editor.selection.setContent) {
                  rte.editor.selection.setContent(html);
                  if (typeof rte.editor.save === 'function') {
                    rte.editor.save();
                  }
                }
              } catch (e3) {
                /* ignore */
              }
            });
          }
        }
      } catch (e) {
        /* swallow — content script already updated textarea */
      }
    })();
  });
})();
