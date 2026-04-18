import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/shared/di/Module';
import { propertyModelToken, settingsUIModelToken, boardRuntimeModelToken } from './tokens';
import { PropertyModel } from './property/PropertyModel';
import { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from 'src/shared/Logger';
import { routingServiceToken } from 'src/routing';
import { getBoardEditDataToken } from 'src/shared/di/jiraApiTokens';

class SwimlaneWipLimitsModule extends Module {
  register(container: Container): void {
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
        new BoardRuntimeModel(propertyModel, c.inject(boardPagePageObjectToken), c.inject(loggerToken))
      );
    });
  }
}

export const swimlaneWipLimitsModule = new SwimlaneWipLimitsModule();
