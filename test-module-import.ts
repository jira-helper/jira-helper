import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import { boardRuntimeModelToken, propertyModelToken, settingsUIModelToken } from 'test-tokens';

// Test 1: Trying to import from another feature directly
import { SomeModel } from 'src/features/column-limits-module/BoardPage/models/SomeModel';

// Test 2: Import token from another feature (should be allowed)
import { someToken } from 'src/features/column-limits-module/tokens';

// Test 3: Type import from another feature (should be allowed)
import type { SomeType } from 'src/features/column-limits-module/types';

// Test 4: Import from same feature (should be allowed)
import { LocalModel } from './LocalModel';

class TestModule extends Module {
  register(container: Container): void {
    // implementation
  }
}

export const testModule = new TestModule();