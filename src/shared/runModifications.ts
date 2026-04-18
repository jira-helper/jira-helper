import { Routes } from '../routing';
import type { IRoutingService } from '../routing/IRoutingService';
import type { PageModification } from './PageModification';

export type ModificationsMap = Record<string, PageModification<any, any>[]>;

const currentModifications = new Map<PageModification, string>();
let route: string | null = null;

const applyModification = async (instance: PageModification) => {
  const id = instance.getModificationId();
  currentModifications.set(instance, id);

  try {
    await instance.preloadData();
  } catch (err) {
    window.console.error('jira-helper: Preload Data Failed:', err);
  }

  const styles = instance.appendStyles();
  if (styles) document.body.insertAdjacentHTML('beforeend', styles);

  // it's hard to retrieve correct type for this
  const loadingPromise: Promise<any> = instance.waitForLoading();

  try {
    const dataPromise = instance.loadData();

    const [loadingElement, data] = await Promise.all([loadingPromise, dataPromise]);

    instance.apply(data, loadingElement);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('jira-helper: Load Data Failed:', err);

    loadingPromise.then(() => {
      instance.apply();
    });
  }
};

const applyModifications = (modificationsMap: ModificationsMap, routingService: IRoutingService) => {
  route = routingService.getCurrentRoute();

  if (!route) {
    return;
  }

  const modificationsForRoute = new Set((modificationsMap[Routes.ALL] || []).concat(modificationsMap[route] || []));

  // Clear modifications that are no longer needed
  for (const instance of currentModifications.keys()) {
    if (!modificationsForRoute.has(instance)) {
      instance.clear();
      currentModifications.delete(instance);
    }
  }

  // Apply modifications for the current route
  for (const instance of modificationsForRoute) {
    Promise.resolve(instance.shouldApply()).then(shouldApply => {
      const currentId = currentModifications.get(instance);

      if (currentId !== undefined) {
        if (!shouldApply) {
          instance.clear();
          currentModifications.delete(instance);
          return;
        }

        if (currentId !== instance.getModificationId()) {
          instance.clear();
          currentModifications.delete(instance);
        } else {
          return;
        }
      }

      if (shouldApply) {
        applyModification(instance);
      }
    });
  }
};

export default (modificationsMap: ModificationsMap, routingService: IRoutingService) => {
  applyModifications(modificationsMap, routingService);
  routingService.onUrlChange(() => applyModifications(modificationsMap, routingService));
};
