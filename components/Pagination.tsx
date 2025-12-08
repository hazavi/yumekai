"use client";

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

export function Pagination({ pagination, basePath }: PaginationProps) {
  // Normalize an incoming API href (may be relative like '/most-popular?page=2' or missing the page query)
  const buildHref = (item: PaginationItem): string | null => {
    // Numeric buttons: derive target page from text even if href is missing
    const targetPage = !isNaN(Number(item.text))
      ? Number(item.text)
      : undefined;
    if (targetPage) {
      // Check if basePath already has query params
      const separator = basePath.includes("?") ? "&" : "?";
      return `${basePath}${separator}page=${targetPage}`;
    }

    if (!item.href) return null;

    // If the API already provides a query param keep it.
    if (item.href.includes("?")) return item.href;

    // Fallback to original href
    return item.href;
  };

  const handlePaginationClick = (item: PaginationItem) => {
    const href = buildHref(item);
    if (!href) return;
    // Always trigger a full page reload
    const finalHref = href.includes("?") ? href : `${href}?page=${item.text}`;
    if (typeof window !== "undefined") {
      window.location.href = finalHref;
    }
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

          const resolvedHref = buildHref(item);
          return (
            <button
              key={index}
              onClick={() => handlePaginationClick(item)}
              data-href={resolvedHref || undefined}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isNumber || isArrow
                  ? "text-white/70 hover:text-white hover:cursor-pointer hover:bg-white/10 rounded-md hover:scale-105"
                  : "text-white/70 hover:text-white hover:cursor-pointer hover:bg-white/10 rounded-md hover:scale-105"
              }`}
            >
              {item.text}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
