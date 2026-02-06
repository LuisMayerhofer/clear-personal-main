import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const MinusSquare: React.FC<IconProps> = (props) => (
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
			d="M8.625 12h6.75M21 6.375v11.25A3.375 3.375 0 0 1 17.625 21H6.375A3.375 3.375 0 0 1 3 17.625V6.375A3.375 3.375 0 0 1 6.375 3h11.25A3.375 3.375 0 0 1 21 6.375Z"
		/>
	</svg>
);
export default MinusSquare;
