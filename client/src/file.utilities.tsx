/**
 * KB to bytes conversion
 * @param kb number to convert
 * @returns kb converted to bytes with fixed 2 precision
 */
export const kbToByte = (kb: number): number => {
  return Number((kb * Math.pow(1024, 1)).toFixed(2));
};
/**
 * Bytes to KB conversion
 * @param bytes number to convert
 * @returns bytes converted to kb with fixed 2 precision
 */
export const bytesToKb = (bytes: number): number => {
  return Number((bytes / Math.pow(1024, 1)).toFixed(2));
};
