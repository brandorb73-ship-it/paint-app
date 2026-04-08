import React, { useState } from 'react';
import { Calculator, ShieldCheck, FileText, ChevronRight, HardHat, Paintbucket, Sparkles, Building2, Home, HeartPulse } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function RavPropertyApp() {
  const [client, setClient] = useState({ name: '', address: '', sector: 'Residential' });
  const [dim, setDim] = useState({ rooms: 1, avgSize: 12, height: 2.7, coats: 2 });
  
  const [scope, setScope] = useState({
    industrialSanding: true,
    gapFilling: true,
    flutedMasking: false,
    siteProtection: true,
    premiumBrand: 'Dulux', // Dulux or Haymes
  });

  // --- MELBOURNE SECTOR PRICING (2026) ---
  const sectorMultipliers = {
    'Residential': 1.0,
    'New Build': 0.85, // Efficiency of empty space
    'Aged Care': 1.25, // High compliance/Low-VOC/After-hours
    'Boutique Studio': 1.4, // Precision masking/Fluted panels
    'Pre-sale': 0.9, // Speed/Standard finish
  };

  const calculateCosts = () => {
    const totalArea = (dim.rooms * dim.avgSize) * 3.5; // Average wall multiplier
    const baseLabor = totalArea * 48; // Standard $48/sqm Melb rate
    
    const sectorAdjustment = sectorMultipliers[client.sector] || 1.0;
    
    // Feature costs
    const sandingFee = scope.industrialSanding ? (dim.rooms * 80) : 0;
    const maskingFee = scope.flutedMasking ? (dim.rooms * 150) : 0; // High precision labor
    const protectionFee = scope.siteProtection ? (dim.rooms * 45) : 0;
    
    const subtotal = (baseLabor * sectorAdjustment) + sandingFee + maskingFee + protectionFee;
    const materialCost = (totalArea / 14) * dim.coats * 28; // $28/L for premium
    
    const total = subtotal + materialCost;
    return { subtotal, materialCost, total, gst: total * 0.1, grandTotal: total * 1.1 };
  };

  const costs = calculateCosts();

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("RAV PROPERTY PROJECTS - QUOTE", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Sector: ${client.sector} | Brand Spec: ${scope.premiumBrand} Premium`, 14, 28);
    doc.text(`Project: ${dim.rooms} Room(s), ${dim.coats} Coat System`, 14, 34);

    const tableData = [
      ["Preparation", "Industrial sanding, gap-filling, integrity assessment", "Included"],
      ["Specification", `${scope.premiumBrand} Low-Sheen Premium Finish`, "Included"],
      ["Specialty Work", "Precision masking & operational care", scope.flutedMasking ? "Standard+" : "Standard"],
      ["Operational Care", "Drop sheets, masking, post-project cleanup", "Included"],
      ["Total Estimate", "Inclusive of all Labor & Materials", `$${costs.grandTotal.toLocaleString()}`]
    ];

    doc.autoTable({
      startY: 50,
      head: [['Scope of Works', 'Detail', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] }
    });

    doc.text("Footer: All works completed to Australian Standards (AS/NZS 2311:2017).", 14, 280);
    doc.save(`RAV_Quote_${client.name}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* INPUT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Building2 className="text-blue-600" /> Project Sector & Scope
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {['Residential', 'New Build', 'Aged Care', 'Boutique Studio', 'Pre-sale'].map(s => (
                <button key={s} onClick={() => setClient({...client, sector: s})}
                  className={`p-4 rounded-xl border text-left transition ${client.sector === s ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'hover:bg-slate-50'}`}>
                  <p className="font-bold text-sm">{s}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Number of Rooms</label>
                <input type="number" value={dim.rooms} className="w-full p-3 border rounded-lg mt-1" 
                  onChange={(e) => setDim({...dim, rooms: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Brand Specification</label>
                <select className="w-full p-3 border rounded-lg mt-1" onChange={(e) => setScope({...scope, premiumBrand: e.target.value})}>
                  <option value="Dulux">Dulux Wash & Wear</option>
                  <option value="Haymes">Haymes Expressions</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="text-blue-600" /> Detail & Specialty Work
            </h2>
            <div className="space-y-3">
              <label className="flex justify-between items-center p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium italic">Precision masking (Fluted paneling/Archways)</span>
                <input type="checkbox" checked={scope.flutedMasking} onChange={() => setScope({...scope, flutedMasking: !scope.flutedMasking})} className="w-5 h-5" />
              </label>
              <label className="flex justify-between items-center p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-medium">Industrial-grade sanding & gap filling</span>
                <input type="checkbox" checked={scope.industrialSanding} readOnly className="w-5 h-5 text-blue-600" checked />
              </label>
            </div>
          </div>
        </div>

        {/* PRICE SUMMARY CARD */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl sticky top-8">
            <div className="mb-8">
               <p className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-2">Quote Summary</p>
               <h3 className="text-5xl font-bold">${costs.grandTotal.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</h3>
               <p className="text-slate-500 text-sm mt-1">Includes GST & Materials</p>
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-6 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Labor Adjustment ({client.sector})</span>
                <span>{sectorMultipliers[client.sector]}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Coats Applied</span>
                <span>{dim.coats} Coats</span>
              </div>
            </div>

            <button onClick={generatePDF} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition group">
              <FileText size={20} /> Generate PDF Quote <ChevronRight className="group-hover:translate-x-1 transition" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
