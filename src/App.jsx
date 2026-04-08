import React, { useState } from 'react';
import { Calculator, User, ClipboardList, Info, ChevronRight } from 'lucide-react';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: '', address: '' });
  const [dim, setDim] = useState({ length: 4, width: 3, height: 2.7 });
  const [coats, setCoats] = useState(2);

  // --- MELBOURNE MARKET CALCULATIONS ---
  const wallArea = (dim.length * dim.height * 2) + (dim.width * dim.height * 2);
  const ceilingArea = dim.length * dim.width;
  
  // Material coverage: ~15sqm per Litre (standard for premium low-sheen)
  const wallPaintNeeded = Math.ceil((wallArea * coats) / 15);
  const ceilingPaintNeeded = Math.ceil((ceilingArea * 2) / 14); // Ceilings usually need 2 coats

  // Costs
  const paintPricePerL = 22; // Average price for trade-quality 15L drums
  const materialCost = (wallPaintNeeded + ceilingPaintNeeded) * paintPricePerL + 50; // +$50 for consumables (tape, plastic)
  const laborRate = 45; // Professional Melb rate per sqm
  const laborCost = (wallArea + ceilingArea) * laborRate;
  
  const totalQuote = laborCost + materialCost;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 text-slate-900 font-sans">
      <header className="max-w-5xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          RAV Property <span className="text-blue-600">Projects</span>
        </h1>
        <div className="flex items-center gap-2 text-slate-500 mt-2 font-medium">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs uppercase tracking-widest">Premium Service</span>
          <span>• Melbourne, VIC</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <User className="text-blue-600" size={20} />
              <h2 className="font-bold text-lg text-slate-800">Project Context</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Client Name" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" 
                onChange={(e) => setClient({...client, name: e.target.value})} />
              <input type="text" placeholder="Site (e.g. Fitzroy, Vic)" className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 ring-blue-500/20" 
                onChange={(e) => setClient({...client, address: e.target.value})} />
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <Calculator className="text-blue-600" size={20} />
              <h2 className="font-bold text-lg text-slate-800">Room Measurement</h2>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Length (m)</label>
                <input type="number" value={dim.length} className="w-full p-3 bg-slate-50 border rounded-xl" 
                  onChange={(e) => setDim({...dim, length: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Width (m)</label>
                <input type="number" value={dim.width} className="w-full p-3 bg-slate-50 border rounded-xl" 
                  onChange={(e) => setDim({...dim, width: Number(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Height (m)</label>
                <input type="number" value={dim.height} className="w-full p-3 bg-slate-50 border rounded-xl" 
                  onChange={(e) => setDim({...dim, height: Number(e.target.value)})} />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: THE LIVE QUOTE CARD */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl sticky top-8">
            <p className="text-slate-400 font-medium mb-1">Estimated Total</p>
            <h2 className="text-5xl font-bold mb-6">${totalQuote.toLocaleString()}</h2>
            
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Labour Cost</span>
                <span className="font-semibold">${laborCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Materials & Paint</span>
                <span className="font-semibold">${materialCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-slate-700">
                <span className="text-blue-400 font-bold uppercase tracking-tight">Supplies Required</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase">Wall Paint</p>
                  <p className="text-lg font-bold">{wallPaintNeeded}L</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-[10px] text-slate-400 uppercase">Ceiling</p>
                  <p className="text-lg font-bold">{ceilingPaintNeeded}L</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-8 bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 group">
              Generate Final PDF <ChevronRight size={18} className="group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
