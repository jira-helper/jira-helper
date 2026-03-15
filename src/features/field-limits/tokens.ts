import { Token } from 'dioma';
import type { PropertyModel } from './property/PropertyModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import type { IFieldLimitsBoardPageObject } from './BoardPage/page-objects/FieldLimitsBoardPageObject';

export const propertyModelToken = new Token<{
  model: Readonly<PropertyModel>;
  useModel: () => Readonly<PropertyModel>;
}>('field-limits/propertyModel');

export const settingsUIModelToken = new Token<{
  model: Readonly<SettingsUIModel>;
  useModel: () => Readonly<SettingsUIModel>;
}>('field-limits/settingsUIModel');

export const boardRuntimeModelToken = new Token<{
  model: Readonly<BoardRuntimeModel>;
  useModel: () => Readonly<BoardRuntimeModel>;
}>('field-limits/boardRuntimeModel');

export const fieldLimitsBoardPageObjectToken = new Token<IFieldLimitsBoardPageObject>('field-limits/boardPageObject');
