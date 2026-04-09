import React, { useState } from 'react';
import { FileText, Plus, Info, HelpCircle, Trash2, Building2 } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { pricingData, calculateLineItem } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: '', address: '', date: new Date().toLocaleDateString() });
  const [brand, setBrand] = useState('Dulux Premium');
  const [coats, setCoats] = useState(2);
  const [items, setItems] = useState([
    { id: 1, service: 'Interior Walls', desc: 'Sanding, 2 coats low-sheen', qty: 100, rate: 45 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), service: 'New Service', desc: '', qty: 0, rate: 40 }]);
  };

  const removeItem = (id) => setItems(items.filter(item => item.id !== id));

  const updateItem = (id, field, val) => {
    setItems(items.map(it => it.id === id ? { ...it, [field]: val } : it));
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => {
      return sum + calculateLineItem(item.qty, item.rate, pricingData.brands[brand], coats).total;
    }, 0);
  };

  const subtotal = calculateGrandTotal();
  const gst = subtotal * 0.10;
  const total = subtotal + gst;

  const generatePDF = () => {
    const doc = new jsPDF();
    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RAV PROPERTY PROJECTS", 14, 25);
    
    // Client Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`ATTN: ${client.name}`, 14, 50);
    doc.text(`SITE: ${client.address}`, 14, 55);
    doc.text(`DATE: ${client.date}`, 160, 50);

    const tableData = items.map(it => [
      it.service,
      it.desc,
      `${it.qty} sqm`,
      `$${calculateLineItem(it.qty, it.rate, pricingData.brands[brand], coats).total.toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 65,
      head: [['Service', 'Description', 'Qty/Sqm', 'Amount (AUD)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${subtotal.toLocaleString()}`, 140, finalY);
    doc.text(`GST: $${gst.toLocaleString()}`, 140, finalY + 7);
    doc.setFontSize(14);
    doc.text(`TOTAL: $${total.toLocaleString()}`, 140, finalY + 16);

    doc.save(`RAV_Quote_${client.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-10">
        
        {/* CONFIGURATION & SCOPE */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Building2 className="text-blue-600"/> Project Essentials</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Paint System</label>
                <select className="w-full mt-1 p-3 border rounded-xl bg-slate-50" value={brand} onChange={(e) => setBrand(e.target.value)}>
                  {Object.keys(pricingData.brands).map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Number of Coats</label>
                <input type="number" className="w-full mt-1 p-3 border rounded-xl bg-slate-50" value={coats} onChange={(e) => setCoats(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Service Item</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase">Description</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase w-24">Qty/Sqm</th>
                  <th className="p-4 text-xs font-bold text-slate-400 uppercase w-32">Amount</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map(item => {
                  const calc = calculateLineItem(item.qty, item.rate, pricingData.brands[brand], coats);
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50">
                      <td className="p-4"><input className="w-full font-bold bg-transparent outline-none" value={item.service} onChange={(e) => updateItem(item.id, 'service', e.target.value)} /></td>
                      <td className="p-4"><input className="w-full text-sm text-slate-500 bg-transparent outline-none" value={item.desc} onChange={(e) => updateItem(item.id, 'desc', e.target.value)} placeholder="Add detail..." /></td>
                      <td className="p-4"><input type="number" className="w-full p-2 border rounded-lg bg-white" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} /></td>
                      <td className="p-4 relative">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">${calc.total.toFixed(0)}</span>
                          <div className="group/math relative cursor-help">
                            <HelpCircle size={14} className="text-slate-300" />
                            <div className="hidden group-hover/math:block absolute bottom-full left-0 w-48 p-2 bg-slate-800 text-[10px] text-white rounded shadow-xl mb-2 z-50">
                              {calc.formula}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={addItem} className="w-full p-4 text-blue-600 font-bold bg-slate-50 hover:bg-blue-50 flex items-center justify-center gap-2 border-t">
              <Plus size={18} /> Add Custom Service / Specialist Work
            </button>
          </div>
        </div>

        {/* FINANCIAL DASHBOARD */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-12 border-t-4 border-blue-600">
            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-6">Quote Summary (AUD)</h3>
            
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Subtotal</p>
                <p className="text-3xl font-black">${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">GST (10%)</span>
                <span className="font-mono text-xl text-white">${gst.toLocaleString()}</span>
              </div>

              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <p className="text-blue-500 font-black text-[10px] uppercase mb-1">Total Investment</p>
                <p className="text-4xl font-black text-white">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>

              <button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95">
                <FileText size={20} /> GENERATE PDF PROPOSAL
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
