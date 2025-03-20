import React from 'react';
import type { Preview } from '@storybook/react';
import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from '../src/shared/boardPropertyService';
import { registerLogger } from '../src/shared/Logger';
import { WithDi } from '../src/shared/diContext';
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
  decorators: (Story) => {
    // const childContainer = globalContainer.childContainer();
    return <WithDi container={globalContainer}>
      <Story />
    </WithDi>
  }
};

globalContainer.register({
  token: BoardPropertyServiceToken,
  value: {
    getBoardProperty: () => Promise.resolve({ kek: true } as any),
    updateBoardProperty: () => {},
    deleteBoardProperty: () => {},
  },
});
registerLogger(globalContainer)

export default preview;
