import React from 'react';

const WIDTH_CLASSES = ['w-3/4', 'w-1/2', 'w-2/3'];

const TableSkeleton = ({ rows = 6, cols = 6, productCol = 0, columns }) => {
  const safeRows = Math.max(1, Number(rows) || 1);
  const safeCols = Array.isArray(columns) && columns.length > 0 ? columns.length : Math.max(1, Number(cols) || 1);

  const renderCell = (type, widthClass) => {
    if (type === 'product') {
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-zinc-200" />
          <div className={`h-3.5 rounded-md bg-zinc-200 ${widthClass}`} />
        </div>
      );
    }

    if (type === 'chevronName') {
      return (
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-zinc-200" />
          <div className={`h-3.5 rounded-md bg-zinc-200 ${widthClass}`} />
        </div>
      );
    }

    if (type === 'type') {
      return <div className="h-5 w-20 rounded-full bg-zinc-200" />;
    }

    if (type === 'actions') {
      return (
        <div className="flex items-center justify-end gap-2">
          <div className="h-8 w-8 rounded-md bg-zinc-200" />
          <div className="h-8 w-8 rounded-md bg-zinc-200" />
        </div>
      );
    }

    if (type === 'toggle') {
      return <div className="h-6 w-12 rounded-full bg-zinc-200" />;
    }

    return <div className={`h-3.5 rounded-md bg-zinc-200 ${widthClass}`} />;
  };

  return (
    <tbody className="animate-pulse">
      {Array.from({ length: safeRows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="border-b border-zinc-100">
          {Array.from({ length: safeCols }).map((__, colIndex) => {
            const widthClass = WIDTH_CLASSES[(rowIndex + colIndex) % WIDTH_CLASSES.length];
            const defaultType = colIndex === productCol ? 'product' : 'text';
            const type = Array.isArray(columns) && columns.length > 0 ? columns[colIndex] || 'text' : defaultType;

            return (
              <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className="px-4 py-3">
                {renderCell(type, widthClass)}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
};

export default TableSkeleton;
