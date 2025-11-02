import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from './table';

interface SortableTableHeaderProps {
  columnKey: string;
  children: React.ReactNode;
  onSort: (key: string) => void;
  getSortIcon: (key: string) => { icon: string; level: number | null };
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function SortableTableHeader({
  columnKey,
  children,
  onSort,
  getSortIcon,
  className = '',
  align = 'left',
}: SortableTableHeaderProps) {
  const { icon, level } = getSortIcon(columnKey);

  const alignClass =
    align === 'right'
      ? 'justify-end text-right'
      : align === 'center'
      ? 'justify-center text-center'
      : 'justify-start text-left';

  return (
    <TableHead className={`font-bold ${className}`}>
      <button
        onClick={() => onSort(columnKey)}
        className={`flex items-center gap-2 w-full hover:text-blue-600 transition-colors ${alignClass}`}
      >
        <span>{children}</span>
        <span className="flex items-center gap-1">
          {icon === 'none' && (
            <ArrowUpDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
          )}
          {icon === 'asc' && <ArrowUp className="h-4 w-4 text-blue-600" />}
          {icon === 'desc' && <ArrowDown className="h-4 w-4 text-blue-600" />}
          {level !== null && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center">
              {level}
            </span>
          )}
        </span>
      </button>
    </TableHead>
  );
}
