import * as React from 'react';
import { SVGProps } from 'react';

const Albania: React.FC<SVGProps<SVGSVGElement>> = (props) => (
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
      fill="#000"
      d="M20.652 7.422H17.03A1.304 1.304 0 1 0 15 5.801a1.303 1.303 0 0 0-2.391.72c0 .35.137.667.36.901H9.349c0 .96.836 1.739 1.797 1.739h-.058c0 .96.779 1.74 1.739 1.74 0 .31.082.602.225.854l-1.442 1.443 1.106 1.107 1.57-1.57c.062.022.125.04.191.053l-.949 2.142L15 16.52l1.472-1.591-.948-2.142c.065-.013.129-.03.19-.053l1.57 1.57 1.107-1.107-1.442-1.443c.143-.252.225-.544.225-.855.96 0 1.739-.779 1.739-1.739h-.058c.96 0 1.797-.779 1.797-1.739Z"
    />
  </svg>
);
export default Albania;
