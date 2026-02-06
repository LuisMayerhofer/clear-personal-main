import * as React from 'react';
import { SVGProps } from 'react';

const Germany: React.FC<SVGProps<SVGSVGElement>> = (props) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={30}
		height={20}
		fill="none"
		viewBox="0 0 30 20"
		{...props}
	>
		<path fill="#D80027" d="M30 0H0v20h30V0Z" />
		<path fill="#000" d="M30 0H0v6.666h30V0Z" />
		<path fill="#FFDA44" d="M30 13.333H0v6.666h30v-6.666Z" />
	</svg>
);
export default Germany;
