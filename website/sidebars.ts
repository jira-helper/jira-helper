import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'doc',
      id: 'intro',
      label: 'Features Overview',
    },
    {
      type: 'category',
      label: 'WIP Limits',
      items: [
        'features/wip-limits/column-limits',
        'features/wip-limits/swimlane-limits',
        'features/wip-limits/personal-limits',
        'features/wip-limits/field-limits',
        'features/wip-limits/cell-limits',
      ],
    },
    {
      type: 'category',
      label: 'Board Visualization',
      items: [
        'features/board-visualization/card-colors',
        'features/board-visualization/swimlane-histogram',
      ],
    },
    {
      type: 'category',
      label: 'Card Information',
      items: [
        'features/card-information/days-in-column',
        'features/card-information/days-to-deadline',
        'features/card-information/issue-links-display',
        'features/card-information/issue-condition-checks',
      ],
    },
    'features/sub-tasks-progress/index',
    'features/gantt-chart/index',
    {
      type: 'category',
      label: 'Control Chart',
      items: [
        'features/control-chart/sla-line',
        'features/control-chart/scale-ruler',
      ],
    },
    'features/flag-issue/index',
    'features/issue-templates/comment-templates',
    'features/data-blurring/index',
    'features/local-settings/index',
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/jql-reference',
        'advanced/faq',
      ],
    },
  ],
};

export default sidebars;
