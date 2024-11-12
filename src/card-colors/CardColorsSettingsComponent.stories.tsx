
import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { ColorCardSettingsComponent } from './CardColorsSettingsComponent';

export default {
  title: 'Components/ColorCardFeature',
  component: ColorCardSettingsComponent,
} as Meta;

const Template: StoryFn = (args) => <ColorCardSettingsComponent {...args} />;

export const Default = Template.bind({});
Default.args = {};

// Story to show the component with the tooltip open
export const TooltipVisible = Template.bind({});

TooltipVisible.parameters = {
  docs: {
    description: {
      story: 'ColorCardFeature component with tooltip example. Hover over the "Hover for details" text to see the tooltip content.',
    },
  },
};
TooltipVisible.args = {
  forceTooltipOpen: true
}
