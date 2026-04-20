import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/shared/di/Module';

class BoardPagePageObjectModule extends Module {
  register(container: Container): void {
    const env = container.inject(JiraEnvToken);
    if (env === 'server') {
    }
  }
}

export const personLimitsModule = new BoardPagePageObjectModule();
