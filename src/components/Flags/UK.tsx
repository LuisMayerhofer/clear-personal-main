import * as React from 'react';
import { SVGProps } from 'react';

const UK: React.FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={30}
		height={20}
		fill="none"
		viewBox="0 0 30 20"
		{...props}
	>
		<path fill="#F0F0F0" d="M30 0H0v20h30V0Z" />
		<path
			fill="#D80027"
			d="M16.875 0h-3.75v8.125H0v3.75h13.125V20h3.75v-8.125H30v-3.75H16.875V0Z"
		/>
		<path
			fill="#0052B4"
			d="m23.074 13.478 6.927 3.848v-3.848h-6.927ZM18.262 13.478 30 20v-1.845l-8.42-4.677h-3.32ZM26.874 20l-8.612-4.785V20h8.612Z"
		/>
		<path fill="#F0F0F0" d="M18.262 13.478 30 20v-1.845l-8.42-4.677h-3.32Z" />
		<path fill="#D80027" d="M18.262 13.478 30 20v-1.845l-8.42-4.677h-3.32Z" />
		<path
			fill="#0052B4"
			d="M5.293 13.478 0 16.418v-2.94h5.293ZM11.738 14.307V20H1.492l10.246-5.693Z"
		/>
		<path fill="#D80027" d="M8.42 13.478 0 18.155V20l11.74-6.522H8.42Z" />
		<path
			fill="#0052B4"
			d="M6.927 6.522 0 2.673v3.849h6.927ZM11.74 6.522 0 0v1.844l8.42 4.678h3.32ZM3.125 0l8.612 4.785V0H3.125Z"
		/>
		<path fill="#F0F0F0" d="M11.74 6.522 0 0v1.844l8.42 4.678h3.32Z" />
		<path fill="#D80027" d="M11.74 6.522 0 0v1.844l8.42 4.678h3.32Z" />
		<path
			fill="#0052B4"
			d="M24.707 6.522 30 3.58v2.94h-5.293ZM18.262 5.692V0h10.245L18.262 5.692Z"
		/>
		<path fill="#D80027" d="m21.581 6.522 8.42-4.678V0L18.26 6.522h3.32Z" />
	</svg>
);
export default UK;
