import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function KabsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 20h16" />
      <path d="M5 20V5.7c0-.4.1-.8.4-1.1l2.5-2.9c.3-.3.7-.5 1.1-.5h6c.4 0 .8.2 1.1.5l2.5 2.9c.3.3.4.7.4 1.1V20" />
      <path d="M15 10h.01" />
      <path d="M9 10h.01" />
      <path d="M12 15h.01" />
      <path d="M11 20v-5H7v5" />
    </svg>
  );
}
