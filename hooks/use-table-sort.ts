import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function useTableSort<T>(data: T[], initialSort?: SortConfig[]) {
  const [sortConfig, setSortConfig] = useState<SortConfig[]>(initialSort || []);

  const handleSort = (key: string) => {
    setSortConfig((currentConfig) => {
      // Find if this column is already being sorted
      const existingIndex = currentConfig.findIndex((config) => config.key === key);

      if (existingIndex === -1) {
        // New column sort - add as primary sort (desc first)
        return [{ key, direction: 'desc' }, ...currentConfig];
      }

      const existingSort = currentConfig[existingIndex];

      // Cycle through: desc -> asc -> null
      if (existingSort.direction === 'desc') {
        // Change to ascending
        const newConfig = [...currentConfig];
        newConfig[existingIndex] = { key, direction: 'asc' };
        return newConfig;
      } else if (existingSort.direction === 'asc') {
        // Remove this sort level
        const newConfig = currentConfig.filter((_, index) => index !== existingIndex);

        // If this was the primary sort (index 0), reset all sub-sorts
        if (existingIndex === 0) {
          return [];
        }

        return newConfig;
      }

      return currentConfig;
    });
  };

  // Helper function to get nested value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const sortedData = useMemo(() => {
    if (sortConfig.length === 0) {
      return data;
    }

    const sorted = [...data].sort((a, b) => {
      // Apply sorts in order (primary first, then secondary, etc.)
      for (const config of sortConfig) {
        const aValue = getNestedValue(a, config.key);
        const bValue = getNestedValue(b, config.key);

        // Handle null/undefined
        if (aValue == null && bValue == null) continue;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Compare values
        let comparison = 0;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue, 'th');
        } else {
          // Fallback to string comparison
          comparison = String(aValue).localeCompare(String(bValue), 'th');
        }

        if (comparison !== 0) {
          return config.direction === 'desc' ? -comparison : comparison;
        }
      }

      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const getSortIcon = (key: string): { icon: string; level: number | null } => {
    const index = sortConfig.findIndex((config) => config.key === key);

    if (index === -1) {
      return { icon: 'none', level: null };
    }

    const config = sortConfig[index];
    const level = index === 0 ? null : index + 1; // Show level for sub-sorts only

    return {
      icon: config.direction === 'desc' ? 'desc' : 'asc',
      level,
    };
  };

  const clearSort = () => {
    setSortConfig([]);
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
    getSortIcon,
    clearSort,
  };
}
