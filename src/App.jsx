import React, { useState } from 'react';
import { FileText, Plus, Info, HelpCircle } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { pricingData, calculateService } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: '', address: '' });
  const [brand, setBrand] = useState('Dulux Premium');
  const [rooms, setRooms] = useState(1);
  const [coats, setCoats] = useState(2);
  
  const [activeServices, setActiveServices] = useState([
    { id: 1, service: 'Interior Walls', description: 'Premium Low Sheen', qty: 50, rate: 45 },
  ]);

  const addManualService = () => {
    setActiveServices([...activeServices, { id: Date.now(), service: '', description: '', qty: 0, rate: 40 }]);
  };

  const updateService = (id, field, value) => {
    setActiveServices(activeServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculateGrandTotal = () => {
    return activeServices.reduce((sum, s) => {
      return sum + calculateService(s.service, s.qty, s.rate, pricingData.brands[brand], coats).amount;
    }, 0);
  };

  const total = calculateGrandTotal();

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("RAV PROPERTY PROJECTS - QUOTE", 14, 20);
    
    const tableData = activeServices.map(s => {
      const calc = calculateService(s.service, s.qty, s.rate, pricingData.brands[brand], coats);
      return [s.service, s.description, `${s.qty} sqm`, `$${calc.amount.toFixed(2)}` ];
    });

    doc.autoTable({
      startY: 40,
      head: [['Service', 'Description', 'Qty/Sqm', 'Amount (AUD)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${total.toFixed(2)}`, 140, finalY);
    doc.text(`GST (10%): $${(total * 0.1).toFixed(2)}`, 140, finalY + 10);
    doc.text(`TOTAL: $${(total * 1.1).toFixed(2)}`, 140, finalY + 20);
    doc.save(`RAV_Quote.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col lg:flex-row gap-8">
      {/* Left: Configuration */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-300">
          <h2 className="text-xl font-bold mb-4">Project Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700">Paint Specification</label>
              <select className="w-full p-2 border rounded mt-1" value={brand} onChange={(e) => setBrand(e.target.value)}>
                {Object.keys(pricingData.brands).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700">System Coats</label>
              <input type="number" className="w-full p-2 border rounded mt-1" value={coats} onChange={(e) => setCoats(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Dynamic Services Table */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-300 overflow-x-auto">
          <h2 className="text-xl font-bold mb-4">Scope of Works</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-slate-500 text-sm">
                <th className="p-2">Service</th>
                <th className="p-2">Description</th>
                <th className="p-2">Qty (Sqm)</th>
                <th className="p-2">Rate</th>
                <th className="p-2">Info</th>
              </tr>
            </thead>
            <tbody>
              {activeServices.map(s => (
                <tr key={s.id} className="border-b group">
                  <td className="p-2"><input className="w-full bg-transparent" value={s.service} onChange={(e) => updateService(s.id, 'service', e.target.value)} placeholder="e.g. Heritage Trim" /></td>
                  <td className="p-2"><input className="w-full bg-transparent" value={s.description} onChange={(e) => updateService(s.id, 'description', e.target.value)} placeholder="Prep & 2 coats" /></td>
                  <td className="p-2"><input type="number" className="w-16 bg-slate-50 border rounded" value={s.qty} onChange={(e) => updateService(s.id, 'qty', Number(e.target.value))} /></td>
                  <td className="p-2 font-mono text-xs text-blue-600 font-bold">${s.rate}</td>
                  <td className="p-2 relative">
                    <div className="cursor-help text-slate-400 hover:text-blue-600 transition group-hover:block">
                      <HelpCircle size={16} />
                      <div className="hidden group-hover:block absolute bottom-full right-0 bg-slate-800 text-white text-[10px] p-2 rounded shadow-xl w-48 z-10">
                        {calculateService(s.service, s.qty, s.rate, pricingData.brands[brand], coats).label}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addManualService} className="mt-4 flex items-center gap-2 text-blue-600 font-bold hover:underline">
            <Plus size={18}/> Add Custom Service / Item
          </button>
        </div>
      </div>

      {/* Right: The Dashboard (High Contrast) */}
      <div className="w-full lg:w-96">
        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl sticky top-8 border-t-4 border-blue-500">
          <h3 className="text-blue-400 font-black uppercase text-xs tracking-widest mb-4">Financial Overview</h3>
          
          <div className="space-y-6">
            <div className="border-b border-slate-700 pb-4">
              <p className="text-slate-300 font-bold text-sm">Subtotal (Ex. GST)</p>
              <p className="text-4xl font-black text-white mt-1">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>

            <div className="flex justify-between items-center text-slate-200">
              <span className="font-bold">GST (10%)</span>
              <span className="font-mono text-xl">${(total * 0.1).toLocaleString()}</span>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-blue-400 font-black text-[10px] uppercase mb-1">Total AUD</p>
              <p className="text-3xl font-black text-white font-mono">${(total * 1.1).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
            </div>

            <button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95">
              <FileText size={20} /> GENERATE FORMAL QUOTE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
