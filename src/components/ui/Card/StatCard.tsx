'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    label?: string;
  };
  loading?: boolean;
  className?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  loading = false,
  className = '',
}: StatCardProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
          <div className="h-8 w-32 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  const isPositive = change && change.value > 0;
  const isNegative = change && change.value < 0;

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-gray-500 font-medium mb-1">{title}</p>
          <p className="text-[28px] font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-[12px] font-semibold ${
                  isPositive
                    ? 'text-green-600'
                    : isNegative
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {isPositive && '+'}
                {change.value}%
              </span>
              {change.label && (
                <span className="text-[12px] text-gray-400">{change.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffa726] to-[#ffb74d] flex items-center justify-center text-white">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
