export function getDiscountedPrice(price: number, discountPercent: number): number {
  return discountPercent > 0
    ? Math.floor((price * (100 - discountPercent)) / 100 + 0.5)
    : price;
}
