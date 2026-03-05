import { Token } from 'dioma';
import type { PropertyModel } from './property/PropertyModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';

export const propertyModelToken = new Token<{
  model: Readonly<PropertyModel>;
  useModel: () => Readonly<PropertyModel>;
}>('swimlane-wip-limits/propertyModel');

export const settingsUIModelToken = new Token<{
  model: Readonly<SettingsUIModel>;
  useModel: () => Readonly<SettingsUIModel>;
}>('swimlane-wip-limits/settingsUIModel');

export const boardRuntimeModelToken = new Token<{
  model: Readonly<BoardRuntimeModel>;
  useModel: () => Readonly<BoardRuntimeModel>;
}>('swimlane-wip-limits/boardRuntimeModel');
