"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
  className?: string;
}

export const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize: itemsPerPage,
  className = "",
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages !== 1) {
      range.push(totalPages);
    }

    return range;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === "number" && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            }
          `}
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => handlePageClick(page)}
              disabled={page === "..."}
              className={`
                w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200
                ${page === currentPage
                  ? "bg-indigo-500 text-white shadow-sm"
                  : page === "..."
                    ? "text-gray-400 cursor-default"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            }
          `}
        >
          Next
          <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
