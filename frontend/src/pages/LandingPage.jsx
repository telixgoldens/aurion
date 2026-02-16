import React from "react";
import AurionNavbar from "../layout/Navbar";

const LandingPage = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#f8f9fa]">
      <AurionNavbar onLaunchApp={onLaunchApp} />
      <header className="py-20 text-center mt-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <span className="inline-block border border-[#d4af37] text-[#d4af37] rounded-full px-4 py-2 mb-6 text-sm tracking-wider">
            META-LAYER CREDIT INFRASTRUCTURE
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            The Credit Layer of <br />
            <span className="text-[#d4af37] drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              Decentralized Finance
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#a0aec0] max-w-3xl mx-auto mb-10 leading-relaxed">
            Aurion abstracts user positions across Aave and Compound into
            unified credit accounts, unlocking superior capital efficiency
            through delegated risk underwriting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onLaunchApp}
              className="bg-[#d4af37] text-[#0a0e17] font-semibold px-8 py-4 rounded-full
                hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] hover:-translate-y-1
                transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
            >
              Explore Markets
            </button>
            <a
              href="/Aurion_Protocol_Whitepaper.pdf"
              target="_blank"
              rel="noreferrer"
              download
              className="border-2 border-white text-white font-semibold px-8 py-4 rounded-full
    hover:bg-white hover:text-[#0a0e17] transition-all duration-300 inline-flex items-center justify-center"
            >
              Read Whitepaper
            </a>
          </div>
        </div>
      </header>
      <section className="py-20 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-[rgba(212,175,55,0.2)] 
              rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] h-full
              hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]
              transition-all duration-300"
            >
              <h5 className="text-[#d4af37] font-bold text-xl mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                Credit Aggregation
              </h5>
              <p className="text-sm text-gray-300 opacity-75 leading-relaxed">
                Unified credit identity spanning multiple protocols, enabling
                portfolio-level risk assessment.
              </p>
            </div>
            <div
              className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-[rgba(212,175,55,0.2)] 
              rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] h-full
              hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]
              transition-all duration-300"
            >
              <h5 className="text-[#d4af37] font-bold text-xl mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                Mandatory Routing
              </h5>
              <p className="text-sm text-gray-300 opacity-75 leading-relaxed">
                Pre-emptive risk rules enforced via our mandatory router before
                transaction execution.
              </p>
            </div>
            <div
              className="bg-[rgba(255,255,255,0.03)] backdrop-blur-md border border-[rgba(212,175,55,0.2)] 
              rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] h-full
              hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]
              transition-all duration-300"
            >
              <h5 className="text-[#d4af37] font-bold text-xl mb-4 drop-shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                Delegated Guarantees
              </h5>
              <p className="text-sm text-gray-300 opacity-75 leading-relaxed">
                Earn yield by providing balance sheet risk guarantees without
                deploying capital into pools.
              </p>
            </div>
          </div>
        </div>
      </section>
      <footer className="mt-20 bg-gradient-to-b from-transparent to-[rgba(10,14,23,0.8)] pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12">
            <div className="lg:col-span-4">
              <h4 className="text-white font-bold text-2xl mb-4">AURION</h4>
              <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                Building institutional-grade credit infrastructure for the
                future of Arbitrum DeFi.
              </p>
            </div>
            <div className="lg:col-span-2">
              <h6 className="text-white font-bold mb-4">Protocol</h6>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                  >
                    Markets
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                  >
                    Governance
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-2">
              <h6 className="text-white font-bold mb-4">Resources</h6>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/Aurion_Protocol_Whitepaper.pdf"
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                  >
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                  >
                    Brand Assets
                  </a>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <h6 className="text-white font-bold mb-4">Connect</h6>
              <div className="flex gap-4 lg:justify-end">
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                >
                  Discord
                </a>
                <a
                  href="https://github.com/telixgoldens/aurion"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              © 2026 Aurion Protocol. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
