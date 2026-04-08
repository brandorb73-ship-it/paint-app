import React, { useState } from 'react';
import { Calculator, User, FileText, Send } from 'lucide-react';

export default function PaintApp() {
  const [client, setClient] = useState({ name: '', phone: '', address: '' });
  const [dimensions, setDimensions] = useState({ length: 0, width: 0, height: 2.7 }); // Standard Melb ceiling height
  const [rate, setRate] = useState(35); // Base rate per sqm (labor + paint)

  const area = (dimensions.length * dimensions.height * 2) + (dimensions.width * dimensions.height * 2);
  const totalQuote = area * rate;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
  RAV Property <span className="text-blue-600">Projects</span>
</h1>
        <p className="text-slate-500 text-sm">Melbourne, VIC</p>
      </header>

      <main className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {/* CRM & Client Info */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold">
            <User size={20} /> <h2>Client Details</h2>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Client Name" className="w-full p-2 border rounded" 
              onChange={(e) => setClient({...client, name: e.target.value})} />
            <input type="text" placeholder="Site Address (e.g. Fitzroy)" className="w-full p-2 border rounded" 
              onChange={(e) => setClient({...client, address: e.target.value})} />
          </div>
        </section>

        {/* Estimator Logic */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold">
            <Calculator size={20} /> <h2>Room Calculator</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 uppercase">Length (m)</label>
              <input type="number" className="w-full p-2 border rounded" 
                onChange={(e) => setDimensions({...dimensions, length: Number(e.target.value)})} />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase">Width (m)</label>
              <input type="number" className="w-full p-2 border rounded" 
                onChange={(e) => setDimensions({...dimensions, width: Number(e.target.value)})} />
            </div>
          </div>
        </section>

        {/* Quote Generator Output */}
        <section className="md:col-span-2 bg-slate-800 text-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-400 uppercase tracking-wider text-sm">Estimated Total for {client.name || 'Client'}</p>
              <h2 className="text-5xl font-bold mt-2">${totalQuote.toLocaleString()}</h2>
              <p className="text-slate-400 mt-2 italic">{area.toFixed(2)} sqm of wall surface</p>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-lg font-bold transition">
              <Send size={18} /> Send Quote
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
