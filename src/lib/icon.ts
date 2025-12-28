import { IconSizes } from '@/components/Icons/Icon';

export const iconSizeMapper: {
  [K in IconSizes]: number;
} = {
  xxs: 12,
  xs: 16,
  s: 20,
  m: 24,
  l: 28,
  xl: 32,
  xxl: 36,
};

export const DEFAULT_ICON_SIZE: IconSizes = 'm';
export const DEFAULT_ICON_COLOR: string = '#202224';
export const DEFAULT_ICON_FILL: string = '#FFF';
