# Writing and Testing Actions in the Application

Actions are the core building blocks for business and application logic in our system. This documentation covers how to create, use, and test actions effectively.

## What is an Action?

An action is a reusable piece of business logic that can be:
- Called from components
- Called from other actions
- Called from any JavaScript code

Actions provide a consistent way to handle application logic with dependency injection, logging, and testability built-in.

## Creating an Action

Actions are created using the `createAction` function:

```typescript
import { createAction } from 'src/shared/action';
export const myAction = createAction({
	name: 'myAction', // Name for logging and debugging
	async handler(param1: string, param2: number) {
		// Action implementation goes here
		return result;
	},
});
```


## Using Dependency Injection in Actions

The action handler has access to a DI container via `this.di`:

```typescript
const myAction = createAction({
  name: 'myAction', 
  async handler(param: string) {
    // Inject the logger
    const log = this.di.inject(loggerToken).getPrefixedLog(`myAction ${param}`);
    // Inject a service
    const service = this.di.inject(ServiceToken);
    const result = await service.doSomething(param);
    return result;
  },
});
```


## Best Practice: Add Logging to Actions

Always add logging to actions for better debugging and monitoring:

```typescript
const myAction = createAction({
  name: 'myAction',
  async handler(param: string) {
    const logger = this.di.inject(loggerToken);
    const log = logger.getPrefixedLog(`myAction: ${param}`);
    // Log important steps
    log('Starting action execution');
    try {
      const result = await this.di.inject(ServiceToken).doSomething(param);
      log('Action completed successfully');
      return result;
    } catch (error) {
      log(`Action failed: ${error.message}`, 'error');
      throw error;
    }
  },
});
```

## Testing Actions

When testing actions, follow these guidelines:
1. Prepare the DI container and stores
2. Don't mock stores - use the actual store implementations
3. Mock DI dependencies instead
4. Follow the Arrange-Act-Assert pattern

### Example Test Structure


```typescript
describe('myAction', () => {
  // ARRANGE: Mock DI dependencies
  const mockService = {
    doSomething: vi.fn().mockResolvedValue('result'),
  };
  beforeAll(() => {
    // Set up DI container
    globalContainer.reset();
    registerLogger(globalContainer);
    globalContainer.register({ token: ServiceToken, value: mockService });
  });
  beforeEach(() => {
    // Reset mocks and store states before each test
    vi.resetAllMocks();
    useMyStore.setState(useMyStore.getInitialState());
  });
  afterAll(() => {
    globalContainer.reset();
  });

  it('should perform the expected action', async () => {
    // ARRANGE: Set up store state
    useMyStore.setState(state => ({
     ...state,
     data: {
     // Set up initial state
     },
    }));

    // ARRANGE: Set up test data
    const param = 'test-param';
    mockService.doSomething.mockResolvedValue('test-result');

    // ACT: Call the action
    await myAction(param);

    // ASSERT: Verify DI calls
    expect(mockService.doSomething).toHaveBeenCalledWith(param);
    // ASSERT: Verify store state
    expect(useMyStore.getState().data).toEqual({
      // Expected state after action
    });
  });
});
```

## Composing Actions

Actions can call other actions to compose complex behaviors:

```typescript
export const parentAction = createAction({
  name: 'parentAction',
  handler: (param: string, abortSignal: AbortSignal) => {
    const settings = useSettingsStore.getState().settings;
    // Call other actions conditionally
    return Promise.all([
      settings.featureEnabled && childAction1(param, abortSignal),
      settings.otherFeatureEnabled && childAction2(param, abortSignal),
    ].filter(Boolean));
  },
});
```

## AI Prompt for Generating Actions and Tests


Generate an action and its test for the following requirement:

Requirement: [Describe the requirement here]

The action should:
1. Be named [action name]
2. Accept parameters: [list parameters with types]
3. Use the following dependencies: [list dependencies]
4. Interact with these stores: [list stores]
5. Return: [describe return value]

Include proper logging and error handling.

For the test:
1. Mock these dependencies: [list dependencies to mock]
2. Set up these initial store states: [describe initial states]
3. Test these scenarios: [list test scenarios, write in GWT or AAA pattern]

### Example


Generate an action and its test for the following requirement:

Requirement: Create an action that marks all subtasks of an issue as complete.

The action should:
1. Be named markAllSubtasksComplete
2. Accept parameters: issueKey (string), abortSignal (AbortSignal)
3. Use the following dependencies: JiraServiceToken, loggerToken
4. Interact with these stores: useJiraSubtasksStore, useJiraIssuesStore
5. Return: Promise<void>

Include proper logging and error handling.

For the test:
1. Mock these dependencies: JiraServiceToken
2. Set up these initial store states: useJiraSubtasksStore with some subtasks
3. Test these scenarios: 
   - Successfully marking all subtasks as complete
   - Handling errors when updating subtasks fails
   - Skipping if no subtasks exist


