export const sectorData = {
  'Residential': { multiplier: 1.0, color: 'text-blue-600' },
  'Aged Care': { multiplier: 1.25, color: 'text-red-600' },
  'New Build': { multiplier: 0.85, color: 'text-green-600' },
  'Heritage': { multiplier: 1.6, color: 'text-amber-600' },
  'Boutique Studio': { multiplier: 1.4, color: 'text-purple-600' },
  'Pre-sale': { multiplier: 0.9, color: 'text-slate-600' },
  'Commercial': { multiplier: 1.2, color: 'text-cyan-600' },
  'Touch-ups': { multiplier: 1.1, color: 'text-pink-600' }
};

export const serviceRates = {
  // Interior
  'Walls': { rate: 45, desc: 'Premium Low Sheen' },
  'Ceilings': { rate: 35, desc: 'Flat Ceiling White' },
  'Trims': { rate: 25, desc: 'Semi-Gloss Enamel' },
  'Cabinets': { rate: 120, desc: 'Specialized Satin Finish' },
  'FeatureWall': { rate: 65, desc: 'Bold/Textured Accents' },
  // Exterior
  'Facade': { rate: 55, desc: 'Weatherproof Membrane' },
  'Eaves': { rate: 30, desc: 'Exterior Protection' },
  'Fascia': { rate: 35, desc: 'UV Resistant Gloss' },
  'Deck': { rate: 45, desc: 'Oiling/Staining' },
  'Roof': { rate: 85, desc: 'Restoration & Seal' },
  // Prep
  'Sanding': { rate: 15, desc: 'Industrial Grade Prep' },
  'Plaster Repair': { rate: 65, desc: 'Crack & Hole Patching' },
  'Timber Rot': { rate: 95, desc: 'Structural Restoration' },
  'Pressure Wash': { rate: 10, desc: 'High Pressure Clean' }
};

export const pricingData = {
  laborDay: 580,
  margin: 1.35,
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
