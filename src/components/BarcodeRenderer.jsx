import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

export default function BarcodeRenderer({
  type = 'CODE128',
  value = '123456789',
  showText = true,
  height = 36,
  color = '#000000',
  backgroundColor = 'transparent',
  className = ''
}) {
  const safeValue = value ? String(value).trim() : '123456789';

  if (type === 'QR') {
    const size = Math.max(48, Math.floor(height * 1.6));
    return (
      <div className={`flex flex-col items-center justify-center select-none ${className}`}>
        <div style={{ background: backgroundColor === 'transparent' ? 'white' : backgroundColor, padding: '2px', borderRadius: '2px' }}>
          <QRCodeSVG
            value={safeValue}
            size={size}
            fgColor={color}
            bgColor={backgroundColor === 'transparent' ? '#FFFFFF' : backgroundColor}
            level="M"
          />
        </div>
        {showText && (
          <span className="text-[9px] font-mono tracking-tight text-gray-700 mt-1 truncate max-w-[140px]">
            {safeValue}
          </span>
        )}
      </div>
    );
  }

  // Determine appropriate barcode format for react-barcode
  // UPCA requires exactly 12 numeric digits. EAN13 requires exactly 12 or 13 numeric digits.
  // If the string doesn't match these strict specifications, fallback to CODE128 automatically so it never fails!
  let format = 'CODE128';
  const isNumericOnly = /^\d+$/.test(safeValue);
  
  if (type === 'UPCA' && isNumericOnly && safeValue.length === 12) {
    format = 'UPC';
  } else if (type === 'EAN13' && isNumericOnly && (safeValue.length === 12 || safeValue.length === 13)) {
    format = 'EAN13';
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none overflow-hidden max-w-full ${className}`}>
      <Barcode
        value={safeValue}
        format={format}
        width={1.5}
        height={Number(height) || 36}
        displayValue={showText}
        fontSize={11}
        font="monospace"
        margin={0}
        background={backgroundColor}
        lineColor={color}
      />
    </div>
  );
}
