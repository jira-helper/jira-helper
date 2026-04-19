import { Result, Ok, Err } from 'ts-results';
import type { SwimlaneSettings, LoadingState, SwimlaneSetting } from '../types';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import type { Logger } from 'src/infrastructure/logging/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { mergeSwimlaneSettings } from '../utils/mergeSwimlaneSettings';

export class PropertyModel {
  settings: SwimlaneSettings = {};

  state: LoadingState = 'initial';

  error: string | null = null;

  constructor(
    private boardPropertyService: BoardPropertyServiceI,
    private logger: Logger
  ) {}

  async load(): Promise<Result<SwimlaneSettings, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.load');

    if (this.state === 'loading') {
      log('Already loading, skip');
      return Ok(this.settings);
    }

    this.state = 'loading';

    try {
      const [newSettings, oldSettings] = await Promise.all([
        this.boardPropertyService.getBoardProperty<SwimlaneSettings>(BOARD_PROPERTIES.SWIMLANE_SETTINGS),
        this.boardPropertyService.getBoardProperty<SwimlaneSettings>(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS),
      ]);

      const merged = mergeSwimlaneSettings(newSettings, oldSettings);

      this.settings = merged;
      this.state = 'loaded';
      this.error = null;

      log('Loaded settings');
      return Ok(merged);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state = 'error';
      this.error = errorMessage;
      log(`Failed to load: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  async save(settings: SwimlaneSettings): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.save');

    try {
      this.boardPropertyService.updateBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS, settings, {});

      this.settings = settings;

      log('Saved settings');
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Failed to save: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  updateSwimlane(id: string, setting: Partial<SwimlaneSetting>): void {
    const existing = this.settings[id] || { columns: [] };
    this.settings = {
      ...this.settings,
      [id]: { ...existing, ...setting },
    };
  }

  reset(): void {
    this.settings = {};
    this.state = 'initial';
    this.error = null;
  }
}
