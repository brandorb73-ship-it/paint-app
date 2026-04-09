import React, { useState } from 'react';
import { 
  FileText, Plus, HelpCircle, Trash2, Settings2, Users, MapPin, Paintbrush, Building2, Layers 
} from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { sectorData, serviceCatalog, pricingData, calculateLineItem } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: 'Rav', address: 'Fitzroy', sector: 'Residential' });
  const [setup, setSetup] = useState({ rooms: 1, coats: 2, painters: 2, days: 3, brand: 'Dulux Wash & Wear' });
  const [selectedServices, setSelectedServices] = useState({ 'Walls': true, 'Sanding': true });
  const [customItems, setCustomItems] = useState([]);

  const activeItems = Object.entries(serviceCatalog).flatMap(([group, services]) => 
    Object.keys(services).filter(s => selectedServices[s]).map(s => ({
      id: s,
      service: s,
      desc: services[s].desc,
      qty: setup.rooms * 15,
      rate: services[s].rate
    }))
  ).concat(customItems);

  const sector = sectorData[client.sector];
  const internalLaborCost = setup.painters * setup.days * pricingData.laborDay;
  const subtotal = activeItems.reduce((sum, item) => sum + calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total, 0);
  const total = subtotal * 1.1;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("RAV PROPERTY PROJECTS - QUOTE", 14, 20);
    doc.autoTable({
      startY: 40,
      head: [['Service', 'Description', 'Qty/Sqm', 'Amount']],
      body: activeItems.map(it => [it.service, it.desc, `${it.qty} sqm`, `$${calculateLineItem(it.qty, it.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total.toFixed(2)}`]),
    });
    doc.save(`Quote_${client.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          
          {/* CLIENT & SETUP RESTORED */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><MapPin size={16}/> Client Details</h2>
              <div className="space-y-3">
                <input className="w-full p-2 border rounded-lg" value={client.name} onChange={e => setClient({...client, name: e.target.value})} placeholder="Name" />
                <input className="w-full p-2 border rounded-lg" value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Address" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Settings2 size={16}/> Configuration</h2>
              <div className="grid grid-cols-2 gap-3">
                <select className="p-2 bg-slate-50 border rounded-lg" value={client.sector} onChange={e => setClient({...client, sector: e.target.value})}>
                  {Object.keys(sectorData).map(s => <option key={s}>{s}</option>)}
                </select>
                <select className="p-2 bg-slate-50 border rounded-lg" value={setup.brand} onChange={e => setSetup({...setup, brand: e.target.value})}>
                  {Object.keys(pricingData.brands).map(b => <option key={b}>{b}</option>)}
                </select>
                <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
                  <Users size={16} className="text-blue-600"/><input type="number" className="bg-transparent font-bold w-full" value={setup.painters} onChange={e => setSetup({...setup, painters: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>

          {/* SERVICE CATALOG RESTORED */}
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(serviceCatalog).map(([group, services]) => (
              <div key={group} className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase mb-4">{group}</h3>
                {Object.keys(services).map(s => (
                  <label key={s} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <span className="text-sm font-bold">{s}</span>
                    <input type="checkbox" checked={!!selectedServices[s]} onChange={() => setSelectedServices({...selectedServices, [s]: !selectedServices[s]})} />
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* TABLE & CUSTOM ITEMS RESTORED */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-[10px] uppercase">
                <tr><th className="p-4">Service</th><th className="p-4 w-24">Qty</th><th className="p-4 w-32">Amount</th><th className="p-4"></th></tr>
              </thead>
              <tbody className="divide-y">
                {activeItems.map(item => {
                  const calc = calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier);
                  return (
                    <tr key={item.id}>
                      <td className="p-4 font-bold text-sm">{item.service} <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div></td>
                      <td className="p-4"><input type="number" className="w-full border rounded p-1 text-sm" value={item.qty} onChange={e => {
                        if (customItems.find(c => c.id === item.id)) {
                          setCustomItems(customItems.map(c => c.id === item.id ? {...c, qty: Number(e.target.value)} : c));
                        }
                      }} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 group relative">
                          <span className="font-mono font-bold text-blue-600">${calc.total.toFixed(0)}</span>
                          <HelpCircle size={14} className="text-slate-300 cursor-help" />
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50">{calc.formula}</div>
                        </div>
                      </td>
                      <td className="p-4">{customItems.find(c => c.id === item.id) && <button onClick={() => setCustomItems(customItems.filter(c => c.id !== item.id))}><Trash2 size={16} className="text-red-400"/></button>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={() => setCustomItems([...customItems, {id: Date.now(), service: 'Custom Work', desc: 'Manual Entry', qty: 10, rate: 50}])} className="w-full p-4 text-blue-600 font-bold text-xs uppercase hover:bg-slate-50 border-t flex items-center justify-center gap-2">
              <Plus size={16}/> Add Custom Specialist Item
            </button>
          </div>
        </div>

        {/* SIDEBAR BI RESTORED */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-10 border-t-8 border-blue-600">
            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-6">Internal Profit Est.</h3>
            <p className="text-4xl font-black text-green-400 mb-8">${(subtotal - internalLaborCost).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <div className="bg-slate-800 p-6 rounded-2xl mb-6 border border-slate-700">
               <p className="text-xs text-slate-400 mb-1 uppercase font-bold tracking-widest">Client Quote</p>
               <p className="text-5xl font-black leading-none">${total.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <button onClick={generatePDF} className="w-full bg-blue-600 p-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-500 transition shadow-lg">
               <FileText size={20}/> Generate PDF Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
