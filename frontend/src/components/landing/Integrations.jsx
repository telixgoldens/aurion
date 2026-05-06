export function Integrations() {
  const integrations = [
    { name: "Aave", type: "Lending Protocol" },
    { name: "Compound", type: "Money Market" },
    { name: "Arbitrum", type: "L2 Network" }
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Integrations</h2>
          <p className="text-gray-400 text-lg">Liquidity sourced from leading protocols</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm hover:border-[rgba(212,175,55,0.3)] transition-all text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#f0d97d] mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#0a0e17]">{integration.name.charAt(0)}</span>
              </div>
              <div className="text-xl font-semibold text-white mb-1">{integration.name}</div>
              <div className="text-sm text-gray-400">{integration.type}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
