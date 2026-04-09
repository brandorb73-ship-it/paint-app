import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, HelpCircle, Trash2, Building2, 
  Users, Paintbrush, MapPin, Layers, CheckSquare, Settings2 
} from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { sectorData, pricingData, serviceRates, calculateLineItem } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: 'Rav', address: 'Fitzroy', sector: 'Residential' });
  const [setup, setSetup] = useState({ rooms: 1, coats: 2, painters: 2, days: 3, brand: 'Dulux Wash & Wear' });
  const [selectedServices, setSelectedServices] = useState({ Walls: true, Sanding: true });
  const [customItems, setCustomItems] = useState([]);

  // Auto-generate line items based on checkboxes
  const getActiveItems = () => {
    const baseItems = Object.keys(selectedServices)
      .filter(key => selectedServices[key])
      .map(key => ({
        id: key,
        service: key,
        desc: serviceRates[key].desc,
        qty: setup.rooms * 15, // Estimate 15sqm per room per service
        rate: serviceRates[key].rate
      }));
    return [...baseItems, ...customItems];
  };

  const activeItems = getActiveItems();
  const sector = sectorData[client.sector] || sectorData['Residential'];
  const internalLaborCost = setup.painters * setup.days * pricingData.laborDay;

  const subtotal = activeItems.reduce((sum, item) => {
    return sum + calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total;
  }, 0);
  
  const total = subtotal * 1.1; // Total including GST

  const toggleService = (id) => {
    setSelectedServices(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN: SELECTION TOOLS */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. Project Setup */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Settings2 size={18} className="text-blue-600"/> Project Configuration
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Sector Selection</label>
                <select className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold" value={client.sector} onChange={(e) => setClient({...client, sector: e.target.value})}>
                  {Object.keys(sectorData).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rooms</label>
                <input type="number" className="w-full p-2 border rounded-xl bg-slate-50" value={setup.rooms} onChange={(e) => setSetup({...setup, rooms: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Coats</label>
                <input type="number" className="w-full p-2 border rounded-xl bg-slate-50" value={setup.coats} onChange={(e) => setSetup({...setup, coats: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Staffing</label>
                <div className="flex items-center gap-1 p-2 bg-blue-50 border border-blue-100 rounded-xl">
                  <Users size={14} className="text-blue-600"/>
                  <input type="number" className="w-full bg-transparent font-bold text-blue-700 outline-none" value={setup.painters} onChange={(e) => setSetup({...setup, painters: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Service Catalog (RESTORED FROM SCREENSHOTS) */}
          <div className="grid md:grid-cols-3 gap-6">
            <ServiceGroup title="Interior" icon={<Paintbrush className="text-blue-600"/>} services={['Walls', 'Ceilings', 'Trims', 'Cabinets', 'FeatureWall']} selected={selectedServices} onToggle={toggleService} />
            <ServiceGroup title="Exterior" icon={<Building2 className="text-green-600"/>} services={['Facade', 'Eaves', 'Fascia', 'Deck', 'Roof']} selected={selectedServices} onToggle={toggleService} />
            <ServiceGroup title="Prep & Repair" icon={<Layers className="text-orange-600"/>} services={['Sanding', 'Plaster Repair', 'Timber Rot', 'Pressure Wash']} selected={selectedServices} onToggle={toggleService} />
          </div>

          {/* 3. Detailed Quote Table (WITH MANUAL ENTRY) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-[10px] uppercase font-black">Service</th>
                  <th className="p-4 text-[10px] uppercase font-black">Description</th>
                  <th className="p-4 text-[10px] uppercase font-black w-24">Qty (sqm)</th>
                  <th className="p-4 text-[10px] uppercase font-black w-32">Total AUD</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeItems.map(item => {
                  const calc = calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-sm">{item.service}</td>
                      <td className="p-4 text-xs text-slate-500">{item.desc}</td>
                      <td className="p-4">
                        <input type="number" className="w-full p-1.5 border rounded bg-white text-sm" value={item.qty} onChange={(e) => {
                          const val = Number(e.target.value);
                          if (customItems.find(c => c.id === item.id)) {
                            setCustomItems(customItems.map(c => c.id === item.id ? {...c, qty: val} : c));
                          }
                        }} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">${calc.total.toFixed(0)}</span>
                          <div className="group relative">
                            <HelpCircle size={14} className="text-slate-300 cursor-help" />
                            <div className="hidden group-hover:block absolute bottom-full left-0 w-64 p-3 bg-slate-800 text-[10px] text-white rounded-xl shadow-2xl mb-2 z-50">
                              {calc.formula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {customItems.find(c => c.id === item.id) && (
                          <button onClick={() => setCustomItems(customItems.filter(c => c.id !== item.id))} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={() => setCustomItems([...customItems, {id: Date.now(), service: 'Custom Work', desc: 'Manual Detail', qty: 10, rate: 50}])} className="w-full p-4 bg-slate-50 text-blue-600 font-black text-xs uppercase tracking-tighter hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2 border-t">
              <Plus size={16} /> Add Custom Specialist Item
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RE-DESIGNED DASHBOARD */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-8 border-t-8 border-blue-600">
            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-6">Internal Audit</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <div>
                   <p className="text-slate-400 text-[10px] font-bold uppercase">Estimated Margin</p>
                   <p className="text-3xl font-black text-green-400">${(subtotal - internalLaborCost).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Sector Impact</p>
                  <p className={`font-black ${sector.color}`}>{sector.multiplier}x</p>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <p className="text-blue-500 font-black text-[10px] uppercase mb-1 tracking-widest">Client Quote Total</p>
                <p className="text-5xl font-black text-white leading-none tracking-tighter">${total.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                <p className="text-slate-500 text-[10px] mt-3 font-bold uppercase tracking-tight">Incl. 10% GST & {setup.brand}</p>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg transition transform active:scale-95 text-sm uppercase tracking-widest">
                <FileText size={20} /> Generate PDF Quote
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Helper Component for Service Groups
function ServiceGroup({ title, icon, services, selected, onToggle }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="space-y-2">
        {services.map(s => (
          <label key={s} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition">
            <span className="text-sm font-bold text-slate-700">{s}</span>
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600" checked={!!selected[s]} onChange={() => onToggle(s)} />
          </label>
        ))}
      </div>
    </div>
  );
}
