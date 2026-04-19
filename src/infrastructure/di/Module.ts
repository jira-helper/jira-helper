import type { Container } from 'dioma';
import { Token, TokenNotRegisteredError } from 'dioma';
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';

export type ModelEntry<T> = {
  model: T;
  useModel: () => Readonly<T>;
};

export function createModelToken<T>(name: string): Token<ModelEntry<T>> {
  return new Token<ModelEntry<T>>(name);
}

export function modelEntry<T extends object>(instance: T): ModelEntry<T> {
  const p = proxy(instance);
  return {
    model: p,
    useModel: () => useSnapshot(p) as Readonly<T>,
  };
}

export abstract class Module {
  private sentinelToken = new Token<true>('__module_sentinel__');

  abstract register(container: Container): void;

  ensure(container: Container): void {
    try {
      container.inject(this.sentinelToken);
      return;
    } catch (e) {
      if (!(e instanceof TokenNotRegisteredError)) throw e;
    }
    container.register({ token: this.sentinelToken, value: true as const });
    this.register(container);
  }

  protected lazy<T>(container: Container, token: Token<T>, factory: (container: Container) => T): void {
    let cached: { v: T } | null = null;
    container.register({
      token,
      factory: (c: Container) => {
        if (!cached) {
          cached = { v: factory(c) };
        }
        return cached.v;
      },
    });
  }
}
