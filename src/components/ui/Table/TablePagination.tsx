'use client';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

export default function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100 rounded-b-2xl">
      <div className="flex items-center gap-4">
        <span className="text-[13px] text-gray-600">
          전체 {totalItems.toLocaleString()}개 중 {startItem}-{endItem}
        </span>
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
          >
            {itemsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}개씩
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          이전
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`min-w-[32px] px-2 py-1.5 text-[13px] rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-[#ffa726] text-white font-semibold'
                : page === '...'
                ? 'cursor-default text-gray-400'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
