import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import { boardRuntimeModelToken, propertyModelToken, settingsUIModelToken } from './tokens';
import { PropertyModel } from './property/PropertyModel';
import { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken } from 'src/infrastructure/logging/Logger';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';

class PersonLimitsModule extends Module {
  register(container: Container): void {
    this.lazy(container, propertyModelToken, c =>
      modelEntry(new PropertyModel(c.inject(BoardPropertyServiceToken), c.inject(loggerToken)))
    );

    this.lazy(container, boardRuntimeModelToken, c => {
      const { model: propertyModel } = c.inject(propertyModelToken);
      return modelEntry(
        new BoardRuntimeModel(propertyModel, c.inject(boardPagePageObjectToken), c.inject(loggerToken))
      );
    });

    this.lazy(container, settingsUIModelToken, c => {
      const { model: propertyModel } = c.inject(propertyModelToken);
      return modelEntry(new SettingsUIModel(propertyModel, c.inject(loggerToken)));
    });

    const { model: diagnosticModel } = container.inject(diagnosticModelToken);
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);

    diagnosticModel.registerDiagnosticData(
      'person-limits-module',
      (): Result<FeatureDiagnosticData, Error> =>
        Ok({
          settings: {
            boardProperty: {
              state: propertyModel.state,
              error: propertyModel.error,
              data: propertyModel.data,
            },
            localStorage: null,
          },
          runtime: boardRuntimeModel.getDiagnosticSnapshot(),
        })
    );
  }
}

export const personLimitsModule = new PersonLimitsModule();
