import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const LockOpen: React.FC<IconProps> = (props) => (
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
			strokeWidth={2}
			d="M12.954 16.213v-2.4M7.329 7.9c0-3.04 2.408-5.486 5.4-5.486 1.863 0 3.5.95 4.47 2.4m-9.645 4c-.99 0-1.8.823-1.8 1.829v9.143c0 1.005.81 1.828 1.8 1.828h10.8c.99 0 1.8-.823 1.8-1.828v-9.143c0-1.006-.81-1.829-1.8-1.829h-10.8Z"
		/>
	</svg>
);
export default LockOpen;
