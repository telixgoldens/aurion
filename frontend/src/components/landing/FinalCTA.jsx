export function FinalCTA() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.05)] to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37] opacity-10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Start borrowing with smarter credit
        </h2>
        <p className="text-xl text-gray-400 mb-10">
          Join the next generation of DeFi credit infrastructure
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-10 py-4 rounded-lg bg-[#D4AF37] text-[#0a0e17] font-semibold hover:bg-[#f0d97d] transition-all shadow-lg shadow-[rgba(212,175,55,0.3)] text-lg">
            Launch App
          </button>
          <button className="px-10 py-4 rounded-lg border border-[rgba(212,175,55,0.3)] text-[#D4AF37] font-semibold hover:bg-[rgba(212,175,55,0.1)] transition-all text-lg">
            View Docs
          </button>
        </div>
      </div>

      <footer className="mt-24 pt-12 border-t border-[rgba(212,175,55,0.1)] text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#f0d97d] flex items-center justify-center">
            <span className="text-[#0a0e17] font-bold">A</span>
          </div>
          <span className="text-xl font-semibold text-white">Aurion Protocol</span>
        </div>
        <p className="text-gray-500 text-sm">© 2026 Aurion Protocol. All rights reserved.</p>
      </footer>
    </section>
  );
}
