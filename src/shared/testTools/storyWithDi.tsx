import React, { useEffect, useState } from 'react';
import { Container } from 'dioma';
import { StoryFn } from '@storybook/react';
import { useDi } from '../diContext';

export function withDi(cb: (container: Container) => void) {
  return (Story: StoryFn) => {
    const container = useDi();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      cb(container);
      setIsMounted(true);
    }, [cb, container]);

    if (!isMounted) {
      return <div />;
    }

    return <Story />;
  };
}
