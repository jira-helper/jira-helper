import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

type ContentScript = {
  matches?: string[];
  js?: string[];
  run_at?: string;
};

describe('content script manifest', () => {
  it('uses one early runtime loader for Jira Server and Jira Cloud', () => {
    const manifest = JSON.parse(readFileSync(resolve(__dirname, '../../manifest.json'), 'utf8')) as {
      content_scripts: ContentScript[];
    };

    expect(manifest.content_scripts).toHaveLength(1);

    const [loaderContentScript] = manifest.content_scripts;

    expect(loaderContentScript.matches).toEqual(['*://*/*']);
    expect(loaderContentScript.js).toEqual(['src/content-loader.ts']);
    expect(loaderContentScript.run_at).toBe('document_start');
  });

  it('allows dynamically imported chunks to preload built CSS assets', () => {
    const manifest = JSON.parse(readFileSync(resolve(__dirname, '../../manifest.json'), 'utf8')) as {
      web_accessible_resources: Array<{ resources?: string[]; matches?: string[] }>;
    };

    expect(manifest.web_accessible_resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          matches: expect.arrayContaining(['*://*/*']),
          resources: expect.arrayContaining(['assets/*.css']),
        }),
      ])
    );
  });
});
