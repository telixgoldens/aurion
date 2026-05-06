import React from "react";
import AurionLogo from "../../assets/aurion_logo.png";


export function Header({onLaunchApp}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(212,175,55,0.1)] bg-[rgba(10,14,23,0.8)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <img src={AurionLogo} alt="Aurion Logo" className="w-8 h-8 rounded-sm"/>
          </div>
          <span className="text-xl font-semibold text-white">Aurion</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Protocol</a>
          <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Docs</a>
          <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Governance</a>
          <button className="px-5 py-2 rounded-lg bg-[#D4AF37] text-[#0a0e17] font-medium hover:bg-[#f0d97d] transition-colors" onClick={onLaunchApp}>
            Launch App 
          </button>
        </nav>
      </div>
    </header>
  );
}
