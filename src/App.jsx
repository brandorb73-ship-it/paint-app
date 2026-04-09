import React, { useState } from 'react';
import { 
  FileText, Plus, HelpCircle, Trash2, Settings2, Users, MapPin, Paintbrush, Home, Ruler
} from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { sectorData, serviceCatalog, pricingData, calculateLineItem } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: 'Rav', address: 'Fitzroy', sector: 'Residential' });
  const [setup, setSetup] = useState({ rooms: 4, coats: 2, painters: 2, days: 3, brand: 'Dulux Wash & Wear' });
  const [selectedServices, setSelectedServices] = useState({ 'Walls': true, 'Sanding': true });
  const [customItems, setCustomItems] = useState([]);

  // Calculate Site Area based on rooms (15sqm per room default)
  const totalSiteArea = setup.rooms * 15;

  const activeItems = Object.entries(serviceCatalog).flatMap(([group, services]) => 
    Object.keys(services).filter(s => selectedServices[s]).map(s => ({
      id: s,
      service: s,
      desc: services[s].desc,
      qty: totalSiteArea,
      rate: services[s].rate
    }))
  ).concat(customItems);

  const sector = sectorData[client.sector];
  const internalLaborCost = setup.painters * setup.days * pricingData.laborDay;
  const subtotal = activeItems.reduce((sum, item) => sum + calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total, 0);
  const total = subtotal * 1.1;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59); // Dark navy header
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RAV PROPERTY PROJECTS", 14, 25);
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`CLIENT: ${client.name}`, 14, 50);
    doc.text(`ADDRESS: ${client.address}`, 14, 55);
    doc.text(`TOTAL SITE AREA: ${totalSiteArea} sqm`, 14, 60);

    doc.autoTable({
      startY: 70,
      head: [['Service', 'Description', 'Qty', 'Amount']],
      body: activeItems.map(it => [
        it.service, it.desc, `${it.qty} sqm`, 
        `$${calculateLineItem(it.qty, it.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total.toFixed(2)}`
      ]),
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.text(`TOTAL INC GST: $${total.toLocaleString()}`, 14, doc.lastAutoTable.finalY + 15);
    doc.save(`Rav_Quote_${client.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-900">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 1. CLIENT DETAILS */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><MapPin size={16}/> Client Details</h2>
              <div className="space-y-3">
                <input className="w-full p-2 border rounded-lg bg-slate-50" value={client.name} onChange={e => setClient({...client, name: e.target.value})} placeholder="Client Name" />
                <input className="w-full p-2 border rounded-lg bg-slate-50" value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Project Address" />
              </div>
            </div>

            {/* 2. CONFIGURATION */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Settings2 size={16}/> Configuration</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Home size={10}/> Rooms</label>
                  <input type="number" className="w-full p-2 bg-slate-50 border rounded-lg" value={setup.rooms} onChange={e => setSetup({...setup, rooms: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Paintbrush size={10}/> Coats</label>
                  <input type="number" className="w-full p-2 bg-slate-50 border rounded-lg" value={setup.coats} onChange={e => setSetup({...setup, coats: Number(e.target.value)})} />
                </div>
                <select className="col-span-2 p-2 bg-slate-50 border rounded-lg font-bold" value={setup.brand} onChange={e => setSetup({...setup, brand: e.target.value})}>
                  {Object.keys(pricingData.brands).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 3. SITE AREA DISPLAY */}
          <div className="bg-blue-600 p-5 rounded-2xl text-white flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-xl"><Ruler size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Site Area</p>
                <p className="text-3xl font-black">{totalSiteArea} sqm</p>
              </div>
            </div>
          </div>

          {/* 4. SERVICE CATALOG */}
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(serviceCatalog).map(([group, services]) => (
              <div key={group} className="bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">{group}</h3>
                {Object.keys(services).map(s => (
                  <label key={s} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition">
                    <span className="text-sm font-bold text-slate-700">{s}</span>
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600" checked={!!selectedServices[s]} onChange={() => setSelectedServices({...selectedServices, [s]: !selectedServices[s]})} />
                  </label>
                ))}
              </div>
            ))}
          </div>

          {/* 5. ITEM TABLE */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                <tr><th className="p-4">Service Item</th><th className="p-4 w-24 text-center">Qty(sqm)</th><th className="p-4 w-32">Amount</th><th className="p-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeItems.map(item => {
                  const calc = calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4"><span className="font-bold text-sm block">{item.service}</span><span className="text-[10px] text-slate-400">{item.desc}</span></td>
                      <td className="p-4 text-center">
                        <input type="number" className="w-20 text-center border rounded p-1.5 text-sm bg-white" value={item.qty} onChange={e => {
                          const val = Number(e.target.value);
                          if (customItems.find(c => c.id === item.id)) {
                             setCustomItems(customItems.map(c => c.id === item.id ? {...c, qty: val} : c));
                          }
                        }} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 group relative">
                          <span className="font-mono font-bold text-blue-600 text-lg">${calc.total.toFixed(0)}</span>
                          <HelpCircle size={14} className="text-slate-300 cursor-help" />
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-3 w-64 p-4 bg-slate-800 text-white text-[10px] rounded-xl shadow-2xl z-50">{calc.formula}</div>
                        </div>
                      </td>
                      <td className="p-4">{customItems.find(c => c.id === item.id) && <button onClick={() => setCustomItems(customItems.filter(c => c.id !== item.id))}><Trash2 size={18} className="text-red-400"/></button>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={() => setCustomItems([...customItems, {id: Date.now(), service: 'Specialist Detail', desc: 'Manual Entry', qty: 10, rate: 60}])} className="w-full p-4 text-blue-600 font-black text-xs uppercase hover:bg-blue-50 transition flex items-center justify-center gap-2 border-t">
              <Plus size={16}/> Add Custom Specialist Work
            </button>
          </div>
        </div>

        {/* 6. BI SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-10 border-t-8 border-blue-600">
            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-6">Internal Margin Analysis</h3>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Gross Profit Est.</p>
            <p className="text-4xl font-black text-green-400 mb-8">${(subtotal - internalLaborCost).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <div className="bg-slate-800 p-6 rounded-2xl mb-6 border border-slate-700">
               <p className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest">Client Quote Total</p>
               <p className="text-5xl font-black leading-none tracking-tighter">${total.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <button onClick={generatePDF} className="w-full bg-blue-600 p-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-500 transition shadow-lg transform active:scale-95">
               <FileText size={20}/> Generate PDF Quote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
