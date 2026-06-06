import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { JqlParserInfoTooltip } from './JqlParserInfoTooltip';

const meta: Meta<typeof JqlParserInfoTooltip> = {
  title: 'Shared/Jql/JqlParserInfoTooltip',
  component: JqlParserInfoTooltip,
};
export default meta;

type Story = StoryObj<typeof JqlParserInfoTooltip>;

export const Default: Story = {
  render: () => <JqlParserInfoTooltip />,
};
