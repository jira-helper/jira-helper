import React, { useEffect } from 'react';
import { StoryFn } from '@storybook/react';

export function withStore<S>(store: any, state: S) {
  return (Story: StoryFn) => {
    useEffect(() => {
      store.setState(state);
      return () => {
        store.setState(store.getInitialState());
      };
    }, [state]);
    return <Story />;
  };
}
