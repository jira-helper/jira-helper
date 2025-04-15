export const getRandomString = (length: number): string => {
  return Math.random().toString(36).substring(length);
};

export const isJira: boolean = document.body.id === 'jira';

export const waitForElement = (
  selector: string,
  container: Document | HTMLElement | Element = document
): { promise: Promise<Element>; cancel: () => void } => {
  let intervalId: any;
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

export function hslFromRGB(r: number, g: number, b: number) {
  /**
   * I: Three arguments, red (r), green (g), blue (b), all ∈ [0, 255]
   * O: An array of three elements hue (h) ∈ [0, 360], and saturation (s) and lightness (l) which are both ∈ [0, 1]
   */

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  let h = 0;

  // Lightness
  const l = (max + min) / 2;

  // Saturation
  const s = diff === 0 ? 0 : diff / (1 - Math.abs(2 * l - 1));

  // Hue
  if (diff === 0) {
    h = 0;
  } else {
    // 1/6 is equivalent to 60 degrees
    if (max === r) {
      h = (1 / 6) * (0 + (g - b) / diff);
    }
    if (max === g) {
      h = (1 / 6) * (2 + (b - r) / diff);
    }
    if (max === b) {
      h = (1 / 6) * (4 + (r - g) / diff);
    }
  }
  h = Math.round(h * 360);

  return [h, s, l];
}
