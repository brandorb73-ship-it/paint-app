export const pricingData = {
  laborDay: 580, 
  margin: 1.35,
  brands: {
    'Dulux Premium': 28,
    'Haymes Elite': 26,
    'Wattyl ID': 22,
    'Taubmans Endure': 24
  },
  rates: {
    interior: 45, exterior: 55, heritage: 85, cabinets: 120, 
    touchups: 35, presale: 38, eaves: 25, deck: 40
  }
};

export const calculateService = (type, qty, rate, brandPrice, coats) => {
  const materialSub = (qty / 14) * coats * brandPrice;
  const laborSub = qty * rate;
  const total = (materialSub + laborSub) * pricingData.margin;
  return {
    label: `Math: (${qty}sqm × $${rate}) + (${coats} coats material) + 35% Margin`,
    amount: total
  };
};
