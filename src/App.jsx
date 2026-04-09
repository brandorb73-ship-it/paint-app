import React, { useState } from 'react';
import { FileText, HelpCircle, Plus, Trash2, Settings2, Users } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { sectorData, pricingData, serviceRates, calculateLineItem } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: 'Rav', address: 'Fitzroy', sector: 'Residential' });
  const [setup, setSetup] = useState({ rooms: 1, coats: 2, painters: 2, days: 3, brand: 'Dulux Wash & Wear' });
  const [selectedServices, setSelectedServices] = useState({ Walls: true, Sanding: true });
  const [customItems, setCustomItems] = useState([]);

  const activeItems = Object.keys(selectedServices)
    .filter(key => selectedServices[key])
    .map(key => ({
      id: key,
      service: key,
      desc: serviceRates[key].desc,
      qty: setup.rooms * 15,
      rate: serviceRates[key].rate
    })).concat(customItems);

  const sector = sectorData[client.sector] || sectorData['Residential'];
  const internalLaborCost = setup.painters * setup.days * pricingData.laborDay;

  const subtotal = activeItems.reduce((sum, item) => {
    return sum + calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total;
  }, 0);
  
  const total = subtotal * 1.1;

  // FIXED PDF GENERATOR
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("RAV PROPERTY PROJECTS", 14, 22);
      
      const tableData = activeItems.map(it => [
        it.service,
        it.desc,
        `${it.qty} sqm`,
        `$${calculateLineItem(it.qty, it.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total.toFixed(2)}`
      ]);

      doc.autoTable({
        startY: 40,
        head: [['Service', 'Description', 'Qty', 'Amount']],
        body: tableData,
        headStyles: { fillColor: [37, 99, 235] }
      });

      doc.text(`TOTAL: $${total.toLocaleString()}`, 14, doc.lastAutoTable.finalY + 20);
      doc.save(`Quote_${client.name}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Error generating PDF. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* SETUP BOX */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h2 className="flex items-center gap-2 font-black uppercase text-xs text-slate-400 mb-4"><Settings2 size={16}/> Configuration</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select className="p-2 bg-slate-100 rounded-lg font-bold" value={client.sector} onChange={(e) => setClient({...client, sector: e.target.value})}>
                {Object.keys(sectorData).map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="number" className="p-2 bg-slate-100 rounded-lg" value={setup.rooms} onChange={(e) => setSetup({...setup, rooms: Number(e.target.value)})} />
              <select className="p-2 bg-slate-100 rounded-lg" value={setup.brand} onChange={(e) => setSetup({...setup, brand: e.target.value})}>
                {Object.keys(pricingData.brands).map(b => <option key={b}>{b}</option>)}
              </select>
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
                <Users size={16} className="text-blue-600"/>
                <input type="number" className="bg-transparent font-bold w-full" value={setup.painters} onChange={(e) => setSetup({...setup, painters: Number(e.target.value)})} />
              </div>
            </div>
          </div>

          {/* TABLE - Fixed Z-index for tooltips */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
            <table className="w-full text-left relative">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="p-4 text-[10px] uppercase">Service</th>
                  <th className="p-4 text-[10px] uppercase w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeItems.map(item => {
                  const calc = calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier);
                  return (
                    <tr key={item.id}>
                      <td className="p-4 font-bold">{item.service}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 relative group">
                          <span className="text-blue-600 font-mono font-bold">${calc.total.toFixed(0)}</span>
                          <HelpCircle size={14} className="text-slate-300 cursor-help" />
                          {/* FIXED POPUP POSITION */}
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] rounded-lg shadow-2xl z-[100]">
                            {calc.formula}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-10">
             <p className="text-blue-400 font-black text-[10px] mb-4 uppercase">Internal Profit Est.</p>
             <p className="text-4xl font-black text-green-400 mb-8">${(subtotal - internalLaborCost).toFixed(0)}</p>
             
             <div className="bg-slate-800 p-6 rounded-2xl mb-6">
                <p className="text-xs text-slate-400 mb-1">Total Quote</p>
                <p className="text-4xl font-black">${total.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
             </div>

             <button onClick={generatePDF} className="w-full bg-blue-600 p-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-500 transition">
                <FileText size={20}/> Generate PDF
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
