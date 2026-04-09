import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, HelpCircle, Trash2, Settings2, Users, MapPin, Paintbrush, Home, Ruler, Calendar
} from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { sectorData, serviceCatalog, pricingData, calculateLineItem } from './utils/calculations';

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: 'Rav', address: 'Fitzroy', sector: 'Residential' });
  const [setup, setSetup] = useState({ rooms: 4, coats: 2, painters: 2, days: 3, brand: 'Dulux Wash & Wear', manualSiteArea: 60 });
  const [selectedServices, setSelectedServices] = useState({ 'Walls': true, 'Sanding': true });
  const [tableQtys, setTableQtys] = useState({}); // Stores editable sqm for each line item
  const [customItems, setCustomItems] = useState([]);

  // Sync table quantities when manual site area or services change
  useEffect(() => {
    const newQtys = { ...tableQtys };
    Object.entries(serviceCatalog).forEach(([group, services]) => {
      Object.keys(services).forEach(s => {
        if (selectedServices[s] && !newQtys[s]) {
          newQtys[s] = setup.manualSiteArea;
        }
      });
    });
    setTableQtys(newQtys);
  }, [selectedServices, setup.manualSiteArea]);

  const activeItems = Object.entries(serviceCatalog).flatMap(([group, services]) => 
    Object.keys(services).filter(s => selectedServices[s]).map(s => ({
      id: s,
      service: s,
      desc: services[s].desc,
      qty: tableQtys[s] || setup.manualSiteArea,
      rate: services[s].rate
    }))
  ).concat(customItems);

  const sector = sectorData[client.sector];
  const internalLaborCost = setup.painters * setup.days * pricingData.laborDay;
  const subtotal = activeItems.reduce((sum, item) => sum + calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier).total, 0);
  const total = subtotal * 1.1;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RAV PROPERTY PROJECTS", 14, 25);
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`CLIENT: ${client.name} | ADDRESS: ${client.address}`, 14, 50);
    doc.text(`TOTAL SITE AREA: ${setup.manualSiteArea} sqm | SECTOR: ${client.sector}`, 14, 55);

    doc.autoTable({
      startY: 65,
      head: [['Service', 'Description', 'Qty/Sqm', 'Amount']],
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
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><MapPin size={16}/> Client Details</h2>
              <div className="space-y-3">
                <input className="w-full p-2 border rounded-lg bg-slate-50 font-bold" value={client.name} onChange={e => setClient({...client, name: e.target.value})} placeholder="Client Name" />
                <input className="w-full p-2 border rounded-lg bg-slate-50" value={client.address} onChange={e => setClient({...client, address: e.target.value})} placeholder="Project Address" />
                <select className="w-full p-2 border rounded-lg bg-slate-50 font-bold" value={client.sector} onChange={e => setClient({...client, sector: e.target.value})}>
                  {Object.keys(sectorData).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><Settings2 size={16}/> Configuration</h2>
              <div className="grid grid-cols-3 gap-3">
                <ConfigInput label="Rooms" icon={<Home size={10}/>} value={setup.rooms} onChange={v => setSetup({...setup, rooms: v})} />
                <ConfigInput label="Coats" icon={<Paintbrush size={10}/>} value={setup.coats} onChange={v => setSetup({...setup, coats: v})} />
                <ConfigInput label="Staff" icon={<Users size={10}/>} value={setup.painters} onChange={v => setSetup({...setup, painters: v})} />
                <ConfigInput label="Days" icon={<Calendar size={10}/>} value={setup.days} onChange={v => setSetup({...setup, days: v})} />
                <div className="col-span-2 space-y-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase">Paint Brand</label>
                   <select className="w-full p-2 bg-slate-50 border rounded-lg font-bold" value={setup.brand} onChange={e => setSetup({...setup, brand: e.target.value})}>
                    {Object.keys(pricingData.brands).map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-5 rounded-2xl text-white flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-xl"><Ruler size={24}/></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Manual Site Area (SQM)</p>
                <input type="number" className="bg-transparent text-3xl font-black outline-none border-b-2 border-blue-400 w-32" value={setup.manualSiteArea} onChange={e => setSetup({...setup, manualSiteArea: Number(e.target.value)})} />
              </div>
            </div>
          </div>

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

          <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white text-[10px] uppercase tracking-widest">
                <tr><th className="p-4">Service Item</th><th className="p-4 w-28 text-center">Qty(sqm)</th><th className="p-4 w-32">Amount</th><th className="p-4"></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeItems.map(item => {
                  const calc = calculateLineItem(item.qty, item.rate, pricingData.brands[setup.brand], setup.coats, sector.multiplier);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4"><span className="font-bold text-sm block">{item.service}</span><span className="text-[10px] text-slate-400">{item.desc}</span></td>
                      <td className="p-4">
                        <input type="number" className="w-full text-center border rounded p-1.5 text-sm bg-white font-bold" value={item.qty} onChange={e => setTableQtys({...tableQtys, [item.id]: Number(e.target.value)})} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 group relative">
                          <span className="font-mono font-bold text-blue-600 text-lg">${calc.total.toFixed(0)}</span>
                          <HelpCircle size={14} className="text-slate-300 cursor-help" />
                          <div className="hidden group-hover:block absolute bottom-full left-0 mb-3 w-64 p-4 bg-slate-800 text-white text-[10px] rounded-xl shadow-2xl z-[999]">{calc.formula}</div>
                        </div>
                      </td>
                      <td className="p-4">{customItems.find(c => c.id === item.id) && <button onClick={() => setCustomItems(customItems.filter(c => c.id !== item.id))}><Trash2 size={18} className="text-red-400"/></button>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button onClick={() => setCustomItems([...customItems, {id: Date.now(), service: 'Custom Work', desc: 'Manual Entry', qty: 10, rate: 50}])} className="w-full p-4 text-blue-600 font-black text-xs uppercase hover:bg-blue-50 transition flex items-center justify-center gap-2 border-t">
              <Plus size={16}/> Add Specialist Item
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-10 border-t-8 border-blue-600">
            <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-6">Internal Audit</h3>
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Gross Margin Est.</p>
            <p className="text-4xl font-black text-green-400 mb-8">${(subtotal - internalLaborCost).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <div className="bg-slate-800 p-6 rounded-2xl mb-6 border border-slate-700">
               <p className="text-[10px] text-slate-400 mb-2 uppercase font-black tracking-widest">Total Client Quote</p>
               <p className="text-5xl font-black leading-none tracking-tighter">${total.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            </div>
            <button onClick={generatePDF} className="w-full bg-blue-600 p-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-500 transition shadow-lg">
               <FileText size={20}/> Generate PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigInput({ label, icon, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">{icon} {label}</label>
      <input type="number" className="w-full p-2 bg-slate-50 border rounded-lg font-bold" value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}
