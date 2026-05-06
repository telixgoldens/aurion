import { Check, X } from 'lucide-react';

export function ComparisonTable() {
  const features = [
    { name: "Cross-protocol credit", aurion: true, aave: false },
    { name: "Credit scoring", aurion: true, aave: false },
    { name: "Delegated borrowing", aurion: true, aave: "limited" },
    { name: "Unified health factor", aurion: true, aave: false }
  ];

  return (
    <section className="py-20 px-6 relative bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.02)] to-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Why Aurion</h2>
          <p className="text-gray-400 text-lg">Next generation credit infrastructure</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-3 gap-px bg-[rgba(212,175,55,0.1)]">
            <div className="p-6 bg-[#0a0e17]">
              <div className="text-lg font-semibold text-gray-300">Feature</div>
            </div>
            <div className="p-6 bg-[#0a0e17]">
              <div className="text-lg font-semibold text-[#D4AF37]">Aurion</div>
            </div>
            <div className="p-6 bg-[#0a0e17]">
              <div className="text-lg font-semibold text-gray-400">Aave</div>
            </div>
          </div>

          {features.map((feature, index) => (
            <div key={index} className="grid grid-cols-3 gap-px bg-[rgba(212,175,55,0.1)]">
              <div className="p-6 bg-[rgba(10,14,23,0.8)]">
                <div className="text-gray-300">{feature.name}</div>
              </div>
              <div className="p-6 bg-[rgba(10,14,23,0.8)] flex items-center justify-center">
                {feature.aurion === true ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : feature.aurion === "limited" ? (
                  <span className="text-sm text-yellow-400">Limited</span>
                ) : (
                  <X className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div className="p-6 bg-[rgba(10,14,23,0.8)] flex items-center justify-center">
                {feature.aave === true ? (
                  <Check className="w-6 h-6 text-green-400" />
                ) : feature.aave === "limited" ? (
                  <span className="text-sm text-yellow-400">Limited</span>
                ) : (
                  <X className="w-6 h-6 text-gray-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
