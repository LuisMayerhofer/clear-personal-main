import * as React from 'react';
import { IconProps } from './Icon';
import {
  DEFAULT_ICON_COLOR,
  DEFAULT_ICON_FILL,
  DEFAULT_ICON_SIZE,
  iconSizeMapper,
} from '@/lib/icon';

const LockClosed: React.FC<IconProps> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={iconSizeMapper[props.size ?? DEFAULT_ICON_SIZE]}
    height={iconSizeMapper[props.size ?? DEFAULT_ICON_SIZE]}
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      stroke={props.fill ?? DEFAULT_ICON_FILL}
      d="M6.764 7.899c0-3.04 2.409-5.486 5.4-5.486 2.992 0 5.4 2.447 5.4 5.486v.914c.99 0 1.8.823 1.8 1.829v9.143c0 1.005-.81 1.828-1.8 1.828h-10.8c-.99 0-1.8-.823-1.8-1.828v-9.143c0-1.006.81-1.829 1.8-1.829V7.9Z"
    />
    <path
      stroke={props.color ?? DEFAULT_ICON_COLOR}
      strokeLinecap="round"
      strokeWidth={2}
      d="M6.764 8.813V7.9c0-3.04 2.409-5.486 5.4-5.486 2.992 0 5.4 2.447 5.4 5.486v.914m-10.8 0c-.99 0-1.8.823-1.8 1.829v9.143c0 1.005.81 1.828 1.8 1.828h10.8c.99 0 1.8-.823 1.8-1.828v-9.143c0-1.006-.81-1.829-1.8-1.829m-10.8 0h10.8m-5.4 7.4v-2.4"
    />
  </svg>
);
export default LockClosed;
