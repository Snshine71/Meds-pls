import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded font-sans font-medium ' +
  'px-4 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-none';

const variants: Record<Variant, string> = {
  primary: 'bg-blueprint text-white hover:bg-blueprint/90',
  secondary:
    'bg-panel text-ink border border-blueprint-2/60 hover:border-blueprint hover:text-blueprint',
  ghost: 'bg-transparent text-ink hover:bg-blueprint-2/20',
  danger: 'bg-signal text-white hover:bg-signal/90',
};

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
