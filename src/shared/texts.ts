export type Texts<textsKeys extends string> = {
  [key in textsKeys]: {
    ru: string;
    en: string;
  };
};

// from HTML or from settings
export const getCurrentLocale = () => {};
