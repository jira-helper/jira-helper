import { createModelToken } from 'src/shared/di/Module';
import type { PropertyModel } from './property/PropertyModel';
import type { SettingsUIModel } from './SettingsPage/models/SettingsUIModel';
import type { BoardRuntimeModel } from './BoardPage/models/BoardRuntimeModel';

export const propertyModelToken = createModelToken<PropertyModel>('swimlane-wip-limits/propertyModel');
export const settingsUIModelToken = createModelToken<SettingsUIModel>('swimlane-wip-limits/settingsUIModel');
export const boardRuntimeModelToken = createModelToken<BoardRuntimeModel>('swimlane-wip-limits/boardRuntimeModel');
