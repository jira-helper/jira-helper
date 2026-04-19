import { Token } from 'dioma';
import { createModelToken } from 'src/shared/di/Module';
import type { PropertyModel } from './property/PropertyModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import type { IFieldLimitsBoardPageObject } from './BoardPage/page-objects/FieldLimitsBoardPageObject';

export const propertyModelToken = createModelToken<PropertyModel>('field-limits/propertyModel');
export const settingsUIModelToken = createModelToken<SettingsUIModel>('field-limits/settingsUIModel');
export const boardRuntimeModelToken = createModelToken<BoardRuntimeModel>('field-limits/boardRuntimeModel');

export const fieldLimitsBoardPageObjectToken = new Token<IFieldLimitsBoardPageObject>('field-limits/boardPageObject');
