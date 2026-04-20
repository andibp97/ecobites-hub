import clsx from 'clsx';

export default function Button({ children, variant = 'primary', size = 'md', className, ...props }) {
  const base = "font-semibold rounded-lg transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#6ee7b7] text-[#022c22] hover:opacity-85 active:scale-[0.97]",
    secondary: "bg-transparent text-[#94a3b8] border border-[#1c1c32] hover:border-[#6ee7b7] hover:text-[#e2e8f0]"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}