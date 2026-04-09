export const pricingData = {
  brands: {
    'Dulux Premium': 28.50,
    'Haymes Elite': 26.20,
    'Wattyl ID': 22.10,
    'Taubmans Endure': 24.80
  },
  baseRates: {
    'Interior Walls': 45,
    'Ceilings': 35,
    'Heritage Restoration': 95,
    'Pre-Sale Refresh': 38,
    'Touch-ups': 65, // Higher hourly/sqm for small jobs
    'Kitchen Cabinets': 120,
    'Trims/Skirtings': 25,
    'Eaves/Fascias': 32
  },
  laborMarkup: 1.35 // 35% margin to cover overheads & profit
};

export function calculateLineItem(qty, baseRate, brandPrice, coats) {
  const materialCost = (qty / 14) * coats * brandPrice; // 14sqm per L coverage
  const laborCost = qty * baseRate;
  const subtotal = (materialCost + laborCost) * pricingData.laborMarkup;
  
  return {
    total: subtotal,
    formula: `(${qty}sqm × $${baseRate} labor) + (${coats} coats material at $${brandPrice}/L) + 35% Margin`
  };
}
