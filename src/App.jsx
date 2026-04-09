import React, { useState } from 'react';
import { 
  FileText, Plus, HelpCircle, Trash2, Building2, 
  Users, Paintbrush, MapPin, Layers, Calendar 
} from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { sectorData, pricingData, calculateLineItem } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: 'Rav', address: 'Fitzroy', sector: 'Residential' });
  const [setup, setSetup] = useState({ rooms: 4, coats: 2, painters: 2, days: 3, brand: 'Dulux Wash & Wear' });
  
  // Re-integrated Service List + Custom Entries
  const [items, setItems] = useState([
    { id: 1, service: 'Interior Wall Painting', desc: 'Sanding, 2 coats low-sheen', qty: 37.8, rate: 45 },
    { id: 2, service: 'Ceiling Painting', desc: 'Flat white ceiling finish', qty: 12.0, rate: 35 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), service: '', desc: '', qty: 0, rate: 40 }]);
  };

  const removeItem = (id) => setItems(items.filter(item => item.id !== id));

  const updateItem = (id, field, val) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  // CALCULATIONS
  const sector = sectorData[client.sector] || sectorData['Residential'];
  const internalLaborCost = setup.painters * setup.days * pricingData.laborDay;
  
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total;
  }, 0);
  
  const gst = subtotal * 0.10;
  const total = subtotal + gst;

  // PDF GENERATION
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RAV PROPERTY PROJECTS", 14, 25);
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`ATTN: ${client.name}`, 14, 50);
    doc.text(`SITE: ${client.address}`, 14, 55);
    doc.text(`SECTOR: ${client.sector}`, 14, 60);

    const tableData = items.map(it => [
      it.service,
      it.desc,
      `${it.qty} sqm`,
      `$${calculateLineItem(it.qty, it.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 70,
      head: [['Service Item', 'Description', 'Qty/Size', 'Amount (AUD)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`TOTAL (Incl. GST): $${total.toLocaleString()}`, 140, finalY + 10);
    doc.save(`RAV_Quote_${client.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        
        {/* INPUTS PANEL */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 1. Client & Sector Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={16}/> Client & Sector Details
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <input placeholder="Client Name" className="p-3 bg-slate-50 border rounded-xl" value={client.name} onChange={(e) => setClient({...client, name: e.target.value})} />
              <input placeholder="Site Address" className="p-3 bg-slate-50 border rounded-xl" value={client.address} onChange={(e) => setClient({...client, address: e.target.value})} />
              <select className="p-3 bg-slate-50 border rounded-xl font-bold" value={client.sector} onChange={(e) => setClient({...client, sector: e.target.value})}>
                {Object.keys(sectorData).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* 2. Room & Paint Configuration */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={16}/> Project Essentials
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Rooms</label>
                <input type="number" className="w-full p-2 border rounded-lg bg-slate-50" value={setup.rooms} onChange={(e) => setSetup({...setup, rooms: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Coats</label>
                <input type="number" className="w-full p-2 border rounded-lg bg-slate-50" value={setup.coats} onChange={(e) => setSetup({...setup, coats: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Paint Brand</label>
                <select className="w-full p-2 border rounded-lg bg-slate-50" value={setup.brand} onChange={(e) => setSetup({...setup, brand: e.target.value})}>
                  {Object.keys(pricingData.brands).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Labour (Painters)</label>
                <input type="number" className="w-full p-2 border rounded-lg bg-blue-50 text-blue-700 font-bold" value={setup.painters} onChange={(e) => setSetup({...setup, painters: Number(e.target.value)})} />
              </div>
            </div>
          </div>

          {/* 3. Detailed Scope Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-[10px] uppercase font-bold tracking-wider">Service Item</th>
                  <th className="p-4 text-[10px] uppercase font-bold tracking-wider">Description</th>
                  <th className="p-4 text-[10px] uppercase font-bold tracking-wider w-24">Qty/Sqm</th>
                  <th className="p-4 text-[10px] uppercase font-bold tracking-wider w-32">Amount</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const calc = calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier);
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50 transition">
                      <td className="p-4"><input className="w-full font-bold bg-transparent outline-none" value={item.service} onChange={(e) => updateItem(item.id, 'service', e.target.value)} /></td>
                      <td className="p-4"><input className="w-full text-sm text-slate-500 bg-transparent outline-none" value={item.desc} onChange={(e) => updateItem(item.id, 'desc', e.target.value)} /></td>
                      <td className="p-4"><input type="number" className="w-full p-2 border rounded-lg bg-white" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">${calc.total.toFixed(0)}</span>
                          <div className="group/math relative cursor-help">
                            <HelpCircle size={14} className="text-slate-300" />
                            <div className="hidden group-hover/math:block absolute bottom-full left-0 w-64 p-3 bg-slate-800 text-[10px] leading-relaxed text-white rounded-xl shadow-2xl mb-2 z-50">
                              {calc.formula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><button onClick={() => removeItem(item.id)} className="text-slate-200 hover:text-red-500 transition"><Trash2 size={16}/></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={addItem} className="w-full p-4 text-blue-600 font-bold bg-slate-50 hover:bg-blue-600 hover:text-white flex items-center justify-center gap-2 transition border-t">
              <Plus size={18} /> Add Specialty Service (Heritage / Touch-up / Custom)
            </button>
          </div>
        </div>

        {/* FINANCIAL DASHBOARD */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-8 border-t-8 border-blue-600">
            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-6">Quote Intelligence</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-800 pb-4">
                <div>
                   <p className="text-slate-400 text-[10px] font-bold uppercase">Net Profit Est.</p>
                   <p className="text-2xl font-black text-green-400">${(subtotal - internalLaborCost).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-bold uppercase">Sector Impact</p>
                  <p className={`font-black ${sector.color}`}>{sector.multiplier}x</p>
                </div>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <p className="text-blue-500 font-black text-[10px] uppercase mb-1 tracking-widest">Total Client Quote</p>
                <p className="text-4xl font-black text-white leading-none">${total.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</p>
                <p className="text-slate-500 text-[10px] mt-2 italic font-medium">Includes GST & Premium Materials</p>
              </div>

              <div className="space-y-3">
                <button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg transition transform active:scale-95">
                  <FileText size={20} /> GENERATE PDF PROPOSAL
                </button>
                <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-tight">Approved for Melbourne Market 2026</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
