import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import { loggerToken } from 'src/infrastructure/logging/Logger';
import { DiagnosticModel } from './models/DiagnosticModel';
import { diagnosticModelToken } from './tokens';

class DiagnosticModule extends Module {
  register(container: Container): void {
    this.lazy(container, diagnosticModelToken, c => modelEntry(new DiagnosticModel(c.inject(loggerToken))));
  }
}

export const diagnosticModule = new DiagnosticModule();
