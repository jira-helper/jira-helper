import type { Container } from 'dioma';
import { Module, modelEntry } from 'src/shared/di/Module';
import { boardRuntimeModelToken, propertyModelToken, settingsUIModelToken } from './tokens';
import { PropertyModel } from './property/PropertyModel';
import { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { loggerToken } from 'src/shared/Logger';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';

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
  }
}

export const personLimitsModule = new PersonLimitsModule();
