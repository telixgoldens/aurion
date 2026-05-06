import { useState } from 'react';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {

return(
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
                    href="https://aurion-docs.vercel.app"
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
                  href="https://x.com/Aurionprotocol_"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://discord.gg/NhpGK9y2rG"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="https://github.com/telixgoldens/aurion"
                  className="text-gray-400 hover:text-[#d4af37] transition-colors duration-300 text-sm"
                >
                  <Github className="w-5 h-5" />
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
      );
}