// Shared shipping-cost calculator (weight slabs) used by Cart.jsx and Checkout.jsx.

export function itemUnitWeightKg(item) {
  const source = `${item?.name || ""} ${item?.id || ""}`;
  const kgMatch = source.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
  if (kgMatch) return Number(kgMatch[1]);

  const gMatch = source.match(/(\d+(?:\.\d+)?)\s*g\b/i);
  if (gMatch) return Number(gMatch[1]) / 1000;

  return 0;
}

export function cartTotalWeightKg(items) {
  const total = (items || []).reduce((sum, item) => {
    const unitKg = itemUnitWeightKg(item);
    return sum + unitKg * (item.quantity || 0);
  }, 0);

  return Number(total.toFixed(3));
}

export function calcShippingByWeight(totalWeightKg) {
  const slabCharge = (kg) => {
    if (kg <= 0) return 0;
    if (kg <= 2) return 80;
    if (kg <= 5) return 150;
    if (kg <= 7) return 230;
    if (kg <= 8) return 300;
    return 380; // 9–12 kg
  };

  const roundedKg = Math.ceil(totalWeightKg);
  const full12KgBlocks = Math.floor(roundedKg / 12);
  const remainderKg = roundedKg % 12;

  return (full12KgBlocks * 380) + slabCharge(remainderKg);
}
