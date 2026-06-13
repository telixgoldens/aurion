import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { Card, Button } from "../components/CoreUi";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "../components/CoreUi";
import { Shield, TrendingUp, X } from "lucide-react";
import CreditPoolArtifact from "../abi/CreditPool.json";
import { useAlert, AlertModal } from "../components/AlertModal";
import { getCreditRouter, getCreditManager, getUSDC } from "../lib/contracts";
import { getBrowserProvider, getSigner } from "../lib/eth";
import { formatCurrency } from "../utils/format";
import { addresses } from "../lib/contracts";

const CreditPool = CreditPoolArtifact.abi;

function pct(n) {
  if (!Number.isFinite(n)) return "0.00%";
  return `${n.toFixed(2)}%`;
}
function safeDiv(a, b) {
  if (!b || b === 0) return 0;
  return a / b;
}

// ─── Deposit Modal ─────────────────────────────────────────────────────────────
function DepositModal({ open, onClose, onConfirm, loading, walletBalance }) {
  const [amount, setAmount] = useState("");
  if (!open) return null;

  const handleConfirm = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    onConfirm(amount);
    setAmount("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-[#0B1437] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-semibold">Deposit to Credit Pool</h2>
          <button onClick={onClose} className="text-[#F5DEB3]/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#F5DEB3]/60 mb-4">
          Depositing into the Aurion Credit Pool provides delegated liquidity
          that backs borrower credit limits. You earn fees from credit utilization.
        </p>
        <div className="mb-4">
          <label className="text-xs text-[#F5DEB3]/50 uppercase tracking-wider mb-1 block">
            Amount (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1a1f3a] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-lg font-semibold outline-none focus:border-[#D4AF37]/50 transition-colors pr-16"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#D4AF37] font-bold"
              onClick={() => setAmount(walletBalance.toString())}
            >
              MAX
            </button>
          </div>
          <div className="text-xs text-[#F5DEB3]/40 mt-1">
            Wallet balance: {formatCurrency(walletBalance)} USDC
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1 border border-[#D4AF37]/20 text-[#F5DEB3]/60 bg-transparent hover:bg-[#1a1f3a]"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-semibold disabled:opacity-60"
            onClick={handleConfirm}
            disabled={loading || !amount || Number(amount) <= 0}
          >
            {loading ? "Processing…" : "Deposit"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Withdraw Modal ────────────────────────────────────────────────────────────
function WithdrawModal({ open, onClose, onConfirm, loading, myDeposit }) {
  const [amount, setAmount] = useState("");
  if (!open) return null;

  const handleConfirm = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    onConfirm(amount);
    setAmount("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 bg-[#0B1437] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-semibold">Withdraw from Credit Pool</h2>
          <button onClick={onClose} className="text-[#F5DEB3]/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-[#F5DEB3]/60 mb-4">
          Withdraw your deposited USDC. You can only withdraw funds not currently
          backing active credit delegations.
        </p>
        <div className="mb-4">
          <label className="text-xs text-[#F5DEB3]/50 uppercase tracking-wider mb-1 block">
            Amount (USDC)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1a1f3a] border border-[#D4AF37]/20 rounded-lg px-4 py-3 text-white text-lg font-semibold outline-none focus:border-[#D4AF37]/50 transition-colors pr-16"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#D4AF37] font-bold"
              onClick={() => setAmount(myDeposit.toString())}
            >
              MAX
            </button>
          </div>
          <div className="text-xs text-[#F5DEB3]/40 mt-1">
            Your deposit: {formatCurrency(myDeposit)} USDC
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1 border border-[#D4AF37]/20 text-[#F5DEB3]/60 bg-transparent hover:bg-[#1a1f3a]"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-red-500/80 hover:bg-red-500 text-white font-semibold disabled:opacity-60"
            onClick={handleConfirm}
            disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > myDeposit}
          >
            {loading ? "Processing…" : "Withdraw"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function Pools({ onNavigate }) {
  const [account, setAccount]           = useState("");
  const [loading, setLoading]           = useState(false);
  const [depositOpen, setDepositOpen]   = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);   // NEW
  const [walletBalance, setWalletBalance] = useState(0);
  const { alertState, showAlert, closeAlert } = useAlert();

  const [routerInfo, setRouterInfo] = useState({
    creditManager: "",
    insurancePool: "",
    closeFactorBps: "",
  });

  const [credit, setCredit] = useState({
    creditLimit: 0,
    totalDebt: 0,
    available: 0,
    healthFactor: 0,
    collateralValue: 0,
  });

  const [poolLive, setPoolLive] = useState({
    poolAddress: "",
    assetSymbol: "USDC",
    assetName: "USD Coin",
    totalDepositsUsd: 0,
    availableLiquidityUsd: 0,
    utilizationPct: 0,
    totalDelegatedUsd: 0,
    myDeposit: 0,    // NEW
  });

  const pools = useMemo(() => [{
    asset: poolLive.assetSymbol,
    name: poolLive.assetName,
    totalLiquidity: formatCurrency(poolLive.totalDepositsUsd),
    utilization: pct(poolLive.utilizationPct),
    apr: "N/A",
    insuranceCoverage: "N/A",
    utilizationValue: poolLive.utilizationPct,
    _poolAddress: poolLive.poolAddress,
  }], [poolLive]);

  async function connect() {
    const signer = await getSigner();
    const addr   = await signer.getAddress();
    setAccount(addr);
    return signer;
  }

  async function refreshReads(userAddress) {
    const provider = await getBrowserProvider();
    const router   = getCreditRouter(provider);
    const [cmAddr, ipAddr, cfBps] = await Promise.all([
      router.creditManager(),
      router.insurancePool(),
      router.closeFactorBps(),
    ]);
    setRouterInfo({
      creditManager:  cmAddr,
      insurancePool:  ipAddr,
      closeFactorBps: cfBps?.toString?.() ?? String(cfBps),
    });

    const manager = getCreditManager(provider);
    const [poolAddress, debt, limit, health, collateral] = await Promise.all([
      manager.pool(),
      manager.totalDebt(userAddress),
      manager.creditLimit(userAddress),
      manager.healthFactor(userAddress),
      manager.collateralValue(userAddress),
    ]);

    const debtNum       = Number(ethers.formatUnits(debt       ?? 0n, 6));
    const limitNum      = Number(ethers.formatUnits(limit      ?? 0n, 6));
    const collateralNum = Number(ethers.formatUnits(collateral ?? 0n, 6));
    const healthNum     = Number(ethers.formatUnits(health     ?? 0n, 18));

    setCredit({
      totalDebt:       debtNum,
      creditLimit:     limitNum,
      available:       Math.max(0, limitNum - debtNum),
      collateralValue: collateralNum,
      healthFactor:    healthNum,
    });

    const pool = new ethers.Contract(poolAddress, CreditPool, provider);
    const [totalDeposits, availableLiquidity, totalDelegated, myDepositRaw] =
      await Promise.all([
        pool.totalDeposits(),
        pool.availableLiquidity(),
        pool.totalDelegated(),
        pool.depositOf(userAddress),    // NEW
      ]);

    const totalDepositsNum  = Number(ethers.formatUnits(totalDeposits      ?? 0n, 6));
    const availableLiqNum   = Number(ethers.formatUnits(availableLiquidity ?? 0n, 6));
    const totalDelegatedNum = Number(ethers.formatUnits(totalDelegated     ?? 0n, 6));
    const myDepositNum      = Number(ethers.formatUnits(myDepositRaw       ?? 0n, 6));  // NEW
    const utilized          = Math.max(0, totalDepositsNum - availableLiqNum);

    setPoolLive({
      poolAddress,
      assetSymbol: "USDC",
      assetName: "USD Coin",
      totalDepositsUsd:      totalDepositsNum,
      availableLiquidityUsd: availableLiqNum,
      totalDelegatedUsd:     totalDelegatedNum,
      utilizationPct:        safeDiv(utilized, totalDepositsNum) * 100,
      myDeposit:             myDepositNum,    // NEW
    });

    const usdc = new ethers.Contract(
      addresses.USDC,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );
    const bal = await usdc.balanceOf(userAddress);
    setWalletBalance(Number(ethers.formatUnits(bal, 6)));
  }

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = await getBrowserProvider();
      const accounts = await provider.send("eth_accounts", []);
      if (accounts?.[0]) {
        setAccount(accounts[0]);
        await refreshReads(accounts[0]);
      }
    })();
  }, []);

  async function handleDeposit(amountHuman) {
    setLoading(true);
    try {
      const signer      = account ? await getSigner() : await connect();
      const user        = await signer.getAddress();
      const provider    = await getBrowserProvider();
      const manager     = getCreditManager(provider);
      const poolAddress = await manager.pool();
      const usdc        = getUSDC(signer);
      const amountWei   = ethers.parseUnits(amountHuman.toString(), 6);

      const approveTx = await usdc.approve(poolAddress, amountWei);
      await approveTx.wait();

      const pool = new ethers.Contract(poolAddress, CreditPool, signer);
      const tx   = await pool.deposit(amountWei);
      await tx.wait();

      setDepositOpen(false);
      await refreshReads(user);
      showAlert("Deposit successful", "success", "Deposit Complete");
    } catch (e) {
      console.error(e);
      showAlert(e?.shortMessage || e?.message || "Deposit failed", "error");
    } finally {
      setLoading(false);
    }
  }

  // NEW ─── Withdraw handler ──────────────────────────────────────────────────
  async function handleWithdraw(amountHuman) {
    setLoading(true);
    try {
      const signer      = account ? await getSigner() : await connect();
      const user        = await signer.getAddress();
      const provider    = await getBrowserProvider();
      const manager     = getCreditManager(provider);
      const poolAddress = await manager.pool();
      const amountWei   = ethers.parseUnits(amountHuman.toString(), 6);

      // No approval needed — pool sends USDC to msg.sender directly
      const pool = new ethers.Contract(poolAddress, CreditPool, signer);
      const tx   = await pool.withdraw(amountWei);
      await tx.wait();

      setWithdrawOpen(false);
      await refreshReads(user);
      showAlert("Withdrawal successful", "success", "Withdrawal Complete");
    } catch (e) {
      console.error(e);
      showAlert(e?.shortMessage || e?.message || "Withdrawal failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl space-y-6">
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onConfirm={handleDeposit}
        loading={loading}
        walletBalance={walletBalance}
      />

      {/* NEW */}
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={handleWithdraw}
        loading={loading}
        myDeposit={poolLive.myDeposit}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white mb-2">Credit Pools</h1>
          <p className="text-sm text-[#F5DEB3]/70">
            Browse and deposit into available lending pools
          </p>
          <div className="mt-3 text-xs text-[#F5DEB3]/60 space-y-1">
            <div>
              Router creditManager{" "}
              <span className="text-white">{routerInfo.creditManager || "..."}</span>
            </div>
            <div>
              Router insurancePool{" "}
              <span className="text-white">{routerInfo.insurancePool || "..."}</span>
            </div>
            <div>
              Close factor bps{" "}
              <span className="text-white">{routerInfo.closeFactorBps || "..."}</span>
            </div>
            {account ? (
              <div className="pt-2 space-y-1">
                <div>Wallet <span className="text-white">{account}</span></div>
                <div>Credit limit <span className="text-white">{formatCurrency(credit.creditLimit)}</span></div>
                <div>Total debt <span className="text-white">{formatCurrency(credit.totalDebt)}</span></div>
                <div>Available <span className="text-white">{formatCurrency(credit.available)}</span></div>
                <div>Health factor <span className="text-white">{credit.healthFactor.toFixed(4)}</span></div>
                <div>Collateral value <span className="text-white">{formatCurrency(credit.collateralValue)}</span></div>
                <div>My pool deposit <span className="text-white">{formatCurrency(poolLive.myDeposit)}</span></div>
              </div>
            ) : (
              <div className="pt-2">
                <Button
                  size="sm"
                  className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium"
                  onClick={async () => {
                    const signer = await connect();
                    await refreshReads(await signer.getAddress());
                  }}
                >
                  Connect wallet
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1f3a] border border-[#D4AF37]/20 rounded-lg">
          <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm text-[#F5DEB3]/70">Total TVL</span>
          <span className="text-sm text-white">{formatCurrency(poolLive.totalDepositsUsd)}</span>
        </div>
      </div>

      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20">
        <Table>
          <TableHeader>
            <TableRow className="border-[#D4AF37]/20 hover:bg-transparent">
              <TableHead className="text-[#F5DEB3]/70">Asset</TableHead>
              <TableHead className="text-[#F5DEB3]/70">Total Liquidity</TableHead>
              <TableHead className="text-[#F5DEB3]/70">Utilization</TableHead>
              <TableHead className="text-[#F5DEB3]/70">APR</TableHead>
              <TableHead className="text-[#F5DEB3]/70">Insurance</TableHead>
              <TableHead className="text-[#F5DEB3]/70"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pools.map((pool) => (
              <TableRow key={pool.asset} className="border-[#D4AF37]/20 hover:bg-[#D4AF37]/5">
                <TableCell>
                  <div className="text-white font-medium">{pool.asset}</div>
                  <div className="text-xs text-[#F5DEB3]/50">{pool.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-white">{pool.totalLiquidity}</div>
                  <div className="text-[10px] text-[#F5DEB3]/50 mt-1">
                    Available {formatCurrency(poolLive.availableLiquidityUsd)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-white">{pool.utilization}</div>
                    <div className="w-24 h-1.5 bg-[#0B1437] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pool.utilizationValue > 70 ? "bg-[#D4AF37]" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(100, Math.max(0, pool.utilizationValue))}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-[#D4AF37] font-medium">{pool.apr}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-white">{pool.insuranceCoverage}</span>
                  </div>
                </TableCell>
                {/* NEW — two buttons side by side */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={loading}
                      className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-medium disabled:opacity-60"
                      onClick={() => setDepositOpen(true)}
                    >
                      Deposit
                    </Button>
                    <Button
                      size="sm"
                      disabled={loading || poolLive.myDeposit <= 0}
                      className="border border-[#D4AF37]/40 text-[#D4AF37] bg-transparent hover:bg-[#D4AF37]/10 font-medium disabled:opacity-40"
                      onClick={() => setWithdrawOpen(true)}
                    >
                      Withdraw
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="bg-[#1a1f3a] border-[#D4AF37]/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg mb-1">Mock Lending Markets</h2>
            <p className="text-sm text-[#F5DEB3]/60">
              Supply and borrow from Aave and Compound mock pools to build credit history.
            </p>
          </div>
          <Button
            className="bg-[#D4AF37] hover:bg-[#C19A2E] text-[#0B1437] font-semibold"
            onClick={() => onNavigate("markets")}
          >
            View Markets →
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Pools;