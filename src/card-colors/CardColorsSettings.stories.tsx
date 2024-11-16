
import React from 'react';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { CardColorsSettingsContainer } from './CardColorsSettingsContainer';
import { action } from '@storybook/addon-actions';
type Args = React.ComponentProps<typeof CardColorsSettingsContainer>;

export default {
  title: 'Components/ColorCardFeature/Settings',
  component: CardColorsSettingsContainer,
  args: {
    getBoardProperty: () => Promise.resolve({ value: true }),
    updateBoardProperty: action('updateBoardProperty')
  } as Args,

} as Meta<Args>;
type Story = StoryObj<typeof CardColorsSettingsContainer>;
const Template: StoryFn<Args> = (args) => <CardColorsSettingsContainer {...args} />;

export const Default: Story = {
  args: {
    getBoardProperty: () => Promise.resolve({ value: true })
  }
}

// Story to show the component with the tooltip open
export const TooltipVisible: Story = {
  args: {
    getBoardProperty: () => Promise.resolve({ value: true }),
    forceTooltipOpen: true
  }
}


