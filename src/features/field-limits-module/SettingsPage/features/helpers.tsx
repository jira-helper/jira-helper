/// <reference types="cypress" />
import React from 'react';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { registerLogger, loggerToken } from 'src/infrastructure/logging/Logger';
import { localeProviderToken, MockLocaleProvider } from 'src/shared/locale';
import { proxy } from 'valtio';
import { useSnapshot } from 'valtio'; // eslint-disable-line local/no-direct-valtio-snapshot -- test DI setup mirrors module.ts
import { PropertyModel } from '../../property/PropertyModel';
import { SettingsUIModel } from '../models/SettingsUIModel';
import { propertyModelToken, settingsUIModelToken } from '../../tokens';
import { SettingsButton } from '../components/SettingsButton';
import { SettingsModal } from '../components/SettingsModal';
import { FIELD_LIMITS_TEXTS } from '../../texts';
import type {
  FieldLimit,
  FieldLimitsSettings,
  BoardEditData,
  CardLayoutField,
  BoardColumn,
  BoardSwimlane,
} from '../../types';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { createLimitKey } from '../../utils/createLimitKey';

// --- Mutable board state configured by Given steps ---

let currentFields: CardLayoutField[] = [];
let currentColumns: BoardColumn[] = [];
let currentSwimlanes: BoardSwimlane[] = [];
let storedSettings: FieldLimitsSettings = { limits: {} };

export const getColumns = () => currentColumns;
export const getSwimlanes = () => currentSwimlanes;

export const setFields = (fields: CardLayoutField[]) => {
  currentFields = fields;
};

export const setColumns = (columns: BoardColumn[]) => {
  currentColumns = columns;
};

export const setSwimlanes = (swimlanes: BoardSwimlane[]) => {
  currentSwimlanes = swimlanes;
};

// --- In-memory board property store ---

const mockBoardPropertyService: BoardPropertyServiceI = {
  async getBoardProperty<T>(property: string): Promise<T | undefined> {
    if (property === BOARD_PROPERTIES.FIELD_LIMITS) {
      return JSON.parse(JSON.stringify(storedSettings)) as T;
    }
    return undefined;
  },
  updateBoardProperty<T>(property: string, value: T, params: Record<string, unknown> = {}): void {
    if (property === BOARD_PROPERTIES.FIELD_LIMITS) {
      storedSettings = JSON.parse(JSON.stringify(value)) as FieldLimitsSettings;
    }
    void params;
  },
  deleteBoardProperty(property: string, params: Record<string, unknown> = {}): void {
    void property;
    void params;
  },
};

const getMockBoardEditData = (): BoardEditData => ({
  canEdit: true,
  rapidListConfig: {
    mappedColumns: currentColumns.map(c => ({ ...c, isKanPlanColumn: false })),
  },
  swimlanesConfig: { swimlanes: currentSwimlanes },
  cardLayoutConfig: { currentFields },
});

// --- Refs to valtio models ---

let propertyModel: PropertyModel;
let settingsUIModel: SettingsUIModel;

// --- Background setup ---

export const setupBackground = () => {
  globalContainer.reset();
  registerLogger(globalContainer);
  globalContainer.register({
    token: localeProviderToken,
    value: new MockLocaleProvider('en'),
  });

  storedSettings = { limits: {} };
  currentFields = [];
  currentColumns = [];
  currentSwimlanes = [];

  globalContainer.register({
    token: BoardPropertyServiceToken,
    value: mockBoardPropertyService,
  });

  const logger = globalContainer.inject(loggerToken);

  propertyModel = proxy(new PropertyModel(mockBoardPropertyService, logger));
  globalContainer.register({
    token: propertyModelToken,
    value: {
      model: propertyModel,
      useModel: () => useSnapshot(propertyModel) as PropertyModel,
    },
  });

  const getBoardData = async () => getMockBoardEditData();
  settingsUIModel = proxy(new SettingsUIModel(propertyModel, getBoardData, logger));
  globalContainer.register({
    token: settingsUIModelToken,
    value: {
      model: settingsUIModel,
      useModel: () => useSnapshot(settingsUIModel) as SettingsUIModel,
    },
  });
};

// --- Mount helper ---

export const mountSettingsPage = () => {
  cy.mount(
    <WithDi container={globalContainer}>
      <SettingsButton onClick={() => settingsUIModel.open()} label={FIELD_LIMITS_TEXTS.settingsButton.en} />
      <SettingsModal />
    </WithDi>
  );
};

// --- Helper to add limits to stored settings before modal opens ---

export const addStoredLimit = (limit: FieldLimit) => {
  const key = createLimitKey({ fieldId: limit.fieldId, fieldValue: limit.fieldValue });
  storedSettings = {
    ...storedSettings,
    limits: {
      ...storedSettings.limits,
      [key]: limit,
    },
  };
};
