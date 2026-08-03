// Code 128 (Table B) encoding table definition
const CODE128B_PATTERNS = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

// Encodes text to Code 128 bars pattern string
export function encodeCode128(text) {
  if (!text) text = "123456789";
  const startCode = 104; // Start Code B
  let checksum = startCode;
  const patternCodes = [startCode];

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 95) {
      patternCodes.push(code);
      checksum += code * (i + 1);
    }
  }

  const checkSymbol = checksum % 103;
  patternCodes.push(checkSymbol);
  patternCodes.push(106); // Stop Code

  let bitPattern = "";
  patternCodes.forEach((code) => {
    const pat = CODE128B_PATTERNS[code];
    if (pat) {
      for (let j = 0; j < pat.length; j++) {
        const count = parseInt(pat[j], 10);
        const isBar = j % 2 === 0;
        bitPattern += (isBar ? "1" : "0").repeat(count);
      }
    }
  });

  return bitPattern;
}

// Generate simple SVG path for QR Code simulation / matrix
export function generateQRMatrix(text) {
  // Simple deterministic 21x21 QR Code matrix mockup based on string hash
  const size = 21;
  const matrix = Array(size).fill(0).map(() => Array(size).fill(false));

  // Helper for finder patterns
  const drawFinder = (row, col) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[row + r][col + c] = true;
        }
      }
    }
  };

  // Draw 3 corner finders
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // Hash text to fill rest of grid deterministically
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders or timing
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c > size - 9;
      const isBottomLeft = r > size - 9 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isTiming) {
        const val = Math.abs(Math.sin((r * size + c + hash) * 12.9898) * 43758.5453);
        matrix[r][c] = (val % 1) > 0.48;
      }
    }
  }

  return { matrix, size };
}
