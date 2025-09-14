"use client";
// Plain anchor; active state detection via window.location pathname (client only)
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

interface NavItemProps {
  href: string;
}

export function NavItem({ href, children }: PropsWithChildren<NavItemProps>) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <a
      href={href}
      className={`px-1 py-1 font-medium text-sm tracking-wide transition relative after:absolute after:left-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-white/80 after:transition-all after:duration-300 ${active ? "text-white after:w-full" : "text-white/70 hover:text-white after:w-0 hover:after:w-full"}`}
    >
      {children}
    </a>
  );
}
