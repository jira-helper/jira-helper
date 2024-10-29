export const getRandomString = (length: number): string => {
  return Math.random().toString(36).substring(length);
};

export const isJira: boolean = document.body.id === 'jira';

export const waitForElement = (
  selector: string,
  container: Document | HTMLElement | Element = document
): { promise: Promise<Element>; cancel: () => void } => {
  let intervalId: number;
  const promise = new Promise<Element>(resolve => {
    intervalId = setInterval(() => {
      const element = container.querySelector(selector);
      if (element) {
        clearInterval(intervalId);
        resolve(element);
      }
    }, 100);
  });

  return {
    promise,
    cancel: () => clearInterval(intervalId),
  };
};
