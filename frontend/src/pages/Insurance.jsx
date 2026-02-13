import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Card } from "../components/CoreUi";
import { Shield, TrendingUp, AlertCircle } from "lucide-react";
import CreditPool from "../abi/CreditPool.json"; 
import { getBrowserProvider } from "../lib/eth";
import { getCreditManager, getUSDC, addresses } from "../lib/contracts";
import { formatCurrency } from "../utils/format";

function classifyHealth(ratioPct) {
  if (ratioPct >= 25) return { label: "Excellent", cls: "text-emerald-400" };
  if (ratioPct >= 10) return { label: "Good", cls: "text-[#D4AF37]" };
  return { label: "Low", cls: "text-red-400" };
}

export default function Insurance() {
  const [fundBalance, setFundBalance] = useState(0);
  const [poolTvl, setPoolTvl] = useState(0);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;

      const provider = await getBrowserProvider();

      // USDC balance of insurance pool
      const usdc = getUSDC(provider);
      const bal = await usdc.balanceOf(addresses.INSURANCE_POOL);
      const balNum = Number(ethers.formatUnits(bal ?? 0n, 6));
      setFundBalance(balNum);

      // Pool TVL (from CreditManager.pool -> CreditPool.totalDeposits)
      const manager = getCreditManager(provider);
      const poolAddress = await manager.pool();
      const pool = new ethers.Contract(poolAddress, CreditPool.abi, provider);
      const tvl = await pool.totalDeposits();
      const tvlNum = Number(ethers.formatUnits(tvl ?? 0n, 6));
      setPoolTvl(tvlNum);
    })();
  }, []);

  // NOTE: this is fund vs pool deposits, not fund vs total outstanding debt.
  const ratioPct = useMemo(() => {
    if (!poolTvl) return 0;
    return (fundBalance / poolTvl) * 100;
  }, [fundBalance, poolTvl]);

  const health = useMemo(() => classifyHealth(ratioPct), [ratioPct]);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl text-white mb-2">Insurance</h1>
        <p className="text-sm text-[#F5DEB3]/70">Protocol insurance fund protecting depositors from bad debt</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-sm text-[#F5DEB3]/70">Total Coverage</h3>
          </div>
          <div className="text-2xl text-white mb-1">{formatCurrency(fundBalance)}</div>
          <p className="text-xs text-[#F5DEB3]/50">Insurance fund USDC balance</p>
        </Card>

        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm text-[#F5DEB3]/70">Coverage Ratio</h3>
          </div>
          <div className="text-2xl text-white mb-1">{ratioPct.toFixed(2)}%</div>
          <p className="text-xs text-[#F5DEB3]/50">Fund balance relative to pool deposits</p>
        </Card>

        <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm text-[#F5DEB3]/70">Fund Health</h3>
          </div>
          <div className={`text-2xl mb-1 ${health.cls}`}>{health.label}</div>
          <p className="text-xs text-[#F5DEB3]/50">Rule of thumb based on ratio</p>
        </Card>
      </div>

      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
        <h2 className="text-lg text-white mb-2">Coverage Breakdown</h2>
        <p className="text-sm text-[#F5DEB3]/70">
          Breakdown needs per pool debt and allocation on chain. Current contracts do not expose this, so it is not displayed yet.
        </p>
      </Card>

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
                When a credit account becomes undercollateralized and liquidation does not fully cover the debt, the remainder is bad debt.
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
                The fund absorbs verified bad debt, protecting liquidity providers from losses.
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
                After covering losses, the fund is replenished through fee allocation until targets are reached.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg">
        <AlertCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[#F5DEB3] mb-1">Important Notice</p>
          <p className="text-xs text-[#F5DEB3]/70">
            Insurance helps, but it is not unlimited. In extreme scenarios, depositors may experience losses if the fund is depleted.
          </p>
        </div>
      </div>
    </div>
  );
}
