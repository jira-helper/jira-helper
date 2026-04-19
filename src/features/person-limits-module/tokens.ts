import { createModelToken } from 'src/infrastructure/di/Module';
import type { PropertyModel } from './property/PropertyModel';
import type { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';

export const propertyModelToken = createModelToken<PropertyModel>('person-limits/propertyModel');
export const boardRuntimeModelToken = createModelToken<BoardRuntimeModel>('person-limits/boardRuntimeModel');
export const settingsUIModelToken = createModelToken<SettingsUIModel>('person-limits/settingsUIModel');
