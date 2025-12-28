import * as React from 'react';
import { SVGProps } from 'react';

const Turkey: React.FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={30}
    height={20}
    fill="none"
    viewBox="0 0 30 20"
    {...props}
  >
    <path fill="#D80027" d="M30 0H0v20h30V0Z" />
    <path
      fill="#F0F0F0"
      d="m14.483 7.702 1.031 1.421 1.67-.541-1.033 1.42 1.03 1.42-1.668-.544-1.033 1.42.002-1.755-1.67-.544 1.67-.541.001-1.756Z"
    />
    <path
      fill="#F0F0F0"
      d="M11.674 13.551a3.551 3.551 0 1 1 1.689-6.675 4.37 4.37 0 1 0 0 6.248 3.534 3.534 0 0 1-1.69.427Z"
    />
  </svg>
);
export default Turkey;
