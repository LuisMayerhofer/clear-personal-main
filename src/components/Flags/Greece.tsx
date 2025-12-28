import * as React from 'react';
import { SVGProps } from 'react';

const Greece: React.FC<SVGProps<SVGSVGElement>> = (props) => (
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
      fill="#338AF3"
      d="M30 0H0v2.5h30V0ZM30 5H0v2.5h30V5ZM30 10H0v2.5h30V10ZM30 15H0v2.5h30V15Z"
    />
    <path fill="#338AF3" d="M11.087 0H0v10h11.087V0Z" />
    <path fill="#F0F0F0" d="M11.087 3.89H0V6.11h11.087V3.89Z" />
    <path fill="#F0F0F0" d="M6.652 0H4.43v10h2.222V0Z" />
  </svg>
);
export default Greece;
