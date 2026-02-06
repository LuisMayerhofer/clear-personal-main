import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const ArrowRotateLeft: React.FC<IconProps> = (props) => (
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
			d="M4.871 14.5C5.89 17.694 8.805 20 12.242 20 16.527 20 20 16.418 20 12s-3.473-8-7.758-8c-2.871 0-5.378 1.609-6.72 4m-.65-.782L5.94 8.25M7.879 9H4V5l3.879 4Z"
		/>
	</svg>
);
export default ArrowRotateLeft;
