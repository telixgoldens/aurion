import { Check } from 'lucide-react';

export function CreditScoring() {
  const tiers = [
    { name: "Conservative", range: "0-600", color: "from-green-500 to-emerald-400", textColor: "text-green-400" },
    { name: "Moderate", range: "601-800", color: "from-yellow-500 to-amber-400", textColor: "text-yellow-400" },
    { name: "Aggressive", range: "801-1000", color: "from-red-500 to-orange-400", textColor: "text-red-400" }
  ];

  const benefits = [
    "Lower fees",
    "Higher borrow limits",
    "Priority delegated credit",
    "Early feature access"
  ];

  const currentScore = 847;

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Credit Scoring</h2>
          <p className="text-gray-400 text-lg">Build reputation, unlock benefits</p>
        </div>

        <div className="p-10 rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm mb-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg text-gray-300">Your Credit Score</span>
              <span className="text-4xl font-bold text-[#D4AF37]">{currentScore}</span>
            </div>
            <div className="relative h-6 bg-[rgba(10,14,23,0.6)] rounded-full overflow-hidden">
              <div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentScore < 600 ? 'from-green-500 to-emerald-400' : currentScore < 800 ? 'from-yellow-500 to-amber-400' : 'from-red-500 to-orange-400'} rounded-full shadow-lg`} style={{ width: `${(currentScore / 1000) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>0</span>
              <span>250</span>
              <span>500</span>
              <span>750</span>
              <span>1000</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-[rgba(10,14,23,0.4)] border border-[rgba(212,175,55,0.1)]"
              >
                <div className={`text-sm font-semibold mb-1 ${tier.textColor}`}>{tier.name}</div>
                <div className="text-xs text-gray-400">{tier.range}</div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Benefits of Higher Scores</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-[#0a0e17]" />
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
