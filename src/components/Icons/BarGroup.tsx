import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const BarGroup: React.FC<IconProps> = (props) => (
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
			d="M14.944 21.088V3.912a1 1 0 0 0-1-1H9.884a1 1 0 0 0-1 1v17.176m6.059 0-.002-10.32a1 1 0 0 1 1-1H20a1 1 0 0 1 1 1v9.32a1 1 0 0 1-1 1h-5.056Zm0 0H8.884m0 0v-5a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4.885Z"
		/>
	</svg>
);
export default BarGroup;
