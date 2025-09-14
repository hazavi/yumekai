"use client";
import Link from "next/link";

interface PaginationItem {
  active: boolean;
  href: string | null;
  text: string;
}

interface PaginationProps {
  pagination: PaginationItem[];
  currentPage: number;
  basePath: string;
}

export function Pagination({ pagination, currentPage, basePath }: PaginationProps) {
  if (!pagination || pagination.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center items-center mt-12 mb-8">
      <nav className="flex items-center space-x-1">
        {pagination.map((item, index) => {
          const isNumber = !isNaN(Number(item.text));
          const isArrow = item.text === "›" || item.text === "‹" || item.text === "»" || item.text === "«";
          
          if (item.active) {
            return (
              <span
                key={index}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md"
              >
                {item.text}
              </span>
            );
          }

          if (!item.href) {
            return (
              <span
                key={index}
                className="px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
              >
                {item.text}
              </span>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                isNumber
                  ? "text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                  : isArrow
                  ? "text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                  : "text-white/70 hover:text-white hover:bg-white/10 rounded-md"
              }`}
            >
              {item.text}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}