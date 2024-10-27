/* eslint-disable no-continue */
import { getCurrentRoute, onUrlChange, Routes } from '../routing';
import type { PageModification } from './PageModification';

type ModificationsMap = Record<string, (new () => PageModification)[]>;

const currentModifications: Map<new () => PageModification, { id: string; instance: PageModification }> = new Map();
let route: string | null;

const applyModification = async (Modification: new () => PageModification, modificationInstance: PageModification) => {
  const id = modificationInstance.getModificationId();
  currentModifications.set(Modification, { id, instance: modificationInstance });

  try {
    await modificationInstance.preloadData();
  } catch (err) {
    window.console.error('jira-helper: Preload Data Failed:', err);
  }

  const styles = modificationInstance.appendStyles();
  if (styles) document.body.insertAdjacentHTML('beforeend', styles);

  // it's hard to retrieve correct type for this
  const loadingPromise: Promise<any> = modificationInstance.waitForLoading();

  try {
    const dataPromise = modificationInstance.loadData();

    const [loadingElement, data] = await Promise.all([loadingPromise, dataPromise]);

    // Apply the modification once loading and data are ready
    modificationInstance.apply(data, loadingElement);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('jira-helper: Load Data Failed:', err);

    // Run function apply after page load, without loading data from server
    loadingPromise.then(() => {
      modificationInstance.apply();
    });
  }
};

const applyModifications = (modificationsMap: ModificationsMap) => {
  const currentRoute = getCurrentRoute();

  if (route !== currentRoute) {
    route = currentRoute;
  }
  if (!route) {
    return;
  }

  const modificationsForRoute = new Set(modificationsMap[Routes.ALL].concat(modificationsMap[route] || []));

  // Clear modifications that are no longer needed
  for (const Modification of currentModifications.keys()) {
    if (!modificationsForRoute.has(Modification)) {
      currentModifications.get(Modification)?.instance.clear();
      currentModifications.delete(Modification);
    }
  }

  // Apply modifications for the current route
  for (const Modification of modificationsForRoute) {
    const modificationInstance = new Modification();

    Promise.resolve(modificationInstance.shouldApply()).then(shouldApply => {
      if (currentModifications.has(Modification)) {
        const { id: currentModificationId, instance: currentInstance } = currentModifications.get(Modification)!;

        if (!shouldApply) {
          currentInstance.clear();
          currentModifications.delete(Modification);
          return;
        }

        if (currentModificationId !== modificationInstance.getModificationId()) {
          currentInstance.clear();
          currentModifications.delete(Modification);
        } else {
          return;
        }
      }

      if (shouldApply) {
        applyModification(Modification, modificationInstance);
      }
    });
  }
};

export default (modificationsMap: ModificationsMap) => {
  applyModifications(modificationsMap);
  onUrlChange(() => applyModifications(modificationsMap));
};
