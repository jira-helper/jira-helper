import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useRef } from 'react';
import { IssueCard } from 'src/shared/jira/card';
import { processCard } from './processCard';

const ProcessCardDemo = ({ grabberColor }: { grabberColor?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      processCard({
        card: cardRef.current,
        processedAttribute: 'jh-card-colors-processed',
      });
    }
  }, [cardRef.current]);

  return <IssueCard ref={cardRef} issueKey="TEST-123" summary="Test Card" grabberColor={grabberColor} />;
};

const meta = {
  title: 'Features/Card Colors/Process Card',
  component: ProcessCardDemo,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ProcessCardDemo>;

export default meta;
type Story = StoryObj<typeof ProcessCardDemo>;

export const WithoutGrabberColor: Story = {
  args: {
    grabberColor: undefined,
  },
};

export const WithGrabberColor: Story = {
  args: {
    grabberColor: 'rgb(77, 184, 86)',
  },
};
