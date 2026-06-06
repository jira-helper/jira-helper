// src/cloud/shared/di/index.ts
// Экспорт DI-модуля (исправленная версия)

export * from './tokens';
export * from './jiraApiTokens.cloud';
export { cloudContainer, registerCloudServices, resolveService } from './container';
