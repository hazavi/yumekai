import { PropsWithChildren } from "react";

interface SectionHeaderProps {
  href?: string;
  actionLabel?: string;
  className?: string;
}

export function SectionHeader({ className = "", children }: PropsWithChildren<SectionHeaderProps>) {
  return (
    <div className={`flex items-center justify-between gap-4 mb-6 ${className}`}>
      <h2 className="text-xl sm:text-2xl font-bold font-poppins" data-text={typeof children === 'string' ? children : ''}>{children}</h2>
    </div>
  );
}
