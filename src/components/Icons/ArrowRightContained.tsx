import * as React from 'react';
import { IconProps } from './Icon';
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE, iconSizeMapper } from '@/lib/icon';

const ArrowRightContained: React.FC<IconProps> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={iconSizeMapper[props.size ?? DEFAULT_ICON_SIZE]}
		height={iconSizeMapper[props.size ?? DEFAULT_ICON_SIZE]}
		fill="none"
		viewBox="0 0 24 24"
		{...props}
	>
		<path
			fill={props.color ?? DEFAULT_ICON_COLOR}
			d="M11.643 7.183a1 1 0 0 0-1.537 1.28l1.537-1.28Zm2.546 4.617.768.64a1 1 0 0 0 0-1.28l-.768.64Zm-4.083 3.338a1 1 0 0 0 1.537 1.28l-1.537-1.28Zm0-6.675 3.315 3.978 1.536-1.28-3.314-3.978-1.537 1.28Zm3.315 2.697-3.315 3.978 1.537 1.28 3.314-3.977-1.536-1.28ZM12 4a8 8 0 0 1 8 8h2c0-5.523-4.477-10-10-10v2Zm8 8a8 8 0 0 1-8 8v2c5.523 0 10-4.477 10-10h-2Zm-8 8a8 8 0 0 1-8-8H2c0 5.523 4.477 10 10 10v-2Zm-8-8a8 8 0 0 1 8-8V2C6.477 2 2 6.477 2 12h2Z"
		/>
	</svg>
);
export default ArrowRightContained;
