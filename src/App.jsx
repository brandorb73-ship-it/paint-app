import React, { useState } from 'react';
import { Calculator, User, ShieldCheck, FileText, ChevronRight, HardHat, Paintbucket, Sparkles } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: '', address: '', email: '' });
  const [dim, setDim] = useState({ length: 4, width: 3, height: 2.7 });
  
  // Professional Services Selection
  const [services, setServices] = useState({
    interiorWalls: true,
    ceiling: true,
    prepLevel: 'standard', // standard, heavy, premium
    woodwork: false, // Skirtings/Architraves
    moldTreatment: false
  });

  // --- BUSINESS LOGIC & MARGINS ---
  const wallArea = (dim.length * dim.height * 2) + (dim.width * dim.height * 2);
  const ceilingArea = dim.length * dim.width;
  
  // Pricing Rules (Melbourne 2026 Estimates)
  const rates = {
    laborSqm: 48,
    ceilingSqm: 35,
    prepBase: { standard: 150, heavy: 450, premium: 850 },
    woodworkFix: 250,
    moldFix: 180
  };

  const wallLabor = services.interiorWalls ? wallArea * rates.laborSqm : 0;
  const ceilingLabor = services.ceiling ? ceilingArea * rates.ceilingSqm : 0;
  const prepCost = rates.prepBase[services.prepLevel];
  const extras = (services.woodwork ? rates.woodworkFix : 0) + (services.moldTreatment ? rates.moldFix : 0);
  
  const subtotalLabor = wallLabor + ceilingLabor + prepCost + extras;
  const materialCost = ((wallArea + ceilingArea) / 14) * 28; // ~14sqm coverage @ $28/L for premium
  const totalQuote = subtotalLabor + materialCost;
  const gst = totalQuote * 0.10;
  const grandTotal = totalQuote + gst;

  // --- PDF GENERATOR ---
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text("RAV PROPERTY PROJECTS", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Melbourne, VIC | Professional Painting & Property Services", 14, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 20);

    // Client Info
    doc.setDrawColor(200);
    doc.line(14, 35, 196, 35);
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("QUOTE FOR:", 14, 45);
    doc.setFont("helvetica", "bold");
    doc.text(client.name || "Valued Client", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(client.address || "Melbourne Site Address", 14, 58);

    // Table
    const tableData = [
      ["Interior Wall Painting", `${wallArea.toFixed(1)} sqm`, `$${wallLabor.toFixed(2)}`],
      ["Ceiling Painting", `${ceilingArea.toFixed(1)} sqm`, `$${ceilingLabor.toFixed(2)}`],
      [`Surface Prep (${services.prepLevel})`, "Fixed", `$${prepCost.toFixed(2)}`],
      ["Materials (Premium Low Sheen/Flat)", "Estimated", `$${materialCost.toFixed(2)}`],
      ["Extras (Woodwork/Treatment)", "Fixed", `$${extras.toFixed(2)}`]
    ];

    doc.autoTable({
      startY: 70,
      head: [['Service Description', 'Qty/Size', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${totalQuote.toLocaleString()}`, 140, finalY);
    doc.text(`GST (10%): $${gst.toLocaleString()}`, 140, finalY + 7);
    doc.setFontSize(14);
    doc.text(`TOTAL: $${grandTotal.toLocaleString()}`, 140, finalY + 16);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Terms: Quote valid for 30 days. 10% deposit required to book.", 14, 280);
    doc.text("RAV Property Projects - Quality Finishes Every Time.", 14, 285);

    doc.save(`Quote_${client.name || 'Project'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <HardHat className="text-blue-600" /> Service Configuration
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition">
                  <input type="checkbox" checked={services.interiorWalls} onChange={() => setServices({...services, interiorWalls: !services.interiorWalls})} className="w-5 h-5 rounded text-blue-600" />
                  <div><p className="font-bold">Interior Walls</p><p className="text-xs text-slate-500">Premium 2-coat system</p></div>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:bg-slate-50 transition">
                  <input type="checkbox" checked={services.ceiling} onChange={() => setServices({...services, ceiling: !services.ceiling})} className="w-5 h-5" />
                  <div><p className="font-bold">Ceilings</p><p className="text-xs text-slate-500">Flat white specialized ceiling paint</p></div>
                </label>
              </div>

              <div className="space-y-4">
                <p className="font-bold text-sm text-slate-400 uppercase">Prep Work Level</p>
                <select className="w-full p-3 bg-slate-100 rounded-xl outline-none" value={services.prepLevel} onChange={(e) => setServices({...services, prepLevel: e.target.value})}>
                  <option value="standard">Standard (Light sanding/gaps)</option>
                  <option value="heavy">Heavy (Patching/Cracks)</option>
                  <option value="premium">Premium (Skimming/Full prep)</option>
                </select>
                <div className="flex flex-wrap gap-2 pt-2">
                   <button onClick={() => setServices({...services, woodwork: !services.woodwork})} className={`px-3 py-1 rounded-full text-xs font-bold ${services.woodwork ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>+ Skirtings</button>
                   <button onClick={() => setServices({...services, moldTreatment: !services.moldTreatment})} className={`px-3 py-1 rounded-full text-xs font-bold ${services.moldTreatment ? 'bg-blue-600 text-white' : 'bg-slate-200'}`}>+ Anti-Mold</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <div className="grid grid-cols-3 gap-4">
                <input type="text" placeholder="Client Name" className="p-3 bg-slate-50 border rounded-lg" onChange={(e) => setClient({...client, name: e.target.value})} />
                <input type="text" placeholder="Site Address" className="p-3 bg-slate-50 border rounded-lg" onChange={(e) => setClient({...client, address: e.target.value})} />
                <div className="flex gap-2">
                  <input type="number" placeholder="L" className="w-full p-3 bg-slate-50 border rounded-lg" onChange={(e) => setDim({...dim, length: Number(e.target.value)})} />
                  <input type="number" placeholder="W" className="w-full p-3 bg-slate-50 border rounded-lg" onChange={(e) => setDim({...dim, width: Number(e.target.value)})} />
                </div>
             </div>
          </div>
        </div>

        {/* FINANCIAL DASHBOARD */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Margin & Profit Analysis</h3>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-bold">${grandTotal.toLocaleString()}</p>
                <p className="text-slate-500 text-sm">Total Quote (Inc. GST)</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border-l-2 border-green-500 pl-3">
                  <p className="text-xs text-slate-500">Gross Profit</p>
                  <p className="font-bold text-green-400">${(subtotalLabor * 0.4).toLocaleString()}</p> 
                </div>
                <div className="border-l-2 border-blue-500 pl-3">
                  <p className="text-xs text-slate-500">Materials</p>
                  <p className="font-bold">${materialCost.toLocaleString()}</p>
                </div>
              </div>

              <button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95">
                <FileText size={20} /> Generate Professional Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
