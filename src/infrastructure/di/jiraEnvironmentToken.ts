// src/infrastructure/di/jiraEnvironmentToken.ts
// Токен для определения типа окружения Jira (Server или Cloud)

import { Token } from 'dioma';

export type JiraEnvironment = { type: 'server' | 'cloud' };

export const jiraEnvironmentToken = new Token<JiraEnvironment>('JiraEnvironment');
