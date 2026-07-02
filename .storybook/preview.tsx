import React from 'react';
import type { Preview } from '@storybook/react-vite';
import { globalContainer } from 'dioma';
import { BoardPropertyServiceToken } from '../src/infrastructure/jira/boardPropertyService';
import { registerExtensionApiServiceInDI } from '../src/infrastructure/extension-api/ExtensionApiService';
import { registerRoutingServiceInDI } from '../src/infrastructure/routing';
import { registerJiraApiInDI } from '../src/infrastructure/di/jiraApiTokens';
import { registerIssueTypeServiceInDI } from '../src/shared/issueType';
import { registerLogger } from '../src/infrastructure/logging/Logger';
import { WithDi } from '../src/infrastructure/di/diContext';
import { localeProviderToken, MockLocaleProvider } from '../src/shared/locale';
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
  decorators: Story => {
    return (
      <WithDi container={globalContainer}>
        <Story />
      </WithDi>
    );
  },
};

registerExtensionApiServiceInDI(globalContainer);
registerRoutingServiceInDI(globalContainer);
registerJiraApiInDI(globalContainer);
registerIssueTypeServiceInDI(globalContainer);

globalContainer.register({
  token: BoardPropertyServiceToken,
  value: {
    getBoardProperty: () => Promise.resolve({ property: 'value' } as any),
    updateBoardProperty: () => {},
    deleteBoardProperty: () => {},
  },
});
globalContainer.register({
  token: localeProviderToken,
  value: new MockLocaleProvider('en'),
});
registerLogger(globalContainer);

export default preview;
