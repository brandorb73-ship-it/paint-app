export const sectorData = {
  'Residential': { multiplier: 1.0, color: 'text-blue-600' },
  'Aged Care': { multiplier: 1.25, color: 'text-red-600' }, // High compliance/After-hours
  'New Build': { multiplier: 0.85, color: 'text-green-600' }, // Efficiency of empty space
  'Heritage': { multiplier: 1.6, color: 'text-amber-600' }, // High detail/Restoration
  'Boutique Studio': { multiplier: 1.4, color: 'text-purple-600' }, // Precision masking
  'Pre-sale': { multiplier: 0.9, color: 'text-slate-600' }, // Speed/Refresh focus
  'Commercial': { multiplier: 1.2, color: 'text-cyan-600' },
  'Touch-ups': { multiplier: 1.1, color: 'text-pink-600' }
};

export const pricingData = {
  laborDay: 580, // Internal cost per painter
  margin: 1.35,  // 35% markup for RAV Property
  brands: {
    'Dulux Wash & Wear': 28.50,
    'Haymes Expressions': 26.20,
    'Wattyl ID': 22.10,
    'Taubmans Endure': 24.80
  }
};

export function calculateLineItem(qty, baseRate, brandPrice, coats, sectorMultiplier) {
  const materialCost = (qty / 14) * coats * brandPrice; 
  const laborCost = qty * baseRate * sectorMultiplier;
  const subtotal = (materialCost + laborCost) * pricingData.margin;
  
  return {
    total: subtotal,
    formula: `(${qty}sqm × $${baseRate} labor × ${sectorMultiplier}x Sector) + (${coats} coats material at $${brandPrice}/L) + 35% Margin`
  };
}
