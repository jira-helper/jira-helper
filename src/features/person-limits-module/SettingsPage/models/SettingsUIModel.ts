/**
 * @module SettingsUIModel
 *
 * Модель состояния модалки настроек PersonLimits (Valtio + DI).
 */
import { Ok, Err, type Result } from 'ts-results';
import type { PersonLimit } from '../../property/types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/infrastructure/logging/Logger';
import type { FormData } from '../state/types';

function cloneLimits(limits: PersonLimit[]): PersonLimit[] {
  return JSON.parse(JSON.stringify(limits)) as PersonLimit[];
}

export class SettingsUIModel {
  limits: PersonLimit[] = [];

  editingId: number | null = null;

  formData: FormData | null = null;

  state: 'initial' | 'loaded' = 'initial';

  constructor(
    private propertyModel: PropertyModel,
    private logger: Logger
  ) {}

  initFromProperty(): void {
    this.limits = cloneLimits(this.propertyModel.data.limits);
    this.editingId = null;
    this.formData = null;
    this.state = 'loaded';
  }

  async save(): Promise<Result<void, Error>> {
    const log = this.logger.getPrefixedLog('SettingsUIModel.save');
    this.propertyModel.setLimits(cloneLimits(this.limits));
    const result = await this.propertyModel.persist();

    if (result.err) {
      log(`Failed to persist: ${result.val.message}`, 'error');
      return Err(result.val);
    }

    log('Saved');
    return Ok(undefined);
  }

  addLimit(limit: PersonLimit): void {
    this.limits.push(limit);
    this.formData = null;
  }

  updateLimit(id: number, updatedLimit: PersonLimit): void {
    const index = this.limits.findIndex(l => l.id === id);
    if (index !== -1) {
      this.limits[index] = updatedLimit;
    }
    this.editingId = null;
    this.formData = null;
  }

  deleteLimit(id: number): void {
    this.limits = this.limits.filter(l => l.id !== id);
    if (this.editingId === id) {
      this.editingId = null;
      this.formData = null;
    }
  }

  setEditingId(id: number | null): void {
    this.editingId = id;
    if (id !== null) {
      const limit = this.limits.find(l => l.id === id);
      if (limit) {
        const selectedColumns = limit.columns.length === 0 ? [] : limit.columns.map(c => String(c.id));
        const swimlanes = limit.swimlanes.length === 0 ? [] : limit.swimlanes.map(s => String(s.id ?? s.name));
        this.formData = {
          persons: limit.persons.map(p => ({
            name: p.name,
            displayName: p.displayName || p.name,
            self: p.self,
          })),
          limit: limit.limit,
          selectedColumns,
          swimlanes,
          includedIssueTypes: limit.includedIssueTypes,
          showAllPersonIssues: limit.showAllPersonIssues,
          sharedLimit: limit.sharedLimit ?? false,
        };
      }
    } else {
      this.formData = null;
    }
  }

  setFormData(next: FormData | null): void {
    this.formData = next;
  }

  setLimits(limits: PersonLimit[]): void {
    this.limits = limits;
  }

  isDuplicate(personNames: string[], columns: string[], swimlanes: string[], issueTypes?: string[]): boolean {
    return this.limits.some(l => {
      const nameMatch = l.persons.some(p => personNames.includes(p.name));

      const existingColIds = [...l.columns.map(c => c.id)].sort();
      const newColIds = [...columns].sort();
      const colMatch =
        existingColIds.length === newColIds.length && existingColIds.every((id, i) => id === newColIds[i]);

      const existingSwimIds = [...l.swimlanes.map(s => s.id)].sort();
      const newSwimIds = [...swimlanes].sort();
      const swimMatch =
        existingSwimIds.length === newSwimIds.length && existingSwimIds.every((id, i) => id === newSwimIds[i]);

      const existingTypes = [...(l.includedIssueTypes || [])].sort();
      const newTypes = [...(issueTypes || [])].sort();
      const typeMatch = existingTypes.length === newTypes.length && existingTypes.every((t, i) => t === newTypes[i]);

      return nameMatch && colMatch && swimMatch && typeMatch;
    });
  }

  reset(): void {
    this.limits = [];
    this.editingId = null;
    this.formData = null;
    this.state = 'initial';
  }
}
