/**
 * Generate a Unicode bar chart visualization
 * Inspired by https://github.com/matchai/waka-box
 *
 * @param percent - The percentage value (0-100)
 * @param size - The size of the bar in characters
 * @returns A string representing the bar chart
 */
export default function generateBarChart(percent: number, size: number): string {
  if (percent < 0 || percent > 100) {
    throw new Error(`Percent must be between 0 and 100, got ${percent}`);
  }
  if (size < 1) {
    throw new Error(`Size must be at least 1, got ${size}`);
  }

  const syms = '░▏▎▍▌▋▊▉█';
  const frac = Math.floor((size * 8 * percent) / 100);
  const barsFull = Math.floor(frac / 8);

  if (barsFull >= size) {
    return syms.substring(8, 9).repeat(size);
  }

  const semi = frac % 8;
  return [syms.substring(8, 9).repeat(barsFull), syms.substring(semi, semi + 1)]
    .join('')
    .padEnd(size, syms.substring(0, 1));
}
