import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { Module, modelEntry } from 'src/infrastructure/di/Module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';
import {
  propertyModelToken,
  settingsUIModelToken,
  boardRuntimeModelToken,
  fieldLimitsBoardPageObjectToken,
} from './tokens';
import { PropertyModel } from './property/PropertyModel';
import { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import { FieldLimitsBoardPageObject } from './BoardPage/page-objects/FieldLimitsBoardPageObject';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { loggerToken } from 'src/infrastructure/logging/Logger';
import { routingServiceToken } from 'src/infrastructure/routing';
import { getBoardEditDataToken } from 'src/infrastructure/di/jiraApiTokens';

class FieldLimitsModule extends Module {
  register(container: Container): void {
    this.lazy(container, fieldLimitsBoardPageObjectToken, () => new FieldLimitsBoardPageObject());

    this.lazy(container, propertyModelToken, c =>
      modelEntry(new PropertyModel(c.inject(BoardPropertyServiceToken), c.inject(loggerToken)))
    );

    this.lazy(container, settingsUIModelToken, c => {
      const { model: propertyModel } = c.inject(propertyModelToken);
      const getBoardData = async () => {
        const boardId = c.inject(routingServiceToken).getBoardIdFromURL();
        if (!boardId) throw new Error('No board ID');
        return c.inject(getBoardEditDataToken)(boardId);
      };
      return modelEntry(new SettingsUIModel(propertyModel, getBoardData, c.inject(loggerToken)));
    });

    this.lazy(container, boardRuntimeModelToken, c => {
      const { model: propertyModel } = c.inject(propertyModelToken);
      return modelEntry(
        new BoardRuntimeModel(
          propertyModel,
          c.inject(fieldLimitsBoardPageObjectToken),
          c.inject(boardPagePageObjectToken),
          c.inject(loggerToken)
        )
      );
    });

    const { model: diagnosticModel } = container.inject(diagnosticModelToken);
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);

    diagnosticModel.registerDiagnosticData(
      'field-limits-module',
      (): Result<FeatureDiagnosticData, Error> =>
        Ok({
          settings: {
            boardProperty: {
              state: propertyModel.state,
              error: propertyModel.error,
              settings: propertyModel.settings,
            },
            localStorage: null,
          },
          runtime: {
            stats: boardRuntimeModel.stats,
          },
        } as unknown as FeatureDiagnosticData)
    );
  }
}

export const fieldLimitsModule = new FieldLimitsModule();
