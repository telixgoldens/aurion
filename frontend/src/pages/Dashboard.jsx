import { Card } from "../components/CoreUi";
import {
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useRouterActivity } from "../hooks/useRouterActivity";
import { formatCurrency, formatAddress } from "../utils/format";

const CREDIT_ROUTER_ADDRESS = import.meta.env.VITE_CREDIT_ROUTER;

function getTierMeta(tier) {
  switch (tier) {
    case "Conservative":
      return {
        color: "text-emerald-400",
        bar: "bg-emerald-500",
        hint: "Strong repayment profile and healthy account state",
      };
    case "Moderate":
      return {
        color: "text-blue-400",
        bar: "bg-blue-500",
        hint: "Balanced credit profile with manageable risk",
      };
    case "Aggressive":
      return {
        color: "text-orange-400",
        bar: "bg-orange-500",
        hint: "Higher leverage or weaker repayment profile",
      };
    default:
      return {
        color: "text-red-400",
        bar: "bg-red-500",
        hint: "Restricted account with elevated protocol risk",
      };
  }
}

function Dashboard() {
  const { data, refetch } = useDashboard();
  const {
    activity,
    loading: activityLoading,
    refetch: refetchActivity,
  } = useRouterActivity(CREDIT_ROUTER_ADDRESS);

  const limit = Number(data.limit || 0);
  const debt = Number(data.debt || 0);
  const available = Math.max(0, Number(data.available || 0));
  const collateralValue = Number(data.collateralValue || 0);
  const delegatedCredit = Number(data.delegatedCredit || 0);

  const score = Number(data.creditScore || 0);
  const tier = data.riskTier || "Restricted";
  const tierMeta = getTierMeta(tier);
  const scorePct = Math.max(0, Math.min(100, (score / 1000) * 100));

  const utilization = limit > 0 ? (debt / limit) * 100 : 0;

  const hf = Number(data.healthFactor || 0);
  const hfDisplay = !Number.isFinite(hf) ? 0 : hf;
  const isHealthy = hfDisplay >= 1;

  const utilizationLabel =
    utilization < 50
      ? "Safe: Below 50%"
      : utilization < 75
        ? "Caution: Above 50%"
        : "High Risk: Above 75%";

  const hfPct =
    hfDisplay >= 10 ? 100 : Math.max(0, Math.min(100, hfDisplay * 100));

  const creditOverview = [
    { label: "Credit Limit", value: formatCurrency(limit), icon: DollarSign },
    {
      label: "Outstanding Debt",
      value: formatCurrency(debt),
      icon: TrendingUp,
    },
    {
      label: "Available Credit",
      value: formatCurrency(available),
      icon: ArrowUpRight,
    },
  ];

  const refreshAll = () => {
    refetch();
    refetchActivity();
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-white/90">Credit Overview</h2>
          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-2 text-xs text-[#D4AF37] hover:text-[#b8860b] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditOverview.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                    <Icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="text-xs text-[#F5DEB3]/50">Live</div>
                </div>
                <div className="text-3xl text-white mb-1">{item.value}</div>
                <div className="text-sm text-[#F5DEB3]/70">{item.label}</div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg text-white/90 mb-4">Risk & Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-[#F5DEB3]/70">Credit Utilization</h3>
              <span className="text-xl text-white">
                {utilization.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${Math.min(100, utilization)}%` }}
              />
            </div>
            <p className="text-xs text-[#F5DEB3]/50 mt-2">{utilizationLabel}</p>
          </Card>

          <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-[#F5DEB3]/70">Health Factor</h3>
              <div className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-4 h-4 ${isHealthy ? "text-emerald-400" : "text-[#D4AF37]"}`}
                />
                <span className="text-xl text-white">
                  {hfDisplay > 1_000_000 ? "∞" : hfDisplay.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isHealthy ? "bg-emerald-500" : "bg-[#D4AF37]"}`}
                style={{ width: `${hfPct}%` }}
              />
            </div>
            <p className="text-xs text-[#F5DEB3]/50 mt-2">
              Liquidation when HF {"<"} 1.00 •{" "}
              <span
                className={isHealthy ? "text-emerald-400" : "text-[#D4AF37]"}
              >
                {isHealthy ? "Healthy" : "At risk"}
              </span>
            </p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-lg text-white/90 mb-4">Credit Scoring</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-[#F5DEB3]/70">Aurion Score</h3>
              <span className="text-xl text-white font-mono">{score}/1000</span>
            </div>

            <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden">
              <div
                className={`h-full ${tierMeta.bar} rounded-full`}
                style={{ width: `${scorePct}%` }}
              />
            </div>

            <p className="text-xs text-[#F5DEB3]/50 mt-2">
              Tier <span className={`font-semibold ${tierMeta.color}`}>{tier}</span>{" "}
              • {tierMeta.hint}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg bg-[#0B1437] p-3 border border-[#D4AF37]/10">
                <div className="text-[10px] text-[#F5DEB3]/50 uppercase tracking-wide">
                  Borrow Count
                </div>
                <div className="text-white text-lg mt-1">{data.borrows}</div>
              </div>

              <div className="rounded-lg bg-[#0B1437] p-3 border border-[#D4AF37]/10">
                <div className="text-[10px] text-[#F5DEB3]/50 uppercase tracking-wide">
                  Repay Count
                </div>
                <div className="text-white text-lg mt-1">{data.repays}</div>
              </div>

              <div className="rounded-lg bg-[#0B1437] p-3 border border-[#D4AF37]/10">
                <div className="text-[10px] text-[#F5DEB3]/50 uppercase tracking-wide">
                  Liquidations
                </div>
                <div className="text-white text-lg mt-1">{data.liquidations}</div>
              </div>

              <div className="rounded-lg bg-[#0B1437] p-3 border border-[#D4AF37]/10">
                <div className="text-[10px] text-[#F5DEB3]/50 uppercase tracking-wide">
                  Status
                </div>
                <div
                  className={`text-lg mt-1 ${data.isFrozen ? "text-red-400" : "text-emerald-400"}`}
                >
                  {data.isFrozen ? "Frozen" : "Active"}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
            <h3 className="text-sm text-[#F5DEB3]/70 mb-3">Score Benefits</h3>

            <ul className="space-y-2 text-xs text-[#F5DEB3]/60">
              <li className="flex items-center justify-between">
                <span>Lower fees</span>
                <span className="text-white">
                  {tier === "Conservative"
                    ? "Yes"
                    : tier === "Moderate"
                      ? "Partial"
                      : "No"}
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span>Higher borrow limits</span>
                <span className="text-white">
                  {tier === "Conservative"
                    ? "High"
                    : tier === "Moderate"
                      ? "Medium"
                      : "Low"}
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span>Delegated allocation</span>
                <span className="text-white">
                  {tier === "Conservative"
                    ? "Priority"
                    : tier === "Moderate"
                      ? "Normal"
                      : "Limited"}
                </span>
              </li>

              <li className="flex items-center justify-between">
                <span>Early access</span>
                <span className="text-white">
                  {tier === "Conservative" ? "Enabled" : "—"}
                </span>
              </li>
            </ul>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0B1437] border border-[#D4AF37]/10">
                <Shield className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                <div>
                  <div className="text-xs text-white">Collateral Contribution</div>
                  <div className="text-sm text-[#F5DEB3]/70">
                    {formatCurrency(collateralValue)}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#0B1437] border border-[#D4AF37]/10">
                <Activity className="w-4 h-4 text-[#D4AF37] mt-0.5" />
                <div>
                  <div className="text-xs text-white">Delegated Credit</div>
                  <div className="text-sm text-[#F5DEB3]/70">
                    {formatCurrency(delegatedCredit)}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[10px] text-[#F5DEB3]/40">
              Live onchain scoring from CreditManager.
            </p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="text-lg text-white/90 mb-4">Recent Activity</h2>
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20">
          <div className="divide-y divide-[#D4AF37]/10">
            {activityLoading && (
              <div className="p-4 text-sm text-[#F5DEB3]/60">
                Loading onchain activity…
              </div>
            )}

            {!activityLoading && activity.length === 0 && (
              <div className="p-4 text-sm text-[#F5DEB3]/60">
                No onchain activity found (router logs).
              </div>
            )}

            {!activityLoading &&
              activity.map((a) => (
                <div
                  key={`${a.txHash}-${a.blockNumber}`}
                  className="flex items-center justify-between p-4 hover:bg-[#D4AF37]/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#0B1437] rounded-lg border border-[#D4AF37]/20">
                      <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="text-sm text-white">
                        Liquidated{" "}
                        <span className="text-xs text-[#F5DEB3]/60">
                          ({a.role})
                        </span>
                      </div>
                      <div className="text-xs text-[#F5DEB3]/50">
                        {a.timestamp} • Asset {formatAddress(a.asset)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-white">
                      Repay {a.repayAmount} • Seize {a.seizeAmount}
                    </div>
                    <div className="text-xs text-[#F5DEB3]/50">
                      {formatAddress(a.txHash)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

export default Dashboard;