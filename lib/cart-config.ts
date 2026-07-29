export const CART_CONFIG = {
  deliveryFee: 5000,
  freeDeliveryThreshold: 50000,
  currency: "TZS"
};

export const PAYMENT_INFO = {
  mpesaNumber: "+255 769752523",
  mpesaName: "dotto mtundu",
  tigopesaNumber: "+255 705669903",
  tigopesaName: "dotto mtundu"
};

export function formatTZS(amount: number): string {
  const safeAmount = amount ?? 0;
  return `${CART_CONFIG.currency} ${safeAmount.toLocaleString("en-US")}`;
}
