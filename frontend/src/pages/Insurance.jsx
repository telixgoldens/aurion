import { Card } from "../ui/card";
import { Shield, TrendingUp, AlertCircle } from "lucide-react";

export default function Insurance() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Insurance</h1>
        <p className="text-sm text-[#F5DEB3]/70">Protocol insurance fund protecting depositors from bad debt</p>
      </div>

      {/* Insurance Fund Status */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm text-[#F5DEB3]/70">Total Coverage</h3>
          </div>
          <div className="text-2xl text-white mb-1">$3,250,000</div>
          <p className="text-xs text-[#F5DEB3]/50">Insurance fund balance</p>
        </Card>

        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm text-[#F5DEB3]/70">Coverage Ratio</h3>
          </div>
          <div className="text-2xl text-white mb-1">94.2%</div>
          <p className="text-xs text-[#F5DEB3]/50">Of outstanding debt insured</p>
        </Card>

        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm text-[#F5DEB3]/70">Fund Health</h3>
          </div>
          <div className="text-2xl text-emerald-400 mb-1">Excellent</div>
          <p className="text-xs text-[#F5DEB3]/50">Well capitalized</p>
        </Card>
      </div>

      {/* Coverage Breakdown */}
      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
        <h2 className="text-lg text-white mb-4">Coverage Breakdown</h2>
        <div className="space-y-4">
          {[
            { asset: "USDC Pool", coverage: "$1,180,000", percentage: 95 },
            { asset: "ETH Pool", coverage: "$820,000", percentage: 92 },
            { asset: "USDT Pool", coverage: "$645,000", percentage: 95 },
            { asset: "WBTC Pool", coverage: "$390,000", percentage: 90 },
            { asset: "DAI Pool", coverage: "$215,000", percentage: 95 },
          ].map((item) => (
            <div key={item.asset} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">{item.asset}</span>
                  <span className="text-sm text-[#F5DEB3]/70">{item.coverage}</span>
                </div>
                <div className="w-full h-2 bg-[#0B1437] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#D4AF37] rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-sm text-[#F5DEB3]/70 w-12 text-right">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </Card>

      {/* How Insurance Works */}
      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
        <h2 className="text-lg text-white mb-4">How Insurance Works</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
              <span className="text-sm text-[#D4AF37]">1</span>
            </div>
            <div>
              <h3 className="text-sm text-white mb-1">Insurance Fund Capitalization</h3>
              <p className="text-sm text-[#F5DEB3]/70">
                The insurance fund is capitalized through protocol fees and treasury allocations. 
                A portion of all borrowing fees is automatically directed to the insurance pool.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
              <span className="text-sm text-[#D4AF37]">2</span>
            </div>
            <div>
              <h3 className="text-sm text-white mb-1">Bad Debt Detection</h3>
              <p className="text-sm text-[#F5DEB3]/70">
                When a credit account becomes undercollateralized and liquidation doesn't fully cover the debt, 
                the remaining balance is classified as bad debt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
              <span className="text-sm text-[#D4AF37]">3</span>
            </div>
            <div>
              <h3 className="text-sm text-white mb-1">Insurance Activation</h3>
              <p className="text-sm text-[#F5DEB3]/70">
                The insurance fund automatically absorbs verified bad debt, protecting liquidity providers 
                from losses. This maintains depositor confidence and protocol stability.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
              <span className="text-sm text-[#D4AF37]">4</span>
            </div>
            <div>
              <h3 className="text-sm text-white mb-1">Fund Replenishment</h3>
              <p className="text-sm text-[#F5DEB3]/70">
                After covering losses, the fund is replenished through increased fee allocation until 
                it reaches the target coverage ratio. This ensures long-term sustainability.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Important Notice */}
      <div className="flex items-start gap-3 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
        <AlertCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[#F5DEB3] mb-1">Important Notice</p>
          <p className="text-xs text-[#F5DEB3]/70">
            While the insurance fund provides significant protection, it is not unlimited. 
            In extreme scenarios with catastrophic bad debt, depositors may experience losses 
            if the fund is depleted. Always assess your risk tolerance before depositing.
          </p>
        </div>
      </div>
    </div>
  );
}
