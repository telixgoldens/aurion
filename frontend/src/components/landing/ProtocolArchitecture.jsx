import { ArrowRight } from 'lucide-react';

export function ProtocolArchitecture() {
  const components = [
    { name: "CreditManager", description: "Handles user credit lines" },
    { name: "CreditRouter", description: "Routes borrow requests" },
    { name: "CreditPool", description: "Manages liquidity" },
    { name: "InsuranceFund", description: "Protocol safety net" }
  ];

  return (
    <section className="py-20 px-6 relative bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.02)] to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Protocol Architecture</h2>
          <p className="text-gray-400 text-lg">Modular, secure, and efficient</p>
        </div>

        <div className="p-10 rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {components.map((component, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="p-6 rounded-xl bg-[rgba(10,14,23,0.6)] border border-[rgba(212,175,55,0.2)] hover:border-[rgba(212,175,55,0.4)] transition-colors">
                    <div className="text-lg font-semibold text-[#D4AF37] mb-2">{component.name}</div>
                    <div className="text-sm text-gray-400">{component.description}</div>
                  </div>
                </div>
                {index < components.length - 1 && (
                  <ArrowRight className="hidden md:block w-6 h-6 text-[rgba(212,175,55,0.3)] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
