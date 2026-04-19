import { Result, Ok, Err } from 'ts-results';
import type { WipLimitsProperty } from '../types';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import type { Logger } from 'src/infrastructure/logging/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';

/**
 * Loads and persists `WipLimitsProperty` to Jira Board Property `WIP_LIMITS_SETTINGS`.
 * Wrap with `proxy()` from valtio when registering in DI for reactive subscriptions.
 */
export class PropertyModel {
  data: WipLimitsProperty = {};

  state: 'initial' | 'loading' | 'loaded' = 'initial';

  error: string | null = null;

  constructor(
    private boardPropertyService: BoardPropertyServiceI,
    private logger: Logger
  ) {}

  async load(): Promise<Result<WipLimitsProperty, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.load');

    if (this.state === 'loading') {
      log('Already loading, skip');
      return Ok(this.data);
    }

    this.state = 'loading';

    try {
      const raw = await this.boardPropertyService.getBoardProperty<WipLimitsProperty>(
        BOARD_PROPERTIES.WIP_LIMITS_SETTINGS
      );
      const next = raw ?? {};
      this.data = next;
      this.state = 'loaded';
      this.error = null;
      log('Loaded property');
      return Ok(next);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'no board id') {
        this.data = {};
        this.state = 'loaded';
        this.error = null;
        log('No board id — using empty property');
        return Ok(this.data);
      }

      this.state = 'initial';
      this.error = errorMessage;
      log(`Failed to load: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  async persist(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.persist');

    try {
      this.boardPropertyService.updateBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, this.data, {});
      log('Persisted property');
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Failed to persist: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  setData(data: WipLimitsProperty): void {
    this.data = data;
    this.state = 'loaded';
  }

  reset(): void {
    this.data = {};
    this.state = 'initial';
    this.error = null;
  }
}
