import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const Perspective: React.FC<IconProps> = (props) => (
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
      d="M12 3.609V20.4m-9.6-8.396h19.2M18.96 21.6l-14.4-1.8c-1.2-.12-2.16-1.079-2.16-2.278V6.487c0-1.2.96-2.159 2.16-2.279l14.4-1.799c1.44-.12 2.64.96 2.64 2.279v14.513c0 1.44-1.32 2.519-2.64 2.28v.119Z"
    />
  </svg>
);
export default Perspective;
