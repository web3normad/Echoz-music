import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


if (typeof structuredClone === 'undefined') {
  window.structuredClone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}