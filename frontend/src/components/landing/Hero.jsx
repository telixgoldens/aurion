import React from "react";

export function Hero({onLaunchApp}) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,175,55,0.05)] to-transparent pointer-events-none" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-[#D4AF37] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
            The Credit Layer for DeFi
          </h1>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Borrow across protocols with unified credit, risk scoring, and delegated liquidity.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 rounded-lg bg-[#D4AF37] text-[#0a0e17] font-semibold hover:bg-[#f0d97d] transition-all shadow-lg shadow-[rgba(212,175,55,0.3)]"  onClick={onLaunchApp}>
              Explore Markets
            </button>
           <a
              href="/Aurion_Protocol_Whitepaper.pdf"
              target="_blank"
              rel="noreferrer"
              download
              className="px-8 py-3 rounded-lg border border-[rgba(212,175,55,0.3)] text-[#D4AF37] font-semibold hover:bg-[rgba(212,175,55,0.1)] transition-all">
              Read Whitepaper
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.8)] to-[rgba(15,20,35,0.4)] border border-[rgba(212,175,55,0.2)] backdrop-blur-xl shadow-2xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Credit Score</span>
                <span className="text-2xl font-bold text-[#D4AF37]">847</span>
              </div>
              <div className="relative h-3 bg-[rgba(10,14,23,0.6)] rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[84.7%] bg-gradient-to-r from-[#D4AF37] to-[#f0d97d] rounded-full shadow-lg shadow-[rgba(212,175,55,0.4)]" />
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0</span>
                <span>500</span>
                <span>1000</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Health Factor</span>
                <span className="text-lg font-semibold text-green-400">2.45</span>
              </div>
              <div className="relative h-2 bg-[rgba(10,14,23,0.6)] rounded-full overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-[80%] bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[rgba(10,14,23,0.4)] border border-[rgba(212,175,55,0.1)]">
                <div className="text-xs text-gray-400 mb-1">Borrowed</div>
                <div className="text-lg font-semibold text-white">$45,230</div>
              </div>
              <div className="p-4 rounded-lg bg-[rgba(10,14,23,0.4)] border border-[rgba(212,175,55,0.1)]">
                <div className="text-xs text-gray-400 mb-1">Available Credit</div>
                <div className="text-lg font-semibold text-[#D4AF37]">$110,500</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
