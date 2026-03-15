import { Result, Ok, Err } from 'ts-results';
import type { FieldLimitsSettings, LoadingState } from '../types';
import type { BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import type { Logger } from 'src/shared/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { migrateSettings } from '../utils/migrateSettings';

export class PropertyModel {
  settings: FieldLimitsSettings = { limits: {} };
  state: LoadingState = 'initial';
  error: string | null = null;

  constructor(
    private boardPropertyService: BoardPropertyServiceI,
    private logger: Logger
  ) {}

  async load(): Promise<Result<FieldLimitsSettings, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.load');

    if (this.state === 'loading') {
      log('Already loading, skip');
      return Ok(this.settings);
    }

    this.state = 'loading';

    try {
      const data = await this.boardPropertyService.getBoardProperty<unknown>(BOARD_PROPERTIES.FIELD_LIMITS);

      const settings = migrateSettings(data);
      this.settings = settings;
      this.state = 'loaded';
      this.error = null;
      log('Loaded settings');
      return Ok(settings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state = 'error';
      this.error = errorMessage;
      log(`Failed to load: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  async save(settings: FieldLimitsSettings): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.save');

    try {
      this.boardPropertyService.updateBoardProperty(BOARD_PROPERTIES.FIELD_LIMITS, settings, {});
      this.settings = settings;
      log('Saved settings');
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Failed to save: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  reset(): void {
    this.settings = { limits: {} };
    this.state = 'initial';
    this.error = null;
  }
}
