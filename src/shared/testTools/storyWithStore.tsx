import React, { useEffect } from 'react';
import { StoryFn } from '@storybook/react';
import { StoreApi, UseBoundStore } from 'zustand';

export function withStore<S>(store: UseBoundStore<StoreApi<S>>, state: S) {
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
