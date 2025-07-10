import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { JqlParserInfoTooltip } from './JqlParserInfoTooltip';

const meta: Meta<typeof JqlParserInfoTooltip> = {
  title: 'JQL/JqlParserInfoTooltip',
  component: JqlParserInfoTooltip,
};
export default meta;

type Story = StoryObj<typeof JqlParserInfoTooltip>;

export const Default: Story = {
  render: () => <JqlParserInfoTooltip />,
};
