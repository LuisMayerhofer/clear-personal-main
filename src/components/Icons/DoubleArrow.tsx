import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const DoubleArrow: React.FC<IconProps> = (props) => (
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
			d="M6.375 9.75 3 6.375m0 0L6.375 3M3 6.375h18m-3.375 7.875L21 17.625m0 0L17.625 21M21 17.625H3"
		/>
	</svg>
);
export default DoubleArrow;
