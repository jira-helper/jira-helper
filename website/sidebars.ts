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
      label: 'Board Page',
      items: [
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
            'features/sub-tasks-progress/index',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Issue View',
      items: [
        'features/gantt-chart/index',
        'features/issue-templates/comment-templates',
      ],
    },
    {
      type: 'category',
      label: 'Reports',
      items: [
        'features/control-chart/sla-line',
        'features/control-chart/scale-ruler',
      ],
    },
    {
      type: 'category',
      label: 'Other tools',
      items: [
        'features/flag-issue/index',
        'features/data-blurring/index',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'features/local-settings/index',
        'advanced/jql-reference',
        'advanced/faq',
      ],
    },
  ],
};

export default sidebars;
