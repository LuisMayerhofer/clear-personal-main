import * as React from 'react';
import { SVGProps } from 'react';

const Hungary: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={20}
    fill="none"
    viewBox="0 0 30 20"
    {...props}
  >
    <path fill="#F0F0F0" d="M30 0H0v20h30V0Z" />
    <path fill="#D80027" d="M30 0H0v6.667h30V0Z" />
    <path fill="#6DA544" d="M30 13.333H0V20h30v-6.667Z" />
  </svg>
);
export default Hungary;
