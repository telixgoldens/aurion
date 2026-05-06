import { Zap, ArrowDown, FileCode } from 'lucide-react';

export function StylusSection() {
  const features = [
    {
      icon: FileCode,
      title: "Complex credit calculations run in Rust using Stylus",
      description: "High-performance execution for sophisticated risk models"
    },
    {
      icon: Zap,
      title: "Faster computation for scoring and risk",
      description: "Real-time credit assessment with minimal latency"
    },
    {
      icon: ArrowDown,
      title: "Lower gas costs for users",
      description: "Efficient execution reduces transaction fees"
    }
  ];

  return (
    <section className="py-20 px-6 relative bg-gradient-to-b from-transparent via-[rgba(212,175,55,0.03)] to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 rounded-full bg-[rgba(212,175,55,0.1)] border border-[rgba(212,175,55,0.2)] text-[#D4AF37] text-sm font-semibold mb-4">
            Coming Soon
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">High-performance risk engine</h2>
          <p className="text-gray-400 text-lg">Powered by Arbitrum Stylus</p>
        </div>

        <div className="p-10 rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#f0d97d] flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-[#0a0e17]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
