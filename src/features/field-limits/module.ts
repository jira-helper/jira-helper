import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';
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
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from 'src/shared/Logger';
import { getBoardIdFromURL } from 'src/routing';
import { getBoardEditData } from 'src/shared/jiraApi';

/**
 * Регистрирует все модели фичи field-limits в DI-контейнере.
 */
export function registerFieldLimitsModule(container: Container = globalContainer): void {
  const boardPropertyService = container.inject(BoardPropertyServiceToken);
  const boardPageObject = container.inject(boardPagePageObjectToken);
  const logger = container.inject(loggerToken);

  const fieldLimitsPageObject = new FieldLimitsBoardPageObject();
  container.register({
    token: fieldLimitsBoardPageObjectToken,
    value: fieldLimitsPageObject,
  });

  const propertyModel = proxy(new PropertyModel(boardPropertyService, logger));
  container.register({
    token: propertyModelToken,
    value: {
      model: propertyModel,
      useModel: () => useSnapshot(propertyModel) as PropertyModel,
    },
  });

  const getBoardData = async () => {
    const boardId = getBoardIdFromURL();
    if (!boardId) throw new Error('No board ID');
    return getBoardEditData(boardId);
  };

  const settingsUIModel = proxy(new SettingsUIModel(propertyModel, getBoardData, logger));
  container.register({
    token: settingsUIModelToken,
    value: {
      model: settingsUIModel,
      useModel: () => useSnapshot(settingsUIModel) as SettingsUIModel,
    },
  });

  const boardRuntimeModel = proxy(new BoardRuntimeModel(propertyModel, fieldLimitsPageObject, boardPageObject, logger));
  container.register({
    token: boardRuntimeModelToken,
    value: {
      model: boardRuntimeModel,
      useModel: () => useSnapshot(boardRuntimeModel) as BoardRuntimeModel,
    },
  });
}
