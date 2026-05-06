import { Check, Circle } from 'lucide-react';

export function Roadmap() {
  const milestones = [
    { title: "Onchain credit scoring", status: "completed" },
    { title: "Stylus-based risk engine", status: "in-progress" },
    { title: "Multi-protocol aggregation", status: "upcoming" },
    { title: "DAO governance", status: "upcoming" }
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Roadmap</h2>
          <p className="text-gray-400 text-lg">Building the future of DeFi credit</p>
        </div>

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-[rgba(212,175,55,0.2)]" />

          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative flex items-start gap-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                  milestone.status === 'completed'
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#f0d97d]'
                    : milestone.status === 'in-progress'
                    ? 'bg-gradient-to-br from-[rgba(212,175,55,0.3)] to-[rgba(212,175,55,0.1)] border-2 border-[#D4AF37]'
                    : 'bg-[rgba(15,20,35,0.6)] border-2 border-[rgba(212,175,55,0.2)]'
                }`}>
                  {milestone.status === 'completed' ? (
                    <Check className="w-7 h-7 text-[#0a0e17]" />
                  ) : (
                    <Circle className="w-7 h-7 text-[#D4AF37]" />
                  )}
                </div>

                <div className="flex-1 pt-3">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm">
                    <div className="text-xl font-semibold text-white mb-1">{milestone.title}</div>
                    <div className="text-sm text-gray-400 capitalize">{milestone.status.replace('-', ' ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
