import React, { useRef } from 'react';
import { Container } from 'dioma';
import { StoryFn } from '@storybook/react';
import { useDi } from '../diContext';

export function withDi(cb: (container: Container) => void) {
  return (Story: StoryFn) => {
    const container = useDi();
    const registered = useRef(false);
    if (!registered.current) {
      cb(container);
      registered.current = true;
    }
    return <Story />;
  };
}
