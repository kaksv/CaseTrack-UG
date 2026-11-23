import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-900 text-cream shadow-sm hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-400',
  secondary:
    'bg-white/80 text-ink-900 ring-1 ring-inset ring-ink-200 hover:bg-white hover:ring-ink-300 active:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900 active:bg-ink-100',
  gold: 'bg-gold-500 text-ink-950 shadow-sm hover:bg-gold-400 active:bg-gold-600',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-9 px-3.5 py-2 text-[13px]',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-6 py-3 text-[15px]',
};

export function buttonClasses(
  variant: Variant = 'primary',
  size: Size = 'md',
  className?: string
): string {
  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
});
