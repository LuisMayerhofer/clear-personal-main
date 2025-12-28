import { FC, SVGProps } from 'react';
import Turkey from './Turkey';
import UK from './UK';
import { Locale } from '@/dictionaries';
import Germany from './Germany';

export const flags: Record<Locale, FC<SVGProps<SVGSVGElement>>> = {
  en: UK,
  tr: Turkey,
  de: Germany,
};
