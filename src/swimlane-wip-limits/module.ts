import type { Container } from 'dioma';
import { globalContainer } from 'dioma';
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio';
import { propertyModelToken, settingsUIModelToken, boardRuntimeModelToken } from './tokens';
import { PropertyModel } from './property/PropertyModel';
import { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import { BoardPropertyServiceToken } from 'src/shared/boardPropertyService';
import { boardPagePageObjectToken } from 'src/page-objects/BoardPage';
import { loggerToken } from 'src/shared/Logger';
import { getBoardIdFromURL } from 'src/routing';
import { getBoardEditData } from 'src/shared/jiraApi';

const propertyModelCache = new WeakMap<Container, { model: PropertyModel; useModel: () => PropertyModel }>();
const settingsUIModelCache = new WeakMap<Container, { model: SettingsUIModel; useModel: () => SettingsUIModel }>();
const boardRuntimeModelCache = new WeakMap<
  Container,
  { model: BoardRuntimeModel; useModel: () => BoardRuntimeModel }
>();

/**
 * Регистрирует все модели фичи swimlane-wip-limits.
 */
export function registerSwimlaneWipLimitsModule(container: Container = globalContainer): void {
  // PropertyModel (singleton per container)
  container.register({
    token: propertyModelToken,
    factory: c => {
      let cached = propertyModelCache.get(c);
      if (!cached) {
        const boardPropertyService = c.inject(BoardPropertyServiceToken);
        const logger = c.inject(loggerToken);
        const model = proxy(new PropertyModel(boardPropertyService, logger));
        cached = {
          model,
          useModel: () => useSnapshot(model) as PropertyModel,
        };
        propertyModelCache.set(c, cached);
      }
      return cached;
    },
  });

  // SettingsUIModel (singleton per container)
  container.register({
    token: settingsUIModelToken,
    factory: c => {
      let cached = settingsUIModelCache.get(c);
      if (!cached) {
        const { model: propertyModel } = c.inject(propertyModelToken);
        const logger = c.inject(loggerToken);

        const getBoardData = async () => {
          const boardId = getBoardIdFromURL();
          if (!boardId) throw new Error('No board ID');
          return getBoardEditData(boardId);
        };

        const model = proxy(new SettingsUIModel(propertyModel as PropertyModel, getBoardData, logger));
        cached = {
          model,
          useModel: () => useSnapshot(model) as SettingsUIModel,
        };
        settingsUIModelCache.set(c, cached);
      }
      return cached;
    },
  });

  // BoardRuntimeModel (singleton per container)
  container.register({
    token: boardRuntimeModelToken,
    factory: c => {
      let cached = boardRuntimeModelCache.get(c);
      if (!cached) {
        const { model: propertyModel } = c.inject(propertyModelToken);
        const pageObject = c.inject(boardPagePageObjectToken);
        const logger = c.inject(loggerToken);

        const model = proxy(new BoardRuntimeModel(propertyModel as PropertyModel, pageObject, logger));
        cached = {
          model,
          useModel: () => useSnapshot(model) as BoardRuntimeModel,
        };
        boardRuntimeModelCache.set(c, cached);
      }
      return cached;
    },
  });
}
