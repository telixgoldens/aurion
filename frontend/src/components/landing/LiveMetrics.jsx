export function LiveMetrics() {
  const metrics = [
    { label: "Total Credit Issued", value: "$247.8M", change: "+12.4%" },
    { label: "Active Borrowers", value: "18,492", change: "+8.1%" },
    { label: "Average Health Factor", value: "2.34", change: "+0.15" },
    { label: "Liquidations Prevented", value: "1,847", change: "-22.3%" }
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-white">Live Metrics</h2>
          <p className="text-gray-400 text-lg">Real-time protocol performance</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(15,20,35,0.6)] to-[rgba(15,20,35,0.3)] border border-[rgba(212,175,55,0.15)] backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,175,55,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className={`text-sm ${metric.change.startsWith('+') ? 'text-green-400' : metric.change.startsWith('-') && metric.label === 'Liquidations Prevented' ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-[#D4AF37] opacity-5 blur-2xl rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
