import React, { useState } from 'react';
import { 
  Calculator, FileText, ChevronRight, HardHat, Paintbucket, 
  Sparkles, Home, Building2, Paintbrush, Hammer, Eraser 
} from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: '', address: '', sector: 'Residential' });
  const [setup, setSetup] = useState({ rooms: 1, coats: 2, painters: 1, days: 1 });
  
  // Detailed Service States
  const [interior, setInterior] = useState({ walls: true, ceilings: true, trims: false, cabinets: false, featureWall: false });
  const [exterior, setExterior] = useState({ facade: false, eaves: false, fascia: false, deck: false, roof: false });
  const [prep, setPrep] = useState({ sanding: true, plasterRepair: false, timberRot: false, pressureWash: false });

  // --- 2026 MELBOURNE MARKET RATES ---
  const pricing = {
    laborDay: 550, // Cost per painter per day
    margin: 1.35,  // 35% Markup on total costs
    sqmRate: 45,
    items: {
      cabinets: 1200, 
      featureWall: 350,
      trims: 450,
      eaves: 850,
      fascia: 650,
      timberRot: 950,
      pressureWash: 400
    }
  };

  const calculateTotals = () => {
    let laborCost = setup.painters * setup.days * pricing.laborDay;
    let materialEstimate = (setup.rooms * 180) * (setup.coats / 2);
    
    // Add extra service costs
    let extras = 0;
    if (interior.cabinets) extras += pricing.items.cabinets;
    if (interior.featureWall) extras += pricing.items.featureWall;
    if (exterior.eaves) extras += pricing.items.eaves;
    if (exterior.fascia) extras += pricing.items.fascia;
    if (prep.timberRot) extras += pricing.items.timberRot;
    if (prep.pressureWash) extras += pricing.items.pressureWash;

    const subtotal = (laborCost + materialEstimate + extras) * pricing.margin;
    return {
      subtotal,
      gst: subtotal * 0.1,
      total: subtotal * 1.1,
      laborOnly: laborCost
    };
  };

  const totals = calculateTotals();

  const generatePDF = () => {
    const doc = new jsPDF();
    const blue = [37, 99, 235];
    
    // Header & Branding
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RAV PROPERTY PROJECTS", 14, 20);
    doc.setFontSize(10);
    doc.text("ABN: 12 345 678 910 | Melbourne, VIC", 14, 28);
    doc.text("E: admin@ravproperty.com.au", 14, 34);

    // Client Info
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text("PROPOSAL FOR:", 14, 50);
    doc.setFont("helvetica", "bold");
    doc.text(client.name || "Valued Client", 14, 58);
    doc.setFont("helvetica", "normal");
    doc.text(client.address || "Melbourne, VIC", 14, 64);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 58);

    // Detailed Scope Table
    const tableBody = [];
    if (interior.walls) tableBody.push(["Interior Painting", `Walls & Ceilings (${setup.coats} Coats)`, "Included"]);
    if (interior.cabinets) tableBody.push(["Cabinetry", "Premium Satin/Gloss Finish", "Extra"]);
    if (exterior.facade) tableBody.push(["Exterior Facade", "Weatherproof Membrane", "Included"]);
    if (prep.sanding) tableBody.push(["Preparation", "Industrial Sanding & Gap-filling", "Included"]);
    if (prep.timberRot) tableBody.push(["Repairs", "Timber Rot Restoration", "Included"]);

    doc.autoTable({
      startY: 75,
      head: [['Service', 'Description', 'Status']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: blue }
    });

    // Summary Box
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setDrawColor(200);
    doc.line(120, finalY, 196, finalY);
    doc.text(`Subtotal: $${totals.subtotal.toLocaleString()}`, 130, finalY + 10);
    doc.text(`GST (10%): $${totals.gst.toLocaleString()}`, 130, finalY + 17);
    doc.setFontSize(16);
    doc.text(`TOTAL: $${totals.total.toLocaleString()}`, 130, finalY + 28);

    // Payment Terms (The Professional Touch)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT TERMS & CONDITIONS:", 14, finalY + 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const terms = [
      "1. 10% Non-refundable deposit required to secure booking.",
      "2. 40% Progress payment required upon completion of preparation stage.",
      "3. Final 50% balance due within 48 hours of project completion.",
      "4. All works carry a 5-year workmanship warranty (excluding wear & tear).",
      "5. Quote valid for 30 days from date of issue."
    ];
    doc.text(terms, 14, finalY + 58);

    doc.save(`RAV_Quote_${client.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        
        {/* LEFT: SELECTIONS */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Section 1: Core Project */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-600"><Building2 size={22}/> Project Setup</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sector</label>
                <select className="p-3 bg-slate-50 border rounded-xl outline-none" onChange={(e) => setClient({...client, sector: e.target.value})}>
                  <option>Residential</option><option>Aged Care</option><option>Boutique Studio</option><option>New Build</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Rooms</label>
                <input type="number" value={setup.rooms} className="p-3 bg-slate-50 border rounded-xl" onChange={(e) => setSetup({...setup, rooms: Number(e.target.value)})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Coats</label>
                <input type="number" value={setup.coats} className="p-3 bg-slate-50 border rounded-xl" onChange={(e) => setSetup({...setup, coats: Number(e.target.value)})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1">Labour (Daily Staff)</label>
                <input type="number" value={setup.painters} className="p-3 bg-slate-50 border rounded-xl text-blue-600 font-bold" onChange={(e) => setSetup({...setup, painters: Number(e.target.value)})} />
              </div>
            </div>
          </section>

          {/* Section 2: Services Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Interior */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Paintbrush size={18} className="text-blue-600"/> Interior</h3>
              <div className="space-y-2">
                {Object.keys(interior).map(key => (
                  <label key={key} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <span className="text-sm capitalize">{key}</span>
                    <input type="checkbox" checked={interior[key]} onChange={() => setInterior({...interior, [key]: !interior[key]})} />
                  </label>
                ))}
              </div>
            </div>
            {/* Exterior */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Home size={18} className="text-green-600"/> Exterior</h3>
              <div className="space-y-2">
                {Object.keys(exterior).map(key => (
                  <label key={key} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <span className="text-sm capitalize">{key}</span>
                    <input type="checkbox" checked={exterior[key]} onChange={() => setExterior({...exterior, [key]: !exterior[key]})} />
                  </label>
                ))}
              </div>
            </div>
            {/* Prep */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Hammer size={18} className="text-orange-600"/> Prep & Repair</h3>
              <div className="space-y-2">
                {Object.keys(prep).map(key => (
                  <label key={key} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                    <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <input type="checkbox" checked={prep[key]} onChange={() => setPrep({...prep, [key]: !prep[key]})} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: MARGIN & QUOTE DASHBOARD */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl sticky top-8">
            <header className="mb-8 border-b border-slate-800 pb-6">
              <p className="text-blue-400 font-bold uppercase text-[10px] tracking-widest mb-2">Internal Margin Analysis</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500">Gross Profit Est.</p>
                  <p className="text-2xl font-bold text-green-400">${(totals.subtotal - totals.laborOnly).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Labor Cost</p>
                  <p className="font-bold">${totals.laborOnly.toLocaleString()}</p>
                </div>
              </div>
            </header>

            <div className="mb-8">
              <p className="text-slate-400 text-sm mb-1">Client Quote Total</p>
              <h2 className="text-5xl font-extrabold">${totals.total.toLocaleString(undefined, {maximumFractionDigits:0})}</h2>
              <p className="text-slate-500 text-xs mt-2 italic">Incl. 10% GST & Premium Materials</p>
            </div>

            <button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition transform active:scale-95 group">
              <FileText size={20} /> Generate PDF Quote <ChevronRight size={18} className="group-hover:translate-x-1 transition"/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
