type CloudStartupDocument = Pick<Document, 'readyState' | 'body' | 'addEventListener'>;

type CloudStartupScheduler = {
  setTimeout(callback: () => void, delay: number): unknown;
};

export function startCloudExtension(
  initialize: () => Promise<void>,
  documentRef: CloudStartupDocument = document,
  scheduler: CloudStartupScheduler = globalThis,
): void {
  let started = false;

  const runOnce = (): boolean => {
    if (started || !documentRef.body) {
      return false;
    }

    started = true;
    void initialize().catch((error) => {
      console.error('[JiraHelperCloud] Failed to initialize Cloud extension', error);
    });
    return true;
  };

  const retryUntilBodyExists = () => {
    if (started) {
      return;
    }

    scheduler.setTimeout(() => {
      if (!runOnce()) {
        retryUntilBodyExists();
      }
    }, 50);
  };

  if (!runOnce()) {
    retryUntilBodyExists();
  }

  if (documentRef.readyState === 'loading') {
    documentRef.addEventListener('DOMContentLoaded', runOnce, { once: true });
  }
}
