import 'server-only';

// To add a new language, add the dictionary JSON to this dictionaries object.
const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  tr: () => import('@/dictionaries/tr.json').then((module) => module.default),
  de: () => import('@/dictionaries/de.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
