import { Wallet, DollarSign, LineChart, Shield, TrendingUp, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    { icon: Wallet, label: "Deposit collateral" },
    { icon: DollarSign, label: "Receive a credit limit" },
    { icon: LineChart, label: "Borrow from integrated pools" },
    { icon: Shield, label: "Maintain your health factor" },
    { icon: TrendingUp, label: "Build your credit score" }
  ];

  return (
    <section className="py-20 px-6 relative bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.02)] to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">How It Works</h2>
          <p className="text-gray-400 text-lg">Simple, transparent credit in five steps</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[rgba(15,20,35,0.8)] to-[rgba(15,20,35,0.4)] border border-[rgba(212,175,55,0.2)] flex items-center justify-center mb-3">
                  <step.icon className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <div className="text-sm text-center text-gray-300 max-w-[120px]">{step.label}</div>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden md:block w-6 h-6 text-[rgba(212,175,55,0.3)] mb-12" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
