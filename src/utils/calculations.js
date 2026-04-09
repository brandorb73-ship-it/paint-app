export const sectorData = {
  'Residential': { multiplier: 1.0, color: 'text-blue-600' },
  'Aged Care': { multiplier: 1.25, color: 'text-red-600' },
  'New Build': { multiplier: 0.85, color: 'text-green-600' },
  'Heritage': { multiplier: 1.6, color: 'text-amber-600' },
  'Boutique Studio': { multiplier: 1.4, color: 'text-purple-600' },
  'Pre-sale': { multiplier: 0.9, color: 'text-slate-600' },
  'Commercial': { multiplier: 1.2, color: 'text-cyan-600' }
};

export const serviceCatalog = {
  Interior: {
    'Walls': { rate: 45, desc: 'Premium Low Sheen' },
    'Ceilings': { rate: 35, desc: 'Flat White' },
    'Trims': { rate: 25, desc: 'Semi-Gloss Enamel' },
    'Cabinets': { rate: 120, desc: 'Satin Finish' }
  },
  Exterior: {
    'Facade': { rate: 55, desc: 'Weatherproof' },
    'Eaves': { rate: 30, desc: 'Exterior Protect' },
    'Fascia': { rate: 35, desc: 'UV Gloss' }
  },
  Prep: {
    'Sanding': { rate: 15, desc: 'Industrial Grade' },
    'Plaster Repair': { rate: 65, desc: 'Crack Patching' },
    'Timber Rot': { rate: 95, desc: 'Structural' }
  }
};

export const pricingData = {
  laborDay: 580,
  margin: 1.35,
  brands: {
    'Dulux Wash & Wear': 28.50,
    'Haymes Elite': 26.20,
    'Berger Premium': 21.50,
    'Wattyl ID': 22.10
  }
};

export function calculateLineItem(qty, baseRate, brandPrice, coats, sectorMultiplier) {
  const materialCost = (qty / 14) * coats * brandPrice; 
  const laborCost = qty * baseRate * sectorMultiplier;
  const total = (materialCost + laborCost) * pricingData.margin;
  return {
    total,
    formula: `(${qty}sqm × $${baseRate} labor × ${sectorMultiplier}x Sector) + (${coats} coats material @ $${brandPrice}/L) + 35% Margin`
  };
}
