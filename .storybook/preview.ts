import type { Preview } from '@storybook/react';
 import '../src/shared/components/styles.css'
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    actions: { argTypesRegex: '^on.*' },
  },
};

export default preview;
