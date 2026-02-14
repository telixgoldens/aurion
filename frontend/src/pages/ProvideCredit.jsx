import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Card } from "../components/CoreUi";
import { Button } from "../components/CoreUi";
import { Input } from "../components/Inputs";
import { TrendingUp, Droplet, Shield, Info, Loader2, Wallet } from "lucide-react";
import CreditPool from "../abi/CreditPool.json"; 
import { getBrowserProvider, getSigner } from "../lib/eth";
import { getCreditManager, getUSDC, addresses } from "../lib/contracts";
import { useAlert, AlertModal } from "../components/AlertModal";

function ProvideCredit() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { alertState, showAlert, closeAlert } = useAlert();
  const [usdcBal, setUsdcBal] = useState(0);
  const [poolStats, setPoolStats] = useState({
    poolAddress: "",
    totalDeposits: 0,
    availableLiquidity: 0,
    totalDelegated: 0,
    utilization: 0, 
  });

  useEffect(() => {
    (async () => {
      if (!isConnected || !address || !window.ethereum) return;

      const provider = await getBrowserProvider();
      const usdc = getUSDC(provider);
      const bal = await usdc.balanceOf(address);
      setUsdcBal(Number(ethers.formatUnits(bal ?? 0n, 6)));
      const manager = getCreditManager(provider);
      const poolAddress = await manager.pool();
      const pool = new ethers.Contract(poolAddress, CreditPool, provider);

      const [td, al, tdel] = await Promise.all([
        pool.totalDeposits(),
        pool.availableLiquidity(),
        pool.totalDelegated(),
      ]);

      const totalDeposits = Number(ethers.formatUnits(td ?? 0n, 6));
      const availableLiquidity = Number(ethers.formatUnits(al ?? 0n, 6));
      const totalDelegated = Number(ethers.formatUnits(tdel ?? 0n, 6));

      const utilized = Math.max(0, totalDeposits - availableLiquidity);
      const utilization = totalDeposits > 0 ? utilized / totalDeposits : 0;

      setPoolStats({
        poolAddress,
        totalDeposits,
        availableLiquidity,
        totalDelegated,
        utilization,
      });
    })();
  }, [isConnected, address]);

  const depositAmount = parseFloat(amount) || 0;
  const baseRate = 0.04;
  const utilizationMultiplier = 0.10;
  const currentAPR = (baseRate + utilizationMultiplier * poolStats.utilization) * 100;
  const expectedYield = depositAmount * (currentAPR / 100);

  const handleDeposit = async () => {
    if (!isConnected || !address) return;
    if (!amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      const signer = await getSigner();

      const poolAddress = poolStats.poolAddress;
      if (!poolAddress) throw new Error("Pool address not available");

      const amountWei = ethers.parseUnits(amount.toString(), 6);
      const usdc = getUSDC(signer);
      const approveTx = await usdc.approve(poolAddress, amountWei);
      await approveTx.wait();
      const pool = new ethers.Contract(poolAddress, CreditPool, signer);
      const tx = await pool.deposit(amountWei);
      await tx.wait();
      const provider = await getBrowserProvider();
      const usdcRead = getUSDC(provider);
      const bal = await usdcRead.balanceOf(address);
      setUsdcBal(Number(ethers.formatUnits(bal ?? 0n, 6)));

      showAlert(`Successfully deposited ${amount} USDC into the Credit Pool.`, 'success', 'Deposit Successful');
      setAmount("");
    } catch (e) {
      console.error(e);
      showAlert(e?.shortMessage || e?.message || "Deposit failed", 'error', 'Deposit Failed');
    } finally {
      setLoading(false);
    }
  };

  const totalLiquidityUsd = poolStats.totalDeposits; 
  const utilizationPct = poolStats.utilization * 100;

  return (
    <div className="max-w-5xl space-y-6">
      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      <div>
        <h1 className="text-2xl text-white mb-2">Provide Delegated Credit</h1>
        <p className="text-sm text-[#d4af37]/70">Deposit into the protocol pool and earn yield.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4af37]/5 rounded-bl-full transition-all group-hover:bg-[#d4af37]/10"></div>
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <Droplet className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest">Total Liquidity</h3>
          </div>
          <div className="text-2xl text-white font-mono">
            ${totalLiquidityUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </Card>
        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4af37]/5 rounded-bl-full transition-all group-hover:bg-[#d4af37]/10"></div>
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Utilization</h3>
          </div>
          <div className="text-2xl text-white font-mono">{utilizationPct.toFixed(2)}%</div>
        </Card>
        <Card className="bg-[#0a0e17] border-[#d4af37]/20 p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#d4af37]/5 rounded-bl-full transition-all group-hover:bg-[#d4af37]/10"></div>
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <TrendingUp className="w-4 h-4 text-[#d4af37]" />
            <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-widest">Current APR</h3>
          </div>
          <div className="text-2xl text-white font-mono">{currentAPR.toFixed(2)}%</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-[#0a0e17] border-[#d4af37]/20 p-8">
          <h2 className="text-lg text-white mb-6 font-bold flex items-center gap-2">
            <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026" className="w-6 h-6" alt="USDC" />
            Deposit USDC
          </h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs text-gray-400">Amount</label>
                <span className="text-xs text-[#d4af37] flex items-center gap-1">
                  <Wallet size={12} />
                  Balance: {usdcBal.toFixed(2)} USDC
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-[#01060f] border-[#d4af37]/30 text-white text-3xl h-16 pr-24 focus:border-[#d4af37] transition-colors"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAmount(String(usdcBal))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] hover:bg-[#d4af37]/10 font-bold"
                >
                  MAX
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-[#01060f] rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Expected Yearly Yield</p>
                <p className="text-lg text-[#d4af37] font-mono">
                  ${expectedYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Active Rate</p>
                <p className="text-lg text-white font-mono">{currentAPR.toFixed(2)}%</p>
              </div>
            </div>
            <Button
              className="w-full bg-[#d4af37] hover:bg-[#b8860b] text-[#0a0e17] font-bold h-12 text-sm uppercase tracking-wider transition-all"
              disabled={!amount || Number(amount) <= 0 || loading || !isConnected}
              onClick={handleDeposit}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Droplet className="w-4 h-4 mr-2" />}
              {isConnected ? "Confirm Deposit" : "Connect Wallet to Deposit"}
            </Button>

            <div className="text-[10px] text-gray-500">
              Uses USDC at <span className="text-gray-400">{addresses.USDC}</span>
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="bg-[#d4af37]/5 border border-[#d4af37]/20 p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-[#d4af37] flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Protocol Insurance</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Insurance pool address: {addresses.INSURANCE_POOL}. Coverage percent depends on onchain rules.
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-[#01060f] border border-white/5 p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white mb-2">Pool Stats</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pool: {poolStats.poolAddress || "…"}
                  <br />
                  Available: {poolStats.availableLiquidity.toFixed(2)} USDC
                  <br />
                  Delegated: {poolStats.totalDelegated.toFixed(2)} USDC
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default ProvideCredit;