import React, { useState } from 'react';

const AurionNavbar = ({ onLaunchApp }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const protocolMenuItems = [
    {
      title: 'Credit Accounts',
      description: 'Unified cross-protocol positions',
      icon: '⚡',
      link: '/protocol/credit-accounts'
    },
    {
      title: 'Credit Router',
      description: 'Mandatory validation gateway',
      icon: '🔀',
      link: '/protocol/credit-router'
    },
    {
      title: 'Protocol Adapters',
      description: 'Aave & Compound integration',
      icon: '🔌',
      link: '/protocol/adapters'
    },
    {
      title: 'Credit Pools',
      description: 'Delegated capital management',
      icon: '💎',
      link: '/protocol/credit-pools'
    },
    {
      title: 'Insurance Fund',
      description: 'Protocol backstop mechanism',
      icon: '🛡️',
      link: '/protocol/insurance'
    }
  ];

  const riskMenuItems = [
    {
      title: 'Risk Tiers',
      description: 'Conservative, Moderate, Aggressive',
      icon: '📊',
      link: '/risk/tiers'
    },
    {
      title: 'Health Monitoring',
      description: 'Real-time position tracking',
      icon: '💚',
      link: '/risk/monitoring'
    },
    {
      title: 'Liquidation Controls',
      description: 'Pre-emptive risk management',
      icon: '⚠️',
      link: '/risk/liquidation'
    },
    {
      title: 'Credit Scoring',
      description: 'On-chain reputation system',
      icon: '⭐',
      link: '/risk/scoring'
    },
    {
      title: 'Risk Oracle',
      description: 'Price feeds & volatility data',
      icon: '🔮',
      link: '/risk/oracle'
    }
  ];

  return (
    <nav className="relative z-50 bg-[rgba(10,10,15,0.8)] backdrop-blur-md border-b border-[rgba(212,175,55,0.1)] py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a href="/" className="text-3xl font-bold text-[#d4af37] tracking-wide">
            AURION
          </a>
          <div className="hidden lg:flex items-center gap-8">
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('protocol')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-2 text-gray-300 hover:text-[#d4af37] transition-colors duration-300 py-2">
                Protocol
                <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'protocol' ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              <div className={`absolute top-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2 min-w-[500px] 
                bg-gradient-to-br from-[rgba(15,15,25,0.98)] to-[rgba(20,20,35,0.98)] 
                border border-[rgba(212,175,55,0.2)] rounded-2xl p-6
                shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]
                backdrop-blur-xl transition-all duration-300
                ${activeDropdown === 'protocol' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}`}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 
                  border-l-8 border-l-transparent 
                  border-r-8 border-r-transparent 
                  border-b-8 border-b-[rgba(212,175,55,0.2)]">
                </div>
                <div className="space-y-2">
                  {protocolMenuItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] 
                        border border-transparent hover:border-[rgba(212,175,55,0.3)]
                        hover:bg-[rgba(212,175,55,0.1)] hover:translate-x-1
                        transition-all duration-300 group/item relative pr-10"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center 
                        bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(212,175,55,0.05)]
                        border border-[rgba(212,175,55,0.2)] rounded-lg text-2xl
                        group-hover/item:scale-105 group-hover/item:border-[rgba(212,175,55,0.4)]
                        transition-all duration-300">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-white font-semibold mb-1 group-hover/item:text-[#d4af37] transition-colors duration-300">
                          {item.title}
                        </h6>
                        <p className="text-sm text-gray-400 leading-snug">
                          {item.description}
                        </p>
                      </div>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] font-bold 
                        opacity-0 group-hover/item:opacity-100 group-hover/item:right-3 transition-all duration-300">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div 
              className="relative group"
              onMouseEnter={() => setActiveDropdown('risk')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-2 text-gray-300 hover:text-[#d4af37] transition-colors duration-300 py-2">
                Risk Management
                <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'risk' ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              <div className={`absolute top-[calc(100%+1.5rem)] left-1/2 -translate-x-1/2 min-w-[500px] 
                bg-gradient-to-br from-[rgba(15,15,25,0.98)] to-[rgba(20,20,35,0.98)] 
                border border-[rgba(212,175,55,0.2)] rounded-2xl p-6
                shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(212,175,55,0.1),inset_0_1px_0_rgba(255,255,255,0.05)]
                backdrop-blur-xl transition-all duration-300
                ${activeDropdown === 'risk' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none'}`}>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 
                  border-l-8 border-l-transparent 
                  border-r-8 border-r-transparent 
                  border-b-8 border-b-[rgba(212,175,55,0.2)]">
                </div>
                <div className="space-y-2">
                  {riskMenuItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] 
                        border border-transparent hover:border-[rgba(212,175,55,0.3)]
                        hover:bg-[rgba(212,175,55,0.1)] hover:translate-x-1
                        transition-all duration-300 group/item relative pr-10"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center 
                        bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(212,175,55,0.05)]
                        border border-[rgba(212,175,55,0.2)] rounded-lg text-2xl
                        group-hover/item:scale-105 group-hover/item:border-[rgba(212,175,55,0.4)]
                        transition-all duration-300">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-white font-semibold mb-1 group-hover/item:text-[#d4af37] transition-colors duration-300">
                          {item.title}
                        </h6>
                        <p className="text-sm text-gray-400 leading-snug">
                          {item.description}
                        </p>
                      </div>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] font-bold 
                        opacity-0 group-hover/item:opacity-100 group-hover/item:right-3 transition-all duration-300">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={onLaunchApp}
              className="bg-[#d4af37] text-[#0a0e17] font-semibold px-6 py-2.5 rounded-full
                hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] hover:-translate-y-0.5
                transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.3)]">
              Launch App
            </button>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-gray-300 hover:text-[#d4af37] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-4">
            <div>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'protocol' ? null : 'protocol')}
                className="w-full flex items-center justify-between text-gray-300 hover:text-[#d4af37] 
                  transition-colors py-3 border-b border-[rgba(212,175,55,0.1)]"
              >
                Protocol
                <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'protocol' ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              {activeDropdown === 'protocol' && (
                <div className="mt-4 space-y-2 bg-gradient-to-br from-[rgba(15,15,25,0.98)] to-[rgba(20,20,35,0.98)] 
                  border border-[rgba(212,175,55,0.2)] rounded-2xl p-4">
                  {protocolMenuItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] 
                        border border-transparent hover:border-[rgba(212,175,55,0.3)]
                        hover:bg-[rgba(212,175,55,0.1)] transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center 
                        bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(212,175,55,0.05)]
                        border border-[rgba(212,175,55,0.2)] rounded-lg text-xl">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-white font-semibold text-sm mb-0.5">
                          {item.title}
                        </h6>
                        <p className="text-xs text-gray-400 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'risk' ? null : 'risk')}
                className="w-full flex items-center justify-between text-gray-300 hover:text-[#d4af37] 
                  transition-colors py-3 border-b border-[rgba(212,175,55,0.1)]"
              >
                Risk Management
                <span className={`text-xs transition-transform duration-300 ${activeDropdown === 'risk' ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              {activeDropdown === 'risk' && (
                <div className="mt-4 space-y-2 bg-gradient-to-br from-[rgba(15,15,25,0.98)] to-[rgba(20,20,35,0.98)] 
                  border border-[rgba(212,175,55,0.2)] rounded-2xl p-4">
                  {riskMenuItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.link}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] 
                        border border-transparent hover:border-[rgba(212,175,55,0.3)]
                        hover:bg-[rgba(212,175,55,0.1)] transition-all duration-300"
                    >
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center 
                        bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(212,175,55,0.05)]
                        border border-[rgba(212,175,55,0.2)] rounded-lg text-xl">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h6 className="text-white font-semibold text-sm mb-0.5">
                          {item.title}
                        </h6>
                        <p className="text-xs text-gray-400 leading-snug">
                          {item.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={onLaunchApp}
              className="w-full bg-[#d4af37] text-[#0a0e17] font-semibold px-6 py-3 rounded-full
                hover:shadow-[0_6px_25px_rgba(212,175,55,0.5)] hover:-translate-y-0.5
                transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.3)]">
              Launch App
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AurionNavbar;