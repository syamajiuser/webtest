import React from 'react';

interface PrintableBarcodeProps {
  value: string;
  type?: 'code128' | 'qr';
  label?: string;
  subLabel?: string;
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export const PrintableBarcode: React.FC<PrintableBarcodeProps> = ({
  value,
  type = 'code128',
  label,
  subLabel,
  className = '',
  width = 220,
  height = 56,
  showText = true,
}) => {
  // Deterministic bar pattern generation based on string hash
  const generateBars = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const binaryBars: boolean[] = [];
    // Start guard
    binaryBars.push(true, false, true, false);
    for (let i = 0; i < 48; i++) {
      const bit = ((hash >> (i % 31)) & 1) === 1;
      const bit2 = (str.charCodeAt(i % str.length) + i) % 2 === 0;
      binaryBars.push(bit || bit2);
    }
    // Stop guard
    binaryBars.push(true, true, false, true, false, true);
    return binaryBars;
  };

  if (type === 'qr') {
    // Deterministic 9x9 QR-like matrix
    const matrixSize = 11;
    const cells: boolean[][] = [];
    let seed = 0;
    for (let i = 0; i < value.length; i++) seed += value.charCodeAt(i) * (i + 1);

    for (let r = 0; r < matrixSize; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < matrixSize; c++) {
        // Corner alignment patterns
        if (
          (r < 3 && c < 3) ||
          (r < 3 && c >= matrixSize - 3) ||
          (r >= matrixSize - 3 && c < 3)
        ) {
          const isEdge =
            r === 0 ||
            r === 2 ||
            c === 0 ||
            c === 2 ||
            r === matrixSize - 1 ||
            r === matrixSize - 3 ||
            c === matrixSize - 1 ||
            c === matrixSize - 3;
          row.push(isEdge);
        } else {
          const isBlack = (seed * (r + 1) * (c + 1) + (r ^ c)) % 3 !== 0;
          row.push(isBlack);
        }
      }
      cells.push(row);
    }

    const qrSize = Math.min(width, height);
    const cellSize = qrSize / matrixSize;

    return (
      <div className={`inline-flex flex-col items-center justify-center p-2 bg-white rounded border border-slate-200 ${className}`}>
        {label && <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">{label}</div>}
        <svg width={qrSize} height={qrSize} viewBox={`0 0 ${qrSize} ${qrSize}`} className="shape-rendering-crispEdges">
          {cells.map((row, rIdx) =>
            row.map((filled, cIdx) =>
              filled ? (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx * cellSize}
                  y={rIdx * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#111827"
                />
              ) : null
            )
          )}
        </svg>
        {showText && <div className="text-[9px] font-mono text-slate-600 mt-1">{value}</div>}
        {subLabel && <div className="text-[9px] text-slate-500">{subLabel}</div>}
      </div>
    );
  }

  const bars = generateBars(value);
  const barWidth = width / bars.length;

  return (
    <div className={`inline-flex flex-col items-center justify-center p-2 bg-white rounded border border-slate-200 ${className}`}>
      {label && <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">{label}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shape-rendering-crispEdges">
        {bars.map((isBlack, idx) =>
          isBlack ? (
            <rect
              key={idx}
              x={idx * barWidth}
              y={0}
              width={barWidth * 0.9}
              height={height}
              fill="#111827"
            />
          ) : null
        )}
      </svg>
      {showText && (
        <div className="text-[10px] font-mono font-medium text-slate-700 tracking-widest mt-1">
          {value}
        </div>
      )}
      {subLabel && <div className="text-[9px] text-slate-500 font-medium">{subLabel}</div>}
    </div>
  );
};
