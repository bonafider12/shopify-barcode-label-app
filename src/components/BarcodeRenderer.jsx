import React from 'react';
import { encodeCode128, generateQRMatrix } from '../utils/barcodeGenerator';

export default function BarcodeRenderer({
  type = 'CODE128',
  value = '123456789',
  showText = true,
  height = 36,
  color = '#000000',
  backgroundColor = 'transparent',
  className = ''
}) {
  if (type === 'QR') {
    const { matrix, size } = generateQRMatrix(value);
    const cellSize = Math.max(2, Math.floor(height / size));
    const svgSize = size * cellSize;

    return (
      <div className={`flex flex-col items-center ${className}`}>
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${size} ${size}`}
          shapeRendering="crispEdges"
          style={{ background: backgroundColor }}
        >
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width={1}
                  height={1}
                  fill={color}
                />
              ) : null
            )
          )}
        </svg>
        {showText && (
          <span className="text-[9px] font-mono tracking-tight text-gray-600 mt-0.5">
            {value}
          </span>
        )}
      </div>
    );
  }

  // Linear Barcode (Code128 / EAN13 / UPCA)
  const bitPattern = encodeCode128(value);
  const barWidth = 1.6;
  const svgWidth = bitPattern.length * barWidth;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        style={{ background: backgroundColor }}
      >
        {bitPattern.split('').map((bit, idx) => {
          if (bit === '1') {
            return (
              <rect
                key={idx}
                x={idx * barWidth}
                y={0}
                width={barWidth}
                height={height}
                fill={color}
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <span className="text-[10px] font-mono font-semibold tracking-wider text-gray-800 mt-0.5 uppercase">
          {value}
        </span>
      )}
    </div>
  );
}
