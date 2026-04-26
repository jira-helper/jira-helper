import { test, expect } from '@playwright/test';
import type { APIRequestContext, Page } from '@playwright/test';

type StorybookEntry = {
  id?: string;
  type?: string;
  title?: string;
  name?: string;
  tags?: string[];
};

type StorybookIndex = {
  entries?: Record<string, StorybookEntry>;
};

async function getVisualStories(request: APIRequestContext): Promise<StorybookEntry[]> {
  const response = await request.get('/index.json');
  expect(response.ok()).toBe(true);

  const index = (await response.json()) as StorybookIndex;
  return Object.entries(index.entries ?? {})
    .map(([id, entry]) => ({ ...entry, id }))
    .filter(entry => entry.type === 'story' && entry.tags?.includes('visual'))
    .sort((left, right) => (left.id ?? '').localeCompare(right.id ?? ''));
}

async function mockStorybookBrowserApis(page: Page) {
  await page.addInitScript(() => {
    const listener = { addListener: () => {} };

    class MemoryCache {
      constructor() {
        this.store = new Map();
      }

      has(key) {
        return this.store.has(key);
      }

      peek(key) {
        return this.store.get(key);
      }

      get(key) {
        return this.store.get(key);
      }

      set(key, value) {
        this.store.set(key, value);
      }
    }

    globalThis.require = id => {
      if (id === '@tinkoff/lru-cache-nano') {
        return MemoryCache;
      }

      throw new Error(`Unsupported require: ${id}`);
    };

    globalThis.chrome = {
      runtime: {
        getURL: resource => resource,
        onMessage: listener,
        sendMessage: async () => undefined,
      },
      tabs: {
        onUpdated: listener,
        onActivated: listener,
        get: async () => ({
          url: 'https://example.atlassian.net/jira/software/c/projects/MP/boards/138',
        }),
        sendMessage: async () => undefined,
      },
      contextMenus: {
        removeAll: () => {},
        onClicked: listener,
        create: () => {},
      },
    };
  });
}

test('renders tagged visual stories consistently', async ({ page, request }) => {
  const visualStories = await getVisualStories(request);

  expect(visualStories).toHaveLength(6);
  expect(new Set(visualStories.map(story => story.title))).toEqual(
    new Set(['PersonLimitsModule/BoardPage/AvatarBadge'])
  );

  for (const story of visualStories) {
    await mockStorybookBrowserApis(page);
    await test.step(`render ${story.name ?? story.id}`, async () => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => {
        const storyRoot = document.querySelector('#storybook-root');
        return Boolean(document.body.classList.contains('sb-show-main') && storyRoot && storyRoot.children.length > 0);
      });

      const storyRoot = page.locator('#storybook-root');
      await expect(storyRoot).toHaveScreenshot(`${story.id}.png`, {
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
});
