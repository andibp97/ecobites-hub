import clsx from 'clsx';

export default function Card({ children, className, ...props }) {
  return (
    <div className={clsx("bg-[#0d0d1c] border border-[#1c1c32] rounded-xl p-5", className)} {...props}>
      {children}
    </div>
  );
}