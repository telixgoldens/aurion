import { Card } from "../ui/card";
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const creditOverview = [
    { label: "Credit Limit", value: "$150,000", icon: DollarSign, trend: "+12.5%", trendUp: true },
    { label: "Outstanding Debt", value: "$42,850", icon: TrendingUp, trend: "-5.2%", trendUp: false },
    { label: "Available Credit", value: "$107,150", icon: ArrowUpRight, trend: "+8.3%", trendUp: true },
  ];

  const recentActivity = [
    { type: "Borrowed", asset: "USDC", amount: "15,000", timestamp: "2 hours ago", icon: ArrowDownRight, color: "text-orange-400" },
    { type: "Repaid", asset: "ETH", amount: "2.5", timestamp: "1 day ago", icon: ArrowUpRight, color: "text-emerald-400" },
    { type: "Fees Paid", asset: "USDC", amount: "125.50", timestamp: "3 days ago", icon: DollarSign, color: "text-[#D4AF37]" },
    { type: "Borrowed", asset: "USDC", amount: "10,000", timestamp: "5 days ago", icon: ArrowDownRight, color: "text-orange-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Credit Overview */}
      <section>
        <h2 className="text-lg text-white/90 mb-4">Credit Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          {creditOverview.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${item.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{item.trend}</span>
                  </div>
                </div>
                <div className="text-3xl text-white mb-1">{item.value}</div>
                <div className="text-sm text-[#F5DEB3]/70">{item.label}</div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Risk & Health */}
      <section>
        <h2 className="text-lg text-white/90 mb-4">Risk & Health</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-[#F5DEB3]/70">Credit Utilization</h3>
              <span className="text-xl text-white">28.6%</span>
            </div>
            <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '28.6%' }}></div>
            </div>
            <p className="text-xs text-[#F5DEB3]/50 mt-2">Safe: Below 50%</p>
          </Card>

          <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-[#F5DEB3]/70">Liquidation Threshold</h3>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xl text-white">75%</span>
              </div>
            </div>
            <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden">
              <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: '38%' }}></div>
            </div>
            <p className="text-xs text-[#F5DEB3]/50 mt-2">Buffer: $78,650 until liquidation</p>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-lg text-white/90 mb-4">Recent Activity</h2>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20">
          <div className="divide-y divide-[#D4AF37]/10">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-[#D4AF37]/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#0B1437] rounded-lg border border-[#D4AF37]/20">
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div>
                      <div className="text-sm text-white">{activity.type}</div>
                      <div className="text-xs text-[#F5DEB3]/50">{activity.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{activity.amount} {activity.asset}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
