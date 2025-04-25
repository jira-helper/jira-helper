# Feature Development Guide

This guide explains how to develop new features for the Jira Helper application, focusing on proper structure and implementation patterns.

## Feature Structure

### Basic Feature Structure

Every feature should follow this structure:

```
src/features/YourFeature/
├── actions/             // Feature-specific actions
│   ├── yourAction.ts
│   └── yourAction.test.ts
├── components/         // Feature-specific components
│   ├── YourComponent.tsx
│   └── YourComponent.stories.tsx
├── stores/            // Feature-specific stores
│   ├── yourStore.ts
│   └── yourStore.test.ts
├── types/             // Feature-specific types
│   └── yourTypes.ts
├── BoardPage.ts       // Board page modification (if needed)
├── BoardPage.test.ts  // Board page tests (if needed)
├── BoardSettingsTab.tsx // Settings tab (if needed)
├── BoardSettingsTab.test.tsx // Settings tab tests (if needed)
└── index.ts           // Feature entry point
```

### Decomposed Feature Structure

For larger features, you can decompose them into sub-features:

```
src/features/YourFeature/
├── SubFeature1/
│   ├── actions/
│   │   ├── yourAction.ts
│   │   └── yourAction.test.ts
│   ├── components/
│   │   ├── YourComponent.tsx
│   │   └── YourComponent.stories.tsx
│   ├── stores/
│   │   ├── yourStore.ts
│   │   └── yourStore.test.ts
│   └── types/
│       └── yourTypes.ts
├── SubFeature2/
│   ├── actions/
│   │   ├── yourAction.ts
│   │   └── yourAction.test.ts
│   ├── components/
│   │   ├── YourComponent.tsx
│   │   └── YourComponent.stories.tsx
│   ├── stores/
│   │   ├── yourStore.ts
│   │   └── yourStore.test.ts
│   └── types/
│       └── yourTypes.ts
├── BoardPage.ts
├── BoardPage.test.ts
├── BoardSettingsTab.tsx
├── BoardSettingsTab.test.tsx
└── index.ts
```

## BoardPage Implementation

### BoardPage Class

Every feature that needs to modify the board view should have a `BoardPage.ts` file that extends `PageModification`. The BoardPage class should focus on:
- Attaching React components to the board using PageObject
- Using PageObject for DOM manipulation
- Coordinating actions for business logic

```typescript
// src/features/YourFeature/BoardPage.ts
import { BoardPagePageObject } from 'src/page-objects/BoardPage';
import { PageModification } from 'src/shared/pageModification';
import { YourFeatureComponent } from './components/YourFeatureComponent';
import { loadFeatureData } from './actions/loadFeatureData';
import { registerSettings } from 'src/board-settings/actions/registerSettings';
import { BoardSettingsTabContent } from './BoardSettingsTab';

export class YourFeatureBoardPage extends PageModification<void, Element> {
  getModificationId(): string {
    return `your-feature-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(BoardPagePageObject.selectors.pool);
  }

  loadData() {
    return loadFeatureData();
  }

  async apply(): Promise<void> {
    // Attach React components using PageObject
    const unlisten = BoardPagePageObject.listenElements(elements => {
      elements.forEach(element => element.attach(YourFeatureComponent, 'your-feature'));
    });
    this.sideEffects.push(unlisten);

    // Register settings tab
    registerSettings({
      title: 'Your Feature',
      component: BoardSettingsTabContent,
    });
  }
}
```

### Key Aspects of BoardPage Implementation

1. **React Component Attachment**
   - Use PageObject to attach React components to DOM elements
   - Components should be self-contained and receive data through props
   - Use unique identifiers for component placement
   - Handle component lifecycle through PageObject listeners

2. **PageObject Usage**
   - Use `BoardPagePageObject` for DOM queries and manipulation
   - Leverage appropriate PageObject methods for element selection
   - Use selectors from PageObject for consistent element targeting
   - Handle dynamic updates through PageObject listeners

3. **Action Coordination**
   - Move business logic to actions
   - Use actions for data loading and synchronization
   - Handle side effects through action results

4. **Settings Integration**
   - Register settings through the `registerSettings` action
   - Keep settings UI in a separate component
   - Use board properties for persistent settings

### Registering BoardPage

To register your feature, add it to the modifications map in `content.ts`:

```typescript
// src/content.ts
import { Routes } from './routing';
import { YourFeatureBoardPage } from './features/your-feature/BoardPage';

const modificationsMap = {
  [Routes.BOARD]: [
    // ... other board modifications
    YourFeatureBoardPage,
  ],
  // ... other routes
};

// @ts-expect-error
runModifications(modificationsMap);
```

The feature will be automatically initialized when the board page is loaded. Make sure your feature's BoardPage class:
1. Extends `PageModification`
2. Implements required methods (`getModificationId`, `waitForLoading`, `loadData`, `apply`)
3. Uses PageObject for DOM manipulation and React component attachment

## Settings Integration

### BoardSettingsTab Component

If your feature needs settings, create a `BoardSettingsTab.tsx` file:

```typescript
// src/features/YourFeature/BoardSettingsTab.tsx
import React from 'react';
import { BoardSettingsTab } from 'src/shared/components/BoardSettingsTab';
import { useYourFeatureStore } from './stores';

export const YourFeatureSettings: React.FC = () => {
  const { settings, updateSettings } = useYourFeatureStore();

  return (
    <BoardSettingsTab title="Your Feature Settings">
      <div className="your-feature-settings">
        {/* Your settings UI components */}
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.someSetting}
              onChange={(e) => updateSettings({ someSetting: e.target.checked })}
            />
            Enable Some Setting
          </label>
        </div>
      </div>
    </BoardSettingsTab>
  );
};
```

### Registering Settings Tab

Register your settings tab in the feature's initialization:

```typescript
// src/features/YourFeature/index.ts
import { registerBoardSettingsTab } from 'src/shared/boardSettings';
import { YourFeatureSettings } from './BoardSettingsTab';

export const init = () => {
  registerBoardSettingsTab({
    id: 'your-feature-settings',
    title: 'Your Feature',
    component: YourFeatureSettings,
  });
};
```

## Best Practices

1. **BoardPage Implementation**
   - Cache DOM elements in the `elements` property
   - Clean up all event listeners and DOM modifications in `cleanup`
   - Handle errors appropriately
   - Use stores for global state

2. **Settings Implementation**
   - Keep settings simple and focused
   - Use the store to manage settings state
   - Provide clear labels and descriptions
   - Group related settings together
   - Validate settings values

3. **File Organization**
   - Keep related files close together
   - Use index files for clean exports
   - Follow the established structure
   - Decompose large features into sub-features

## Example Feature Implementation

For a complete example, see the `sub-tasks-progress` feature implementation in the codebase. It demonstrates:
- Feature organization
- BoardPage implementation
- Settings integration
- Store management
- Component structure 