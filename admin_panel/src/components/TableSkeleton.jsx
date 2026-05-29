import React from 'react';

const TableSkeleton = ({ rows = 6, cols = 6, productCol = 0, columns }) => {
  const safeRows = Math.max(1, Number(rows) || 1);
  const safeCols = Array.isArray(columns) && columns.length > 0 ? columns.length : Math.max(1, Number(cols) || 1);

  const renderCell = (type, widthPercent) => {
    const pulseStyle = {
      animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      backgroundColor: '#e4e4e7',
      borderRadius: '6px',
    };

    if (type === 'product') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ ...pulseStyle, width: 34, height: 34, flexShrink: 0 }} />
          <div style={{ ...pulseStyle, width: widthPercent, height: 14 }} />
        </div>
      );
    }

    if (type === 'chevronName') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...pulseStyle, width: 12, height: 12, flexShrink: 0 }} />
          <div style={{ ...pulseStyle, width: widthPercent, height: 14 }} />
        </div>
      );
    }

    if (type === 'type') {
      return <div style={{ ...pulseStyle, width: 80, height: 20, borderRadius: 9999 }} />;
    }

    if (type === 'actions') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...pulseStyle, width: 32, height: 32 }} />
          <div style={{ ...pulseStyle, width: 32, height: 32 }} />
        </div>
      );
    }

    if (type === 'toggle') {
      return <div style={{ ...pulseStyle, width: 48, height: 24, borderRadius: 9999 }} />;
    }

    return <div style={{ ...pulseStyle, width: widthPercent, height: 14 }} />;
  };

  const WIDTH_PERCENTAGES = ['75%', '50%', '66%'];

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
      <tbody>
        {Array.from({ length: safeRows }).map((_, rowIndex) => (
          <tr key={`skeleton-row-${rowIndex}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
            {Array.from({ length: safeCols }).map((__, colIndex) => {
              const widthPercent = WIDTH_PERCENTAGES[(rowIndex + colIndex) % WIDTH_PERCENTAGES.length];
              const defaultType = colIndex === productCol ? 'product' : 'text';
              const type = Array.isArray(columns) && columns.length > 0 ? columns[colIndex] || 'text' : defaultType;

              return (
                <td key={`skeleton-cell-${rowIndex}-${colIndex}`} style={{ padding: '14px' }}>
                  {renderCell(type, widthPercent)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </>
  );
};

export default TableSkeleton;
