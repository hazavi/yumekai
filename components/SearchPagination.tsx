"use client";

import { useRouter } from "next/navigation";

interface PaginationItem {
  active: boolean;
  href: string | null;
  text: string;
}

interface SearchPaginationProps {
  pagination: PaginationItem[];
  currentPage: number;
  searchQuery: string;
}

export function SearchPagination({
  pagination,
  currentPage,
  searchQuery,
}: SearchPaginationProps) {
  const router = useRouter();

  const handlePageClick = (pageNumber: number) => {
    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&page=${pageNumber}`
    );
  };

  if (!pagination || pagination.length === 0) {
    return null;
  }

  return (
    <div className="flex justify-center items-center mt-12 mb-8">
      <nav className="flex items-center space-x-1">
        {pagination.map((item, index) => {
          const isNumber = !isNaN(Number(item.text));
          const isArrow =
            item.text === "›" ||
            item.text === "‹" ||
            item.text === "»" ||
            item.text === "«";
          const pageNumber = Number(item.text);

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

          // For numeric pages, always allow clicking
          if (isNumber && pageNumber) {
            return (
              <button
                key={index}
                onClick={() => handlePageClick(pageNumber)}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:cursor-pointer hover:bg-white/10 rounded-md hover:scale-105 transition-all duration-200"
              >
                {item.text}
              </button>
            );
          }

          // For arrows, handle prev/next logic
          if (isArrow) {
            let targetPage = currentPage;
            if (item.text === "›" || item.text === "»") {
              targetPage = currentPage + 1;
            } else if (item.text === "‹" || item.text === "«") {
              targetPage = currentPage - 1;
            }

            // Disable if at boundaries
            if (
              targetPage < 1 ||
              (item.text === "›" &&
                !pagination.find((p) => Number(p.text) > currentPage))
            ) {
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
              <button
                key={index}
                onClick={() => handlePageClick(targetPage)}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:cursor-pointer hover:bg-white/10 rounded-md hover:scale-105 transition-all duration-200"
              >
                {item.text}
              </button>
            );
          }

          // Fallback for other items (like "...")
          return (
            <span
              key={index}
              className="px-4 py-2 text-sm font-medium text-gray-500"
            >
              {item.text}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
