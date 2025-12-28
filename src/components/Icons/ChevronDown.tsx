import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const ChevronDown: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={iconSizeMapper[props.size ?? DEFAULT_ICON_SIZE]}
    height={iconSizeMapper[props.size ?? DEFAULT_ICON_SIZE]}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke={props.color ?? DEFAULT_ICON_COLOR}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="m7.388 10.5 5 4.58 5-4.58"
    />
  </svg>
);
export default ChevronDown;
