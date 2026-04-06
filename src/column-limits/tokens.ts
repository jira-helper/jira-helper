import { createModelToken } from 'src/shared/di/Module';
import type { PropertyModel } from './property/PropertyModel';
import type { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';

export const propertyModelToken = createModelToken<PropertyModel>('column-limits/propertyModel');
export const boardRuntimeModelToken = createModelToken<BoardRuntimeModel>('column-limits/boardRuntimeModel');
export const settingsUIModelToken = createModelToken<SettingsUIModel>('column-limits/settingsUIModel');
