import React from 'react';
import './Table.css';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

function Table<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="table-loading">
        <div className="table-spinner" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <span>{emptyMessage}</span>
      </div>
    );
  }

  const renderCellContent = (item: T, column: TableColumn<T>): React.ReactNode => {
    if (column.render) {
      return column.render(item);
    }
    
    const value = item[column.key as keyof T];
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="table-th"
                style={{ width: column.width }}
              >
                {column.sortable ? (
                  <span className="table-sortable">{column.header}</span>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={onRowClick ? 'table-row-clickable' : ''}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="table-td">
                  {renderCellContent(item, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
