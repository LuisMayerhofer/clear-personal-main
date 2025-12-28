export type IconSizes = 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: IconSizes;
  color?: string;
  fill?: string;
}
