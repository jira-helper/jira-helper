import { globalContainer } from 'dioma';
import { routingServiceToken } from './tokens';

export { Routes, type Route } from './routes';
export { RoutingService, registerRoutingServiceInDI } from './RoutingService';
export { routingServiceToken } from './tokens';
export type { IRoutingService } from './IRoutingService';

// Backward-compatible standalone functions for consumers not yet migrated to DI
const getService = () => globalContainer.inject(routingServiceToken);

export const getSearchParam = (param: string): string | null => getService().getSearchParam(param);
export const getReportNameFromURL = (): string | null => getService().getReportNameFromURL();
export const getBoardIdFromURL = (): string | null => getService().getBoardIdFromURL();
export const getCurrentRoute = () => getService().getCurrentRoute();
export const getSettingsTab = () => getService().getSettingsTab();
export const getIssueId = (): string | null => getService().getIssueId();
export const onUrlChange = (cb: (url: string) => void): void => getService().onUrlChange(cb);
