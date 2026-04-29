export function loopIndex(current: number, delta: number, total: number) {
  if (total <= 0) return 0;
  const next = (current + delta) % total;
  return next < 0 ? next + total : next;
}
