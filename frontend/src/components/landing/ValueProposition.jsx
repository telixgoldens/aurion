import { Network, TrendingUp, Users } from 'lucide-react';

export function ValueProposition() {
  const values = [
    {
      icon: Network,
      title: "Unified Credit Layer",
      description: "Aggregate collateral across multiple protocols into one credit line."
    },
    {
      icon: TrendingUp,
      title: "Onchain Credit Score",
      description: "A dynamic score (0–1000) based on repayment behavior and risk."
    },
    {
      icon: Users,
      title: "Delegated Liquidity",
      description: "Borrow beyond your collateral through delegated credit."
    }
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Core Value Proposition</h2>
          <p className="text-gray-400 text-lg">Next-generation credit infrastructure for DeFi</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm hover:border-[rgba(212,175,55,0.3)] transition-all group"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#f0d97d] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <value.icon className="w-7 h-7 text-[#0a0e17]" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{value.title}</h3>
              <p className="text-gray-400 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
