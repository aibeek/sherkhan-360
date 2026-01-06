export function calculateTotalEfficiency(
  workEfficiency: number,
  braceletEfficiency: number
): number {
  return Number((workEfficiency * braceletEfficiency).toFixed(2));
}
