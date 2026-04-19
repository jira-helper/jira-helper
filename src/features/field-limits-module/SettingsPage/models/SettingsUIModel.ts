/**
 * @module SettingsUIModel
 *
 * Модель для состояния модального окна настроек Field WIP Limits.
 *
 * ## Жизненный цикл
 * Создаётся при открытии Settings popup, сбрасывается при закрытии.
 */
import { Result, Ok, Err } from 'ts-results';
import type {
  FieldLimitsSettings,
  CardLayoutField,
  BoardColumn,
  BoardSwimlane,
  LimitFormInput,
  BoardEditData,
} from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/infrastructure/logging/Logger';
import { createLimitKey } from '../../utils/createLimitKey';

export class SettingsUIModel {
  // === State ===

  /** Modal открыт */
  isOpen: boolean = false;

  /** Черновик настроек (редактируемая копия) */
  draft: FieldLimitsSettings = { limits: {} };

  /** Состояние загрузки */
  isLoading: boolean = false;

  /** Состояние сохранения */
  isSaving: boolean = false;

  /** Сообщение об ошибке */
  error: string | null = null;

  /** Поля из card layout для выбора в форме */
  cardLayoutFields: CardLayoutField[] = [];

  /** Колонки доски (без KanPlan) */
  columns: BoardColumn[] = [];

  /** Swimlanes доски */
  swimlanes: BoardSwimlane[] = [];

  /** Ключ лимита в режиме редактирования */
  editingLimitKey: string | null = null;

  constructor(
    private propertyModel: PropertyModel,
    private getBoardEditData: () => Promise<BoardEditData>,
    private logger: Logger
  ) {}

  // === Lifecycle ===

  /**
   * Открыть modal настроек.
   * Загружает текущие настройки и данные доски.
   */
  async open(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('SettingsUIModel.open');
    this.isOpen = true;
    this.isLoading = true;
    this.error = null;

    try {
      const [settingsResult, boardData] = await Promise.all([this.propertyModel.load(), this.getBoardEditData()]);

      if (settingsResult.err) {
        this.error = settingsResult.val.message;
        this.isLoading = false;
        log(`Failed to load settings: ${settingsResult.val.message}`);
        return Err(settingsResult.val);
      }

      this.draft = JSON.parse(JSON.stringify(settingsResult.val));

      this.cardLayoutFields = boardData.cardLayoutConfig?.currentFields ?? [];
      this.columns = (boardData.rapidListConfig?.mappedColumns ?? [])
        .filter(col => !col.isKanPlanColumn)
        .map(({ id, name }) => ({ id: String(id), name }));
      this.swimlanes = (boardData.swimlanesConfig?.swimlanes ?? []).map(({ id, name }) => ({
        id: String(id),
        name,
      }));

      this.editingLimitKey = null;
      this.isLoading = false;

      log('Opened modal');
      return Ok(undefined);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.error = errorMessage;
      this.isLoading = false;
      log(`Failed to load board data: ${errorMessage}`);
      return Err(error instanceof Error ? error : new Error(errorMessage));
    }
  }

  /**
   * Сохранить изменения и закрыть modal.
   */
  async save(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('SettingsUIModel.save');
    this.isSaving = true;
    this.error = null;

    const result = await this.propertyModel.save(this.draft);

    if (result.err) {
      this.error = result.val.message;
      this.isSaving = false;
      log(`Failed to save: ${result.val.message}`);
      return Err(result.val);
    }

    this.close();
    log('Saved and closed');
    return Ok(undefined);
  }

  /**
   * Закрыть modal без сохранения.
   */
  close(): void {
    this.isOpen = false;
    this.draft = { limits: {} };
    this.cardLayoutFields = [];
    this.columns = [];
    this.swimlanes = [];
    this.editingLimitKey = null;
    this.error = null;
    this.isSaving = false;
    this.isLoading = false;
  }

  // === CRUD ===

  addLimit(input: LimitFormInput): void {
    const key = createLimitKey({ fieldValue: input.fieldValue, fieldId: input.fieldId });
    this.draft = {
      ...this.draft,
      limits: {
        ...this.draft.limits,
        [key]: {
          calcType: input.calcType,
          fieldValue: input.fieldValue,
          fieldId: input.fieldId,
          limit: input.limit,
          columns: input.columns,
          swimlanes: input.swimlanes,
          visualValue: input.visualValue,
        },
      },
    };
  }

  updateLimit(limitKey: string, input: LimitFormInput): void {
    if (!this.draft.limits[limitKey]) return;
    this.draft = {
      ...this.draft,
      limits: {
        ...this.draft.limits,
        [limitKey]: {
          ...this.draft.limits[limitKey],
          calcType: input.calcType,
          fieldValue: input.fieldValue,
          fieldId: input.fieldId,
          limit: input.limit,
          columns: input.columns,
          swimlanes: input.swimlanes,
          visualValue: input.visualValue,
        },
      },
    };
  }

  deleteLimit(limitKey: string): void {
    const limits = { ...this.draft.limits };
    delete limits[limitKey];
    this.draft = { ...this.draft, limits };
  }

  setEditingLimitKey(key: string | null): void {
    this.editingLimitKey = key;
  }

  setLimitColor(limitKey: string, color: string): void {
    if (!this.draft.limits[limitKey]) return;
    this.draft = {
      ...this.draft,
      limits: {
        ...this.draft.limits,
        [limitKey]: {
          ...this.draft.limits[limitKey],
          bkgColor: color,
        },
      },
    };
  }

  /**
   * Сбросить в начальное состояние.
   */
  reset(): void {
    this.close();
  }

  // === Queries ===

  /** Проверка: есть ли несохранённые изменения. */
  get hasUnsavedChanges(): boolean {
    return JSON.stringify(this.draft) !== JSON.stringify(this.propertyModel.settings);
  }
}
