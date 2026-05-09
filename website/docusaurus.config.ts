import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'jira-helper',
  tagline: 'Turn Jira into a real Kanban system',
  favicon: 'img/favicon.ico',

  url: 'https://jira-helper.github.io',
  baseUrl: '/',

  organizationName: 'jira-helper',
  projectName: 'jira-helper',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en' },
      ru: { label: 'Русский', htmlLang: 'ru' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/jira-helper/jira-helper/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'jira-helper',
      logo: {
        alt: 'jira-helper',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/jira-helper/jira-helper',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Getting Started', to: '/docs/getting-started/installation' },
            { label: 'Features', to: '/docs/intro' },
            { label: 'FAQ', to: '/docs/advanced/faq' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub Issues', href: 'https://github.com/jira-helper/jira-helper/issues' },
            { label: 'GitHub Discussions', href: 'https://github.com/jira-helper/jira-helper/discussions' },
          ],
        },
        {
          title: 'Install',
          items: [
            { label: 'Chrome Web Store', href: 'https://chrome.google.com/webstore/detail/jira-helper/egmbomekcmpieccamghfgjgnlllgbgdl' },
            { label: 'Firefox Add-ons', href: 'https://addons.mozilla.org/firefox/addon/jira-helper/' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} jira-helper. Open source (ISC).`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
