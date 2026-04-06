import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container, Token } from 'dioma';
import { Module, modelEntry, createModelToken } from './Module';

class TestModel {
  constructor(public readonly value: string) {}
}

const testToken = new Token<string>('test');

class CountingModule extends Module {
  registerCallCount = 0;

  register(container: Container): void {
    this.registerCallCount++;
    this.lazy(container, testToken, () => 'hello');
  }
}

describe('Module', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  describe('ensure()', () => {
    it('should call register() on first ensure', () => {
      // Arrange
      const mod = new CountingModule();

      // Act
      mod.ensure(container);

      // Assert
      expect(mod.registerCallCount).toBe(1);
    });

    it('should not call register() twice for the same container', () => {
      // Arrange
      const mod = new CountingModule();

      // Act
      mod.ensure(container);
      mod.ensure(container);

      // Assert
      expect(mod.registerCallCount).toBe(1);
    });

    it('should call register() for different containers', () => {
      // Arrange
      const mod = new CountingModule();
      const container2 = new Container();

      // Act
      mod.ensure(container);
      mod.ensure(container2);

      // Assert
      expect(mod.registerCallCount).toBe(2);
    });

    it('should re-register after container.reset()', () => {
      // Arrange
      const mod = new CountingModule();

      // Act
      mod.ensure(container);
      container.reset();
      mod.ensure(container);

      // Assert
      expect(mod.registerCallCount).toBe(2);
    });
  });

  describe('lazy()', () => {
    it('should register a token resolvable via inject', () => {
      // Arrange
      const token = new Token<string>('lazy-test');

      class LazyModule extends Module {
        register(c: Container): void {
          this.lazy(c, token, () => 'lazy-value');
        }
      }

      const mod = new LazyModule();

      // Act
      mod.ensure(container);
      const result = container.inject(token);

      // Assert
      expect(result).toBe('lazy-value');
    });

    it('should call factory only once (singleton)', () => {
      // Arrange
      const token = new Token<{ id: number }>('singleton-test');
      const factory = vi.fn(() => ({ id: 42 }));

      class SingletonModule extends Module {
        register(c: Container): void {
          this.lazy(c, token, factory);
        }
      }

      const mod = new SingletonModule();
      mod.ensure(container);

      // Act
      const first = container.inject(token);
      const second = container.inject(token);

      // Assert
      expect(first).toBe(second);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should not call factory until first inject (lazy)', () => {
      // Arrange
      const token = new Token<string>('lazy-call-test');
      const factory = vi.fn(() => 'created');

      class LazyCallModule extends Module {
        register(c: Container): void {
          this.lazy(c, token, factory);
        }
      }

      const mod = new LazyCallModule();

      // Act
      mod.ensure(container);

      // Assert
      expect(factory).not.toHaveBeenCalled();
    });

    it('should pass container to factory for dependency resolution', () => {
      // Arrange
      const depToken = new Token<string>('dep');
      const resultToken = new Token<string>('result');

      container.register({ token: depToken, value: 'dependency' });

      class DepModule extends Module {
        register(c: Container): void {
          this.lazy(c, resultToken, cont => `got: ${cont.inject(depToken)}`);
        }
      }

      const mod = new DepModule();
      mod.ensure(container);

      // Act
      const result = container.inject(resultToken);

      // Assert
      expect(result).toBe('got: dependency');
    });

    it('should create separate instances for separate containers', () => {
      // Arrange
      const token = new Token<{ id: number }>('separate-test');
      let counter = 0;

      class SeparateModule extends Module {
        register(c: Container): void {
          this.lazy(c, token, () => ({ id: ++counter }));
        }
      }

      const mod = new SeparateModule();
      const container2 = new Container();

      // Act
      mod.ensure(container);
      mod.ensure(container2);
      const first = container.inject(token);
      const second = container2.inject(token);

      // Assert
      expect(first.id).not.toBe(second.id);
    });
  });
});

describe('modelEntry()', () => {
  it('should wrap instance in proxy with model and useModel', () => {
    // Arrange
    const instance = new TestModel('test');

    // Act
    const entry = modelEntry(instance);

    // Assert
    expect(entry.model).toBeDefined();
    expect(entry.model.value).toBe('test');
    expect(typeof entry.useModel).toBe('function');
  });

  it('should return same model reference on multiple accesses', () => {
    // Arrange
    const instance = new TestModel('test');

    // Act
    const entry = modelEntry(instance);

    // Assert
    expect(entry.model).toBe(entry.model);
  });
});

describe('createModelToken()', () => {
  it('should create a Token with correct name', () => {
    // Act
    const token = createModelToken<TestModel>('my-feature/myModel');

    // Assert
    expect(token).toBeInstanceOf(Token);
    expect(token.name).toBe('my-feature/myModel');
  });
});

describe('Module + modelEntry integration', () => {
  it('should register valtio model via lazy + modelEntry', () => {
    // Arrange
    const token = createModelToken<TestModel>('integration/testModel');
    const container = new Container();

    class IntegrationModule extends Module {
      register(c: Container): void {
        this.lazy(c, token, () => modelEntry(new TestModel('integrated')));
      }
    }

    const mod = new IntegrationModule();
    mod.ensure(container);

    // Act
    const { model, useModel } = container.inject(token);

    // Assert
    expect(model.value).toBe('integrated');
    expect(typeof useModel).toBe('function');
  });

  it('should return same model instance on multiple injects', () => {
    // Arrange
    const token = createModelToken<TestModel>('integration/singleton');
    const container = new Container();

    class IntegrationModule extends Module {
      register(c: Container): void {
        this.lazy(c, token, () => modelEntry(new TestModel('singleton')));
      }
    }

    const mod = new IntegrationModule();
    mod.ensure(container);

    // Act
    const first = container.inject(token);
    const second = container.inject(token);

    // Assert
    expect(first.model).toBe(second.model);
  });
});
