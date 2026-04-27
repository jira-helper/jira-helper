import type { Container } from 'dioma';
import { Module } from 'src/infrastructure/di/Module';

class BoardPagePageObjectModule extends Module {
  register(container: Container): void {
    void container;
  }
}

export const personLimitsModule = new BoardPagePageObjectModule();
