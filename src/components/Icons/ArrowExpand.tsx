import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const ArrowExpand: React.FC<IconProps> = (props) => (
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
      d="M14.206 4H20m0 0v5.793M20 4l-5.794 5.793M9.794 20H4m0 0v-5.793M4 20l6-6m9.999.206V20m0 0h-5.793M20 20l-5.793-5.794M4 9.794V4m0 0h5.793M4 4l6 6"
    />
  </svg>
);
export default ArrowExpand;
