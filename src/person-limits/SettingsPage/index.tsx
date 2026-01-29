import React from 'react';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { getUser } from '../../shared/jiraApi';
import { btnGroupIdForColumnsSettingsPage } from '../../shared/constants';
import { groupSettingsBtnTemplate } from './htmlTemplates';
import { Popup } from '../../shared/getPopup';
import { PersonalWipLimitContainer } from './components/PersonalWipLimitContainer';
import { createPersonLimit, updatePersonLimit, initFromProperty, saveToProperty } from './actions';
import { loadPersonWipLimitsProperty } from '../property';
import { usePersonWipLimitsPropertyStore } from '../property/store';
import { useSettingsUIStore } from './stores/settingsUIStore';
import type { PersonLimit, FormData, Swimlane } from './state/types';

type MappedColumn = {
  id: string;
  isKanPlanColumn: boolean;
  max?: number;
  name: string;
};
type BoardSwimlane = {
  name: string;
};
type BoardData = {
  rapidListConfig: {
    mappedColumns: MappedColumn[];
  };
  swimlanesConfig: {
    swimlanes: BoardSwimlane[];
  };
  canEdit: boolean;
};

type PersonLimits = {
  limits: PersonLimit[];
};
export default class PersonalWIPLimit extends PageModification<[BoardData], Element> {
  static jiraSelectors = {
    panelConfig: `#${btnGroupIdForColumnsSettingsPage}`,
  };

  private boardData: BoardData | null = null;

  private boardDataColumns: MappedColumn[] | null = null;

  private boardDataSwimlanes: Swimlane[] | null = null;

  private DOMeditBtn: Element | null = null;

  private popup: Popup | null = null;

  private personLimitsRecovery: PersonLimits = { limits: [] };

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-person-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    // after button column button
    return this.waitForElement(PersonalWIPLimit.jiraSelectors.panelConfig);
  }

  async loadData(): Promise<[BoardData]> {
    await loadPersonWipLimitsProperty();
    const boardData = await this.getBoardEditData();
    return [boardData];
  }

  apply(data: [BoardData]): void {
    if (!data) return;
    const [boardData] = data;
    if (!boardData.canEdit) return;

    this.boardData = boardData;
    this.boardDataColumns = this.boardData.rapidListConfig.mappedColumns.filter((i: any) => !i.isKanPlanColumn);
    this.boardDataSwimlanes = this.boardData.swimlanesConfig.swimlanes;
    this.personLimitsRecovery = window.structuredClone(
      usePersonWipLimitsPropertyStore.getState().data
    );

    this.renderEditButton();
  }

  renderEditButton(): void {
    this.DOMeditBtn = this.insertHTML(
      document.getElementById(btnGroupIdForColumnsSettingsPage)!,
      'beforeend',
      groupSettingsBtnTemplate()
    );

    this.popup = new Popup({
      title: 'Personal WIP Limit',
      okButtonText: 'Save',
      size: 'large',
      onConfirm: this.handleSubmit,
      onCancel: this.handleClose,
    });

    this.addEventListener(this.DOMeditBtn!, 'click', this.openPersonalSettingsPopup);
  }

  openPersonalSettingsPopup = async (): Promise<void> => {
    await this.popup!.render();

    initFromProperty();

    this.popup!.appendReactComponentToContent(
      <PersonalWipLimitContainer
        columns={this.boardDataColumns || []}
        swimlanes={this.boardDataSwimlanes || []}
        onAddLimit={async (formData: FormData) => {
          await this.onAddLimit(formData);
        }}
      />
    );
  };

  addOptionsToSelect = (DOMSelect: HTMLSelectElement, items: any[]): void => {
    items.forEach(({ id, name, isKanPlanColumn }) => {
      if (isKanPlanColumn) {
        // for backlog kanban board
        return;
      }
      const option = document.createElement('option');
      option.text = name;
      option.value = id;
      option.selected = true;
      DOMSelect.appendChild(option);
    });
  };

  handleSubmit = async (unmountPopup: Function): Promise<void> => {
    await saveToProperty();
    this.personLimitsRecovery = window.structuredClone(
      usePersonWipLimitsPropertyStore.getState().data
    );
    unmountPopup();
  };

  handleClose = async (unmountPopup: Function): Promise<void> => {
    initFromProperty();
    unmountPopup();
  };

  onApplyColumnForAllUser = async (formData: FormData): Promise<void> => {
    const columns: Array<{ id: string; name: string }> = formData.selectedColumns
      .map(id => {
        const col = this.boardDataColumns!.find(c => c.id === id);
        if (!col) return null;
        return { id: col.id, name: col.name };
      })
      .filter((col): col is { id: string; name: string } => col !== null);

    useSettingsUIStore.getState().actions.applyColumnsToSelected(columns);
    // React component will automatically re-render via zustand
  };

  onApplySwimlaneForAllUser = async (formData: FormData): Promise<void> => {
    const swimlanes: Array<{ id: string; name: string }> = formData.swimlanes
      .map(id => {
        const swim = this.boardDataSwimlanes!.find(s => (s as any).id === id || s.name === id);
        if (!swim) return null;
        return { id: (swim as any).id || swim.name, name: swim.name };
      })
      .filter((swim): swim is { id: string; name: string } => swim !== null);

    useSettingsUIStore.getState().actions.applySwimlanesToSelected(swimlanes);
    // React component will automatically re-render via zustand
  };

  onAddLimit = async (formData: FormData): Promise<void> => {
    const store = useSettingsUIStore.getState();

    if (store.data.editingId !== null) {
      await this.onEditLimit(formData);
      return;
    }

    const fullPerson = await getUser(formData.personName);

    const personLimit = createPersonLimit({
      formData,
      person: {
        name: fullPerson.name ?? fullPerson.displayName,
        displayName: fullPerson.displayName,
        self: fullPerson.self,
        avatar: fullPerson.avatarUrls['32x32'],
      },
      columns: this.boardDataColumns || [],
      swimlanes: this.boardDataSwimlanes || [],
      id: Date.now(),
    });

    store.actions.addLimit(personLimit);
  };

  onEditLimit = async (formData: FormData): Promise<void> => {
    const store = useSettingsUIStore.getState();
    const editingId = store.data.editingId;
    
    if (!editingId) return;

    const existingLimit = store.data.limits.find(limit => limit.id === editingId);
    if (!existingLimit) return;

    const updatedLimit = updatePersonLimit({
      existingLimit,
      formData,
      columns: this.boardDataColumns || [],
      swimlanes: this.boardDataSwimlanes || [],
    });

    store.actions.updateLimit(editingId, updatedLimit);
  };

  onDeleteLimit = async (id: number): Promise<void> => {
    useSettingsUIStore.getState().actions.deleteLimit(id);
  };

  onEdit = async (id: number): Promise<void> => {
    useSettingsUIStore.getState().actions.setEditingId(id);
  };

}
