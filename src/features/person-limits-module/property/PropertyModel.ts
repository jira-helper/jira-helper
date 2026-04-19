import { Result, Ok, Err } from 'ts-results';
import type { PersonLimit, PersonWipLimitsProperty, PersonWipLimitsProperty_2_29 } from './types';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import type { Logger } from 'src/infrastructure/logging/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { migrateProperty } from './migrateProperty';

/**
 * Loads and persists `PersonWipLimitsProperty` to Jira Board Property `PERSON_LIMITS`.
 * Wrap with `proxy()` from valtio when registering in DI for reactive subscriptions.
 */
export class PropertyModel {
  data: PersonWipLimitsProperty = { limits: [] };

  state: 'initial' | 'loading' | 'loaded' = 'initial';

  error: string | null = null;

  constructor(
    private boardPropertyService: BoardPropertyServiceI,
    private logger: Logger
  ) {}

  async load(): Promise<Result<PersonWipLimitsProperty, Error>> {
    const log = this.logger.getPrefixedLog('PropertyModel.load');

    if (this.state !== 'initial') {
      log('Skip load — state is not initial');
      return Ok(this.data);
    }

    this.state = 'loading';

    try {
      const raw = await this.boardPropertyService.getBoardProperty<
        PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty
      >(BOARD_PROPERTIES.PERSON_LIMITS);
      const next = migrateProperty(raw ?? { limits: [] });
      this.data = next;
      this.state = 'loaded';
      this.error = null;
      log('Loaded property');
      return Ok(next);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage === 'no board id') {
        this.data = migrateProperty({ limits: [] });
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
      this.boardPropertyService.updateBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS, this.data, {});
      log('Persisted property');
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      log(`Failed to persist: ${errorMessage}`, 'error');
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  setData(data: PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty): void {
    this.data = migrateProperty(data);
    this.state = 'loaded';
  }

  setLimits(limits: PersonLimit[]): void {
    this.data.limits = limits;
  }

  reset(): void {
    this.data = { limits: [] };
    this.state = 'initial';
    this.error = null;
  }
}
