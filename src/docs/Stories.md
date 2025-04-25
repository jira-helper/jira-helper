# Writing Storybook Stories

This guide explains how to write effective Storybook stories for components. 

## Basic Structure

Stories file is located within the component folder.
For example, if component is `src/feature/component.tsx`, then stories file is `src/feature/component.stories.tsx`.

A typical story file follows this structure:

```typescript
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ComponentName } from './ComponentName';
// Import other dependencies as needed

const meta: Meta<typeof ComponentName> = {
  title: 'Path/To/Component',
  component: ComponentName,
  parameters: {
    // Optional parameters
    layout: 'centered',
  },
  decorators: [
    // Optional global decorators
    Story => (
      <div style={{ width: '800px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type StoryType = StoryObj<typeof ComponentName>;

// Define individual stories
export const Default: StoryType = {
  args: {
    // Component props
  },
  decorators: [
    // Story-specific decorators
  ],
};
```

## Using Decorators

Decorators are powerful for setting up the component's context:

### Dependency Injection

Use `withDi` to register dependencies:

```typescript
import { withDi } from 'src/shared/testTools/storyWithDi';

export const Default: StoryType = {
  args: {
    // Component props
  },
  decorators: [
    withDi(container => {
      container.register({
        token: someToken,
        value: mockValue,
      });
    }),
  ],
};

```

### Store Mocking

Use `withStore` to provide store data:

```typescript
import { withStore } from 'src/shared/testTools/storyWithStore';

export const Default: StoryType = {
  args: {
    // Component props
  },
  decorators: [
    withStore(useYourStore, {
      data: {
        // Mock store data
      },
      state: 'loaded', // or other states like 'loading', 'error'
    }),
  ],
};
```

## Best Practices

1. **Provide meaningful props**: Use realistic props that demonstrate component functionality
2. **Mock dependencies**: Use decorators to mock dependencies and isolate the component
3. **Show variations**: Create multiple stories to show different states and configurations
4. **Use descriptive names**: Name stories to clearly indicate what they demonstrate
5. **Keep stories focused**: Each story should demonstrate a specific aspect or state

