'use client';

import { ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (row: T) => void;
  sortConfig?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string) => void;
  rowKey?: keyof T | ((row: T) => string);
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

export default function Table<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyMessage = '데이터가 없습니다',
  emptyIcon,
  onRowClick,
  sortConfig,
  onSort,
  rowKey = 'id',
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return String(row[rowKey] ?? index);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-50 border-b border-gray-100" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-50 flex items-center px-4 gap-4">
              {columns.map((_, j) => (
                <div key={j} className="h-4 bg-gray-100 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
        <p className="text-gray-500 text-[14px]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-4 py-3 text-left text-[13px] font-semibold text-gray-700 whitespace-nowrap ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort?.(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="text-[10px]">
                        {sortConfig.direction === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex)}
                className={`border-b border-gray-50 last:border-b-0 ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-orange-50/50 transition-colors'
                    : ''
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const value = getNestedValue(row, String(column.key));
                  return (
                    <td
                      key={String(column.key)}
                      className="px-4 py-4 text-[14px] text-gray-900"
                    >
                      {column.render
                        ? column.render(value, row, rowIndex)
                        : value ?? '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
